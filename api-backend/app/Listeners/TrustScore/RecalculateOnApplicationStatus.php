<?php

namespace App\Listeners\TrustScore;

use App\Events\TrustScore\ApplicationStatusChanged;
use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;

class RecalculateOnApplicationStatus
{
    public function __construct(
        private TrustScoreService $trustService,
    ) {}

    public function handle(ApplicationStatusChanged $event): void
    {
        $profile = VolunteerProfile::find($event->volunteerProfileId);
        if (!$profile) return;

        $this->trustService->recalculate($profile, "application_{$event->newStatus}");
    }
}
