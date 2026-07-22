<?php

namespace App\Services;

use App\Algorithms\Contracts\SimilarityCalculatorInterface;
use App\Algorithms\Matching\HaversineDistance;
use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\Ranking\Ranker;

class MatchingService
{
    public function __construct(
        private SimilarityCalculatorInterface $similarity,
        private HaversineDistance $distance,
        private RecommendationService $recommendation,
        private ?Ranker $ranker = null
    ) {}

    public function rankTasksForVolunteer(VolunteerProfile $volunteer, array $filters = [])
    {
        return $this->recommendation->rankTasksForVolunteer($volunteer, $filters);
    }

    public function rankVolunteersForTask(Task $task)
    {
        return $this->recommendation->rankVolunteersForTask($task);
    }

    public function rankTasksWithStrategy(VolunteerProfile $volunteer, ?string $strategy = null, array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $strategy = $strategy ?? config('workflow.default_strategy', 'recommendation');
        $tasks = $this->recommendation->rankTasksForVolunteer($volunteer, $filters);

        $tasks->each(function ($task) use ($volunteer, $strategy) {
            $scores = [
                'semantic_match_score' => $task->semantic_match_score ?? 0,
                'distance_score' => $task->distance_score ?? 0,
                'skill_overlap_score' => $task->skill_overlap_score ?? 0,
                'availability_score' => $task->availability_score ?? 0,
                'trust_score' => $task->trust_score ?? 0.5,
            ];
            $strategyScore = $this->ranker
                ? $this->ranker->score($scores, $strategy)
                : app(Ranker::class)->score($scores, $strategy);
            $task->strategy_score = round($strategyScore * 100, 1);
            $task->strategy_used = $strategy;
        });

        return $tasks->sortByDesc('strategy_score')->values();
    }

    public function rankVolunteersWithStrategy(Task $task, ?string $strategy = null): \Illuminate\Database\Eloquent\Collection
    {
        $strategy = $strategy ?? config('workflow.default_strategy', 'recommendation');
        $volunteers = $this->recommendation->rankVolunteersForTask($task);

        $volunteers->each(function ($v) use ($strategy) {
            $scores = [
                'semantic_match_score' => $v->semantic_match_score ?? 0,
                'distance_score' => $v->distance_score ?? 0,
                'skill_overlap_score' => $v->skill_overlap_score ?? 0,
                'availability_score' => $v->availability_score ?? 0,
                'trust_score' => $v->trust_score ?? 0.5,
            ];
            $strategyScore = $this->ranker
                ? $this->ranker->score($scores, $strategy)
                : app(Ranker::class)->score($scores, $strategy);
            $v->strategy_score = round($strategyScore * 100, 1);
            $v->strategy_used = $strategy;
        });

        return $volunteers->sortByDesc('strategy_score')->values();
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
