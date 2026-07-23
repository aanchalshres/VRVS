<?php

namespace App\Listeners\TrustScore;

use App\Events\TrustScore\RatingSubmitted;
use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;

class RecalculateOnRating
{
    public function __construct(
        private TrustScoreService $trustService,
    ) {}

    public function handle(RatingSubmitted $event): void
    {
        $profile = VolunteerProfile::find($event->volunteerProfileId);
        if (!$profile) return;

        $this->trustService->recalculate($profile, 'rating_submitted');
    }
}
