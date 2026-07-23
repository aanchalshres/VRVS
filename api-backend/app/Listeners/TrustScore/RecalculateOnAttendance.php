<?php

namespace App\Listeners\TrustScore;

use App\Events\TrustScore\AttendanceRecorded;
use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;

class RecalculateOnAttendance
{
    public function __construct(
        private TrustScoreService $trustService,
    ) {}

    public function handle(AttendanceRecorded $event): void
    {
        $profile = VolunteerProfile::find($event->volunteerProfileId);
        if (!$profile) return;

        $this->trustService->recalculate($profile, "attendance_{$event->action}");
    }
}
