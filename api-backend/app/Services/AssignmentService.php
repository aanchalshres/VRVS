<?php

declare(strict_types=1);

namespace App\Services;

use App\Algorithms\Contracts\AssignmentSolverInterface;
use App\Models\Application;
use App\Models\Task;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AssignmentService
{
    public function __construct(
        private MatchingService $matchingService,
        private AssignmentSolverInterface $solver,
    ) {}

    /**
     * @param int[] $applicationIds
     * @param int[] $taskIds
     * @return array<int, array{application_id: int, volunteer_id: int, volunteer_name: ?string, task_id: int, task_title: string, match_score: float, status: string, assigned_at: string}>
     */
    public function batchAssign(array $applicationIds, array $taskIds): array
    {
        $applications = Application::whereIn('id', $applicationIds)
            ->with(['volunteer.user'])
            ->get();

        $tasks = Task::whereIn('id', $taskIds)
            ->whereNotNull('tfidf_vector')
            ->get();

        $volunteers = $applications
            ->map(fn (Application $application) => $application->volunteer)
            ->filter()
            ->values();

        if ($volunteers->isEmpty() || $tasks->isEmpty()) {
            return [];
        }

        $costMatrix = [];

        foreach ($volunteers as $i => $volunteer) {
            foreach ($tasks as $j => $task) {
                $score = $this->matchingService
                    ->calculateVolunteerTaskScore($volunteer, $task);

                $costMatrix[$i][$j] = 1 - $score;
            }
        }

        $size = max(count($volunteers), count($tasks));

        for ($i = 0; $i < $size; $i++) {
            for ($j = 0; $j < $size; $j++) {
                $costMatrix[$i][$j] = $costMatrix[$i][$j] ?? 1;
            }
        }

        $assignments = $this->solver->solve($costMatrix);

        try {
            DB::beginTransaction();

            $result = [];

            foreach ($assignments as $volunteerIndex => $taskIndex) {
                $volunteer = $volunteers[$volunteerIndex] ?? null;
                $task = $tasks[$taskIndex] ?? null;

                if (!$volunteer || !$task) {
                    continue;
                }

                $matchingApplication = $applications->first(
                    fn (Application $app) => $app->volunteer_profile_id === $volunteer->id
                        && $app->task_id === $task->id
                );

                if (!$matchingApplication) {
                    continue;
                }

                $matchingApplication->updateOrFail([
                    'status' => 'Accepted',
                    'reviewed_at' => now(),
                ]);

                $matchScore = round(1 - $costMatrix[$volunteerIndex][$taskIndex], 3);

                $result[] = [
                    'application_id'   => $matchingApplication->id,
                    'volunteer_id'     => $volunteer->id,
                    'volunteer_name'   => $volunteer->user->name ?? null,
                    'task_id'          => $task->id,
                    'task_title'       => $task->title,
                    'match_score'      => $matchScore,
                    'status'           => 'Accepted',
                    'assigned_at'      => now()->toIso8601String(),
                ];
            }

            DB::commit();

            return $result;

        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Batch assignment failed', [
                'application_ids' => $applicationIds,
                'task_ids'        => $taskIds,
                'error'           => $e->getMessage(),
                'trace'           => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
