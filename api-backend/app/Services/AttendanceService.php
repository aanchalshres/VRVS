<?php

namespace App\Services;

use App\Models\ServiceLog;
use App\Models\Task;
use App\Models\VolunteerProfile;
use Carbon\Carbon;

class AttendanceService
{
    /**
     * Volunteer checks in to a task.
     */
    public function checkIn(
        VolunteerProfile $volunteer,
        Task $task
    ): ServiceLog {
        return ServiceLog::create([
            'volunteer_profile_id' => $volunteer->id,
            'task_id'              => $task->id,
            'check_in_time'        => now(),
            'participation_status' => 'active',
        ]);
    }

    /**
     * Volunteer checks out.
     */
    public function checkOut(ServiceLog $serviceLog): ServiceLog
    {
        $checkOutTime = now();

        $hours = $this->calculateHours(
            $serviceLog->check_in_time,
            $checkOutTime
        );

        $serviceLog->update([
            'check_out_time'       => $checkOutTime,
            'hours'                => $hours,
            'participation_status' => 'completed',
        ]);

        return $serviceLog->fresh();
    }

    /**
     * Calculate total service hours.
     */
    private function calculateHours($checkIn, $checkOut): float
    {
        return round(
            Carbon::parse($checkIn)
                ->diffInMinutes($checkOut) / 60,
            2
        );
    }
}
