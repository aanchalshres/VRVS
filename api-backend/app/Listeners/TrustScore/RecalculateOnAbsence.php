<?php

namespace App\Listeners\TrustScore;

use App\Events\TrustScore\AbsenceRecorded;
use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;

class RecalculateOnAbsence
{
    public function __construct(
        private TrustScoreService $trustService,
    ) {}

    public function handle(AbsenceRecorded $event): void
    {
        $profile = VolunteerProfile::find($event->volunteerProfileId);
        if (!$profile) return;

        $this->trustService->recalculate($profile, 'absence_recorded');
    }
}
