<?php

namespace App\Listeners\TrustScore;

use App\Events\TrustScore\VerificationStatusChanged;
use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;

class RecalculateOnVerification
{
    public function __construct(
        private TrustScoreService $trustService,
    ) {}

    public function handle(VerificationStatusChanged $event): void
    {
        $profile = VolunteerProfile::find($event->volunteerProfileId);
        if (!$profile) return;

        $this->trustService->recalculate($profile, 'verification_changed');
    }
}
