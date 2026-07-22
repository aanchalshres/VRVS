<?php

namespace App\Services;

use App\Algorithms\Contracts\SimilarityCalculatorInterface;
use App\Algorithms\Matching\HaversineDistance;
use App\Models\Task;
use App\Models\VolunteerProfile;

class MatchingService
{
    private const SKILL_WEIGHT = 0.5;
    private const DISTANCE_WEIGHT = 0.3;
    private const TRUST_WEIGHT = 0.2;

    public function __construct(
        private SimilarityCalculatorInterface $similarity,
        private HaversineDistance $distance
    ) {}

    /**
     * Rank tasks for a volunteer.
     */
    public function rankTasksForVolunteer(VolunteerProfile $volunteer, array $filters = [])
    {
        $query = Task::whereIn('status', ['Open', 'Ongoing'])
            ->whereHas('ngo', function ($query) {
                $query->where('verification_status', 'verified');
            })
            ->whereNotNull('tfidf_vector')
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

        return $tasks
            ->map(function ($task) use ($volunteer) {

                $skillScore = empty($volunteer->tfidf_vector)
                    ? 0
                    : $this->similarity->calculate(
                        $volunteer->tfidf_vector,
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

                $trustScore = $volunteer->trust_score ?? 0.5;

                $task->match_score = round(
                    $this->calculateScore(
                        $skillScore,
                        $distanceScore,
                        $trustScore
                    ) * 100,
                    1
                );

                return $task;
            })
            ->sortByDesc('match_score')
            ->values();
    }

    /**
     * Basic NGO-side ranking.
     * Phase 1: order applicants by application date.
     */
    public function rankVolunteersForTask(Task $task)
    {
        return $task->applications()
            ->with('volunteer.user')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get one task if it belongs to a verified NGO.
     */
    public function getTaskDetail(int $taskId): Task
    {
        return Task::with([
                'ngo.user',
                'skills',
                'category',
            ])
            ->whereHas('ngo', function ($query) {
                $query->where('verification_status', 'verified');
            })
            ->findOrFail($taskId);
    }

    private function calculateScore(
        float $skill,
        float $distance,
        float $trust
    ): float {

        return
            (self::SKILL_WEIGHT * $skill) +
            (self::DISTANCE_WEIGHT * $distance) +
            (self::TRUST_WEIGHT * $trust);
    }


    public function calculateVolunteerTaskScore(
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

    $trustScore = $volunteer->trust_score ?? 0.5;

    return $this->calculateScore(
        $skillScore,
        $distanceScore,
        $trustScore
    );
}
}
