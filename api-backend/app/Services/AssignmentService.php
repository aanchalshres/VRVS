<?php

namespace App\Services;

use App\Algorithms\Contracts\AssignmentSolverInterface;
use App\Models\Application;
use App\Models\Task;


class AssignmentService
{
    public function __construct(
        private MatchingService $matchingService,
        private AssignmentSolverInterface $solver,
        private ApplicationService $applicationService,
    ) {}

    public function batchAssign(array $applicationIds, array $taskIds): array
    {
        $applications = Application::whereIn('id', $applicationIds)
            ->with(['volunteer.user'])
            ->get();

        $tasks = Task::whereIn('id', $taskIds)
            ->whereNotNull('tfidf_vector')
            ->get();

        $volunteers = $applications
            ->map(fn ($application) => $application->volunteer)
            ->filter()
            ->values();

        if ($volunteers->isEmpty() || $tasks->isEmpty()) {
            return [];
        }

        // Build the cost matrix using MatchingService
        $costMatrix = [];

        foreach ($volunteers as $i => $volunteer) {
            foreach ($tasks as $j => $task) {
                $score = $this->matchingService
                    ->calculateVolunteerTaskScore($volunteer, $task);

                // Hungarian minimizes cost
                $costMatrix[$i][$j] = 1 - $score;
            }
        }

        // Hungarian requires square matrix
        $size = max(count($volunteers), count($tasks));

        for ($i = 0; $i < $size; $i++) {
            for ($j = 0; $j < $size; $j++) {
                $costMatrix[$i][$j] = $costMatrix[$i][$j] ?? 1;
            }
        }

        $assignments = $this->solver->solve($costMatrix);

        $result = [];

        foreach ($assignments as $volunteerIndex => $taskIndex) {

            $volunteer = $volunteers[$volunteerIndex] ?? null;
            $task = $tasks[$taskIndex] ?? null;

            if (!$volunteer || !$task) {
                continue;
            }

            // Leave commented until ApplicationService::accept() exists
            // $this->applicationService->accept($volunteer, $task);

            $result[] = [
                'volunteer_id'   => $volunteer->id,
                'volunteer_name' => $volunteer->user->name ?? null,
                'task_id'        => $task->id,
                'task_title'     => $task->title,
                'score'          => round(
                    1 - $costMatrix[$volunteerIndex][$taskIndex],
                    3
                ),
            ];
        }

        return $result;
    }
}
