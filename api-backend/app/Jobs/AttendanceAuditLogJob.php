<?php

namespace App\Jobs;

use App\Models\ServiceLog;
use App\Models\ActivityLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AttendanceAuditLogJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private int $serviceLogId,
        private string $action
    ) {}

    public function handle(): void
    {
        $log = ServiceLog::with(['volunteer.user', 'task'])->find($this->serviceLogId);
        if (!$log) return;

        $metadata = [
            'action' => $this->action,
            'service_log_id' => $log->id,
            'task_id' => $log->task_id,
            'volunteer_id' => $log->volunteer_profile_id,
            'confidence_score' => $log->attendance_confidence_score,
            'confidence_level' => $log->confidence_level,
            'verification_method' => $log->verification_method,
            'check_in_time' => $log->check_in_time?->toIso8601String(),
            'check_out_time' => $log->check_out_time?->toIso8601String(),
            'distance' => $log->check_in_distance_from_task,
            'gps_accuracy' => $log->check_in_gps_accuracy,
        ];

        ActivityLog::create([
            'user_id' => $log->volunteer?->user_id,
            'type' => "attendance_{$this->action}",
            'message' => $this->action === 'check_in'
                ? "Volunteer checked in to task: {$log->task?->title}"
                : "Volunteer checked out from task: {$log->task?->title}. Hours: {$log->hours}",
            'metadata' => $metadata,
        ]);
    }
}
