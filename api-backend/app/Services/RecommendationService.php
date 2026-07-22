<?php

namespace App\Services;

use App\Algorithms\Contracts\SimilarityCalculatorInterface;
use App\Algorithms\Matching\HaversineDistance;
use App\Models\Task;
use App\Models\VolunteerProfile;
use Illuminate\Database\Eloquent\Collection;

class RecommendationService
{
    private const SKILL_WEIGHT = 0.5;
    private const DISTANCE_WEIGHT = 0.3;
    private const TRUST_WEIGHT = 0.2;

    public function __construct(
        private SimilarityCalculatorInterface $similarity,
        private HaversineDistance $distance,
        private TrustScoreService $trustService
    ) {}

    public function computeVolunteerTaskScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        $skillScore = $this->similarity->calculate(
            $volunteer->tfidf_vector ?? [],
            $task->tfidf_vector ?? []
        );

        $distanceScore = 0;
        if (
            $volunteer->latitude &&
            $volunteer->longitude &&
            $task->latitude &&
            $task->longitude
        ) {
            $km = $this->distance->calculate(
                $volunteer->latitude,
                $volunteer->longitude,
                $task->latitude,
                $task->longitude
            );
            $distanceScore = max(0, 1 - ($km / 500));
        }

        $trustScore = $this->getTrustScore($volunteer);

        return
            (self::SKILL_WEIGHT * $skillScore) +
            (self::DISTANCE_WEIGHT * $distanceScore) +
            (self::TRUST_WEIGHT * $trustScore);
    }

    public function getTrustScore(VolunteerProfile $volunteer): float
    {
        if (
            !$volunteer->trust_updated_at ||
            $volunteer->trust_updated_at->diffInHours(now()) > 1
        ) {
            $this->trustService->recalculate($volunteer);
        }

        return $volunteer->fresh()->trust_score ?? 0.5;
    }

    public function computeVolunteerTaskMatchScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        return round($this->computeVolunteerTaskScore($volunteer, $task) * 100, 1);
    }

    public function rankVolunteersForTask(Task $task): Collection
    {
        $volunteers = VolunteerProfile::with(['user', 'skills'])
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
            })
            ->whereNotNull('tfidf_vector')
            ->where('tfidf_vector', '!=', '[]')
            ->whereDoesntHave('applications', function ($q) use ($task) {
                $q->where('task_id', $task->id)
                  ->whereIn('status', ['Pending', 'Shortlisted', 'Accepted']);
            })
            ->get();

        $volunteers->each(function ($volunteer) use ($task) {
            $score = $this->computeVolunteerTaskMatchScore($volunteer, $task);
            $volunteer->recommendation_score = $score;
            $volunteer->trust_score = $this->getTrustScore($volunteer);
        });

        return $volunteers->sortByDesc('recommendation_score')->values();
    }

    public function rankTasksForVolunteer(
        VolunteerProfile $volunteer,
        array $filters = []
    ): Collection {
        $query = Task::whereIn('status', ['Open', 'Ongoing'])
            ->whereHas('ngo', function ($q) {
                $q->where('verification_status', 'verified');
            })
            ->whereNotNull('tfidf_vector')
            ->where('tfidf_vector', '!=', '[]')
            ->with(['ngo.user', 'skills']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['urgency_level'])) {
            $query->where('urgency_level', $filters['urgency_level']);
        }

        if (!empty($filters['task_type'])) {
            $query->where('task_type', $filters['task_type']);
        }

        if (!empty($filters['location'])) {
            $query->where(function ($q) use ($filters) {
                $loc = $filters['location'];
                $q->where('location', 'like', "%{$loc}%")
                  ->orWhere('city', 'like', "%{$loc}%")
                  ->orWhere('country', 'like', "%{$loc}%");
            });
        }

        if (!empty($filters['skill'])) {
            $query->whereHas('skills', function ($q) use ($filters) {
                $q->where('skills.name', 'like', "%{$filters['skill']}%");
            });
        }

        if (!empty($filters['date_from'])) {
            $query->where('start_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('end_date', '<=', $filters['date_to']);
        }

        $tasks = $query->get();

        $trustScore = $this->getTrustScore($volunteer);

        $tasks->each(function ($task) use ($volunteer, $trustScore) {
            $score = $this->computeVolunteerTaskMatchScore($volunteer, $task);
            $task->recommendation_score = $score;
            $task->match_score = $score;
            $task->trust_score = $trustScore;
        });

        return $tasks->sortByDesc('recommendation_score')->values();
    }
}
