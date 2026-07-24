<?php

namespace App\Services\ScheduleConflict;

use App\Models\ScheduleConflict;
use App\Services\ActivityLogService;

class ConflictResolutionService
{
    public function __construct(
        private ActivityLogService $activityLog,
    ) {}

    public function resolve(int $conflictId, string $resolution, int $resolvedBy, ?string $notes = null): ScheduleConflict
    {
        $conflict = ScheduleConflict::findOrFail($conflictId);

        $conflict->update([
            'resolution' => $resolution,
            'resolved_at' => now(),
            'resolved_by' => $resolvedBy,
            'notes' => $notes,
        ]);

        $this->activityLog->log($resolvedBy, 'conflict_resolved', 'schedule_conflict',
            "Conflict #{$conflictId} resolved as: {$resolution}");

        return $conflict->fresh();
    }

    public function getSuggestedResolution(string $conflictType, float $score): string
    {
        $default = config('schedule-conflict.default_resolution', 'warn_ngo');

        if ($score >= 0.75) return 'manual_override';
        if ($score >= 0.50) return 'warn_ngo';
        if ($score >= 0.25) return 'warn_volunteer';

        return $default;
    }
}
