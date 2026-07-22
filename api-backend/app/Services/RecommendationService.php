<?php

namespace App\Services;

use App\Algorithms\Contracts\SimilarityCalculatorInterface;
use App\Algorithms\Matching\HaversineDistance;
use App\Models\Task;
use App\Models\VolunteerProfile;
use Illuminate\Database\Eloquent\Collection;

class RecommendationService
{
    public function __construct(
        private SimilarityCalculatorInterface $similarity,
        private HaversineDistance $distance,
        private TrustScoreService $trustService
    ) {}

    public function computeAllScores(
        VolunteerProfile $volunteer,
        Task $task
    ): array {
        $volunteer->loadMissing('skills');
        $task->loadMissing('skills');

        $semanticScore = $this->semanticMatchScore($volunteer, $task);
        $distanceScore = $this->geographicDistanceScore($volunteer, $task);
        $skillScore = $this->skillOverlapScore($volunteer, $task);
        $availabilityScore = $this->availabilityOverlapScore($volunteer, $task);
        $trustScore = $this->getTrustScore($volunteer);

        $finalScore = $this->weightedScore(
            $semanticScore,
            $distanceScore,
            $skillScore,
            $availabilityScore,
            $trustScore
        );

        return [
            'recommendation_score' => round($finalScore * 100, 1),
            'semantic_match_score' => round($semanticScore, 4),
            'distance_score' => round($distanceScore, 4),
            'skill_overlap_score' => round($skillScore, 4),
            'availability_score' => round($availabilityScore, 4),
            'trust_score' => round($trustScore, 4),
        ];
    }

    public function computeVolunteerTaskScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        $scores = $this->computeAllScores($volunteer, $task);
        return $scores['recommendation_score'] / 100;
    }

    public function computeVolunteerTaskMatchScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        return $this->computeAllScores($volunteer, $task)['recommendation_score'];
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

    public function rankVolunteersForTask(Task $task): Collection
    {
        $task->loadMissing('skills');

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
            $scores = $this->computeAllScores($volunteer, $task);
            $volunteer->recommendation_score = $scores['recommendation_score'];
            $volunteer->semantic_match_score = $scores['semantic_match_score'];
            $volunteer->distance_score = $scores['distance_score'];
            $volunteer->skill_overlap_score = $scores['skill_overlap_score'];
            $volunteer->availability_score = $scores['availability_score'];
            $volunteer->trust_score = $scores['trust_score'];
        });

        return $volunteers->sortByDesc('recommendation_score')->values();
    }

    public function rankTasksForVolunteer(
        VolunteerProfile $volunteer,
        array $filters = []
    ): Collection {
        $volunteer->loadMissing('skills');

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

        $tasks->each(function ($task) use ($volunteer) {
            $scores = $this->computeAllScores($volunteer, $task);
            $task->recommendation_score = $scores['recommendation_score'];
            $task->match_score = $scores['recommendation_score'];
            $task->semantic_match_score = $scores['semantic_match_score'];
            $task->distance_score = $scores['distance_score'];
            $task->skill_overlap_score = $scores['skill_overlap_score'];
            $task->availability_score = $scores['availability_score'];
            $task->trust_score = $scores['trust_score'];
        });

        return $tasks->sortByDesc('recommendation_score')->values();
    }

    private function semanticMatchScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        return $this->similarity->calculate(
            $volunteer->tfidf_vector ?? [],
            $task->tfidf_vector ?? []
        );
    }

    private function geographicDistanceScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        if (
            !$volunteer->latitude ||
            !$volunteer->longitude ||
            !$task->latitude ||
            !$task->longitude
        ) {
            return 0.5;
        }

        $km = $this->distance->calculate(
            $volunteer->latitude,
            $volunteer->longitude,
            $task->latitude,
            $task->longitude
        );

        return max(0, min(1, 1 - ($km / 500)));
    }

    private function skillOverlapScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        $volunteerSkills = $volunteer->skills->pluck('id')->toArray();
        $taskSkills = $task->skills->pluck('id')->toArray();

        if (empty($taskSkills)) {
            return 0.5;
        }

        if (empty($volunteerSkills)) {
            return 0;
        }

        $intersection = array_intersect($volunteerSkills, $taskSkills);
        $union = array_unique(array_merge($volunteerSkills, $taskSkills));

        $jaccard = count($intersection) / max(count($union), 1);

        $requiredCoverage = count($intersection) / max(count($taskSkills), 1);

        return (0.5 * $jaccard) + (0.5 * $requiredCoverage);
    }

    private function availabilityOverlapScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        $volAvailability = $volunteer->availability;

        if (
            $volAvailability &&
            in_array($volAvailability, ['Unavailable', 'Busy'])
        ) {
            return 0.1;
        }

        $taskStart = $task->start_date;
        $taskEnd = $task->end_date;

        if (!$taskStart && !$taskEnd) {
            return $volAvailability === 'Available' ? 1.0 : 0.8;
        }

        $now = now();

        if ($taskStart && $taskStart->isPast() && $taskEnd && $taskEnd->isPast()) {
            return 0.3;
        }

        if ($taskStart && $taskStart->isPast() && (!$taskEnd || $taskEnd->isFuture())) {
            return 0.7;
        }

        if ($taskStart && $taskStart->isFuture()) {
            return 0.9;
        }

        return 0.5;
    }

    private function weightedScore(
        float $semantic,
        float $distance,
        float $skill,
        float $availability,
        float $trust
    ): float {
        $w = config('workflow.strategies.recommendation.weights', [
            'semantic' => 0.30, 'distance' => 0.20, 'skill' => 0.20,
            'availability' => 0.10, 'trust' => 0.20,
        ]);

        return min(1.0, max(0.01,
            ($w['semantic'] * $semantic) +
            ($w['distance'] * $distance) +
            ($w['skill'] * $skill) +
            ($w['availability'] * $availability) +
            ($w['trust'] * $trust)
        ));
    }
}
