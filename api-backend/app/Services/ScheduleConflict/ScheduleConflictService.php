<?php

namespace App\Services\ScheduleConflict;

use App\Algorithms\Contracts\ConflictDetectionInterface;
use App\Models\Application;
use App\Models\ScheduleConflict;
use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\DB;

class ScheduleConflictService implements ConflictDetectionInterface
{
    public function __construct(
        private TimeOverlapService $timeOverlap,
        private TravelTimeService $travelTime,
        private ConflictResolutionService $resolutionService,
        private ActivityLogService $activityLog,
    ) {}

    public function checkTask(int $volunteerProfileId, int $taskId): array
    {
        $task = Task::findOrFail($taskId);
        $conflicts = [];

        $commitments = $this->getActiveCommitments($volunteerProfileId, $taskId);

        foreach ($commitments as $commitment) {
            $conflict = $this->detectConflict($task, $commitment['task'], $volunteerProfileId);
            if ($conflict && $conflict['has_conflict']) {
                $this->persistConflict(
                    $volunteerProfileId, $taskId,
                    $commitment['task']->id, $conflict
                );
                $conflicts[] = $conflict;
            }
        }

        return [
            'volunteer_profile_id' => $volunteerProfileId,
            'task_id' => $taskId,
            'has_conflicts' => count($conflicts) > 0,
            'conflict_count' => count($conflicts),
            'conflicts' => $conflicts,
            'checked_commitments' => count($commitments),
        ];
    }

    public function checkVolunteerSchedule(VolunteerProfile $profile, ?\DateTime $from = null, ?\DateTime $to = null): array
    {
        $commitments = $this->getActiveCommitments($profile->id);

        $schedule = [];
        foreach ($commitments as $commitment) {
            $task = $commitment['task'];
            $schedule[] = [
                'task_id' => $task->id,
                'title' => $task->title,
                'start_date' => $task->start_date,
                'end_date' => $task->end_date,
                'status' => $commitment['status'],
                'application_id' => $commitment['application_id'],
            ];
        }

        if ($from || $to) {
            $schedule = array_filter($schedule, function ($s) use ($from, $to) {
                $taskStart = $s['start_date'] ? new \DateTime($s['start_date']) : null;
                $taskEnd = $s['end_date'] ? new \DateTime($s['end_date']) : $taskStart;
                if ($from && $taskEnd && $taskEnd < $from) return false;
                if ($to && $taskStart && $taskStart > $to) return false;
                return true;
            });
            $schedule = array_values($schedule);
        }

        $conflicts = [];
        for ($i = 0; $i < count($schedule); $i++) {
            for ($j = $i + 1; $j < count($schedule); $j++) {
                $taskA = Task::find($schedule[$i]['task_id']);
                $taskB = Task::find($schedule[$j]['task_id']);
                if (!$taskA || !$taskB) continue;

                $conflict = $this->detectConflict($taskA, $taskB, $profile->id);
                if ($conflict && $conflict['has_conflict']) {
                    $conflicts[] = $conflict;
                }
            }
        }

        return [
            'volunteer_profile_id' => $profile->id,
            'total_commitments' => count($schedule),
            'schedule' => array_values($schedule),
            'internal_conflicts' => $conflicts,
            'conflict_count' => count($conflicts),
        ];
    }

    public function resolve(int $conflictId, string $resolution, int $resolvedBy): array
    {
        $conflict = $this->resolutionService->resolve($conflictId, $resolution, $resolvedBy);
        return [
            'message' => 'Conflict resolved',
            'conflict_id' => $conflict->id,
            'resolution' => $conflict->resolution,
        ];
    }

    public function detectConflict(Task $taskA, Task $taskB, int $volunteerProfileId): ?array
    {
        $overlap = $this->timeOverlap->calculateOverlap(
            $taskA->start_date, $taskA->end_date,
            $taskB->start_date, $taskB->end_date
        );

        if (!$overlap['has_overlap']) {
            $buffer = config('schedule-conflict.buffer_minutes', 30);
            if ($overlap['gap_minutes'] !== null && $overlap['gap_minutes'] >= $buffer) {
                return null;
            }
            if ($overlap['gap_minutes'] === null) return null;
        }

        $travelTime = $this->travelTime->estimateMinutes(
            $taskA->latitude, $taskA->longitude,
            $taskB->latitude, $taskB->longitude
        );

        $travelDistance = $this->travelTime->distanceKm(
            $taskA->latitude, $taskA->longitude,
            $taskB->latitude, $taskB->longitude
        );

        $buffer = config('schedule-conflict.buffer_minutes', 30);
        $bufferViolation = $overlap['has_overlap']
            ? true
            : ($overlap['gap_minutes'] !== null && ($overlap['gap_minutes'] + $travelTime) < $buffer);

        $score = $overlap['overlap_ratio'];
        if ($travelTime > 0 && $bufferViolation) {
            $travelPenalty = min(1.0, $travelTime / 120);
            $score = min(1.0, $score + ($travelPenalty * 0.3));
        }

        $maxDistance = config('schedule-conflict.max_travel_distance_km', 50);
        if ($travelDistance !== null && $travelDistance > $maxDistance) {
            $score = min(1.0, $score + 0.2);
        }

        return [
            'has_conflict' => $score > 0,
            'conflict_type' => $this->timeOverlap->classifyConflict($score),
            'conflict_score' => round(min(1.0, $score), 4),
            'overlap_minutes' => $overlap['overlap_minutes'],
            'overlap_ratio' => $overlap['overlap_ratio'],
            'gap_minutes' => $overlap['gap_minutes'],
            'travel_time_minutes' => $travelTime,
            'travel_distance_km' => $travelDistance,
            'buffer_violation' => $bufferViolation,
            'conflicting_task_id' => $taskB->id,
            'conflicting_task' => [
                'id' => $taskB->id,
                'title' => $taskB->title,
                'start_date' => $taskB->start_date,
                'end_date' => $taskB->end_date,
            ],
        ];
    }

    public function checkForConflictsInSchedule(int $volunteerProfileId): int
    {
        $commitments = $this->getActiveCommitments($volunteerProfileId);
        $conflictCount = 0;

        for ($i = 0; $i < count($commitments); $i++) {
            for ($j = $i + 1; $j < count($commitments); $j++) {
                $taskA = $commitments[$i]['task'];
                $taskB = $commitments[$j]['task'];

                $conflict = $this->detectConflict($taskA, $taskB, $volunteerProfileId);
                if ($conflict && $conflict['has_conflict']) {
                    $this->persistConflict(
                        $volunteerProfileId, $taskA->id, $taskB->id, $conflict
                    );
                    $conflictCount++;
                }
            }
        }

        return $conflictCount;
    }

    public function getAnalytics(): array
    {
        return [
            'total_detected' => ScheduleConflict::count(),
            'unresolved' => ScheduleConflict::whereNull('resolution')->count(),
            'by_type' => ScheduleConflict::select('conflict_type')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('conflict_type')
                ->pluck('count', 'conflict_type')
                ->toArray(),
            'by_resolution' => ScheduleConflict::whereNotNull('resolution')
                ->select('resolution')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('resolution')
                ->pluck('count', 'resolution')
                ->toArray(),
        ];
    }

    private function getActiveCommitments(int $volunteerProfileId, ?int $excludeTaskId = null): array
    {
        $statuses = ['Accepted'];
        $query = Application::with('task')
            ->where('volunteer_profile_id', $volunteerProfileId)
            ->whereIn('status', $statuses);

        if ($excludeTaskId) {
            $query->where('task_id', '!=', $excludeTaskId);
        }

        $applications = $query->get();

        return $applications->map(function ($app) {
            return [
                'application_id' => $app->id,
                'task' => $app->task,
                'status' => $app->status,
            ];
        })->filter(fn($item) => $item['task'] !== null)->values()->toArray();
    }

    private function persistConflict(int $volunteerProfileId, int $taskId, int $conflictingTaskId, array $conflict): void
    {
        try {
            ScheduleConflict::updateOrCreate(
                [
                    'volunteer_profile_id' => $volunteerProfileId,
                    'task_id' => $taskId,
                    'conflicting_task_id' => $conflictingTaskId,
                ],
                [
                    'conflict_type' => $conflict['conflict_type'],
                    'conflict_score' => $conflict['conflict_score'],
                    'overlap_minutes' => $conflict['overlap_minutes'] ?? 0,
                    'travel_time_minutes' => $conflict['travel_time_minutes'] ?? 0,
                    'travel_distance_km' => $conflict['travel_distance_km'],
                    'buffer_violation' => $conflict['buffer_violation'] ?? false,
                    'detected_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            // Race condition guard - duplicate entry is acceptable
        }
    }
}
