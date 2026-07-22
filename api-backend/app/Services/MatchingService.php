<?php

namespace App\Services;

use App\Algorithms\Contracts\SimilarityCalculatorInterface;
use App\Algorithms\Matching\HaversineDistance;
use App\Models\Task;
use App\Models\VolunteerProfile;

class MatchingService
{
    public function __construct(
        private SimilarityCalculatorInterface $similarity,
        private HaversineDistance $distance,
        private RecommendationService $recommendation
    ) {}

    public function rankTasksForVolunteer(VolunteerProfile $volunteer, array $filters = [])
    {
        return $this->recommendation->rankTasksForVolunteer($volunteer, $filters);
    }

    public function rankVolunteersForTask(Task $task)
    {
        return $this->recommendation->rankVolunteersForTask($task);
    }

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

    public function calculateVolunteerTaskScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        return $this->recommendation->computeVolunteerTaskScore($volunteer, $task);
    }

    public function calculateVolunteerTaskMatchScore(
        VolunteerProfile $volunteer,
        Task $task
    ): float {
        return $this->recommendation->computeVolunteerTaskMatchScore($volunteer, $task);
    }
}
