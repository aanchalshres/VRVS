<?php

namespace App\Jobs;

use App\Models\ServiceLog;
use App\Models\SystemSetting;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class UpdateAttendanceAnalyticsJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private int $serviceLogId,
        private string $action
    ) {}

    public function handle(): void
    {
        $totalHours = ServiceLog::where('participation_status', 'completed')->sum('hours');
        $totalLogs = ServiceLog::count();
        $completedLogs = ServiceLog::where('participation_status', 'completed')->count();
        $activeLogs = ServiceLog::where('participation_status', 'active')->count();
        $highConfidence = ServiceLog::where('confidence_level', 'high')->count();

        $aggregates = [
            'total_hours' => round($totalHours, 2),
            'total_logs' => $totalLogs,
            'completed_logs' => $completedLogs,
            'active_logs' => $activeLogs,
            'high_confidence_logs' => $highConfidence,
            'updated_at' => now()->toIso8601String(),
        ];

        SystemSetting::updateOrCreate(
            ['key' => 'attendance_analytics'],
            ['value' => json_encode($aggregates)]
        );
    }
}
