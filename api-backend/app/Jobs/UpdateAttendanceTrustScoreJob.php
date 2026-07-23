<?php

namespace App\Jobs;

use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class UpdateAttendanceTrustScoreJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private int $volunteerProfileId,
        private string $action
    ) {}

    public function handle(TrustScoreService $trustScoreService): void
    {
        $profile = VolunteerProfile::find($this->volunteerProfileId);
        if (!$profile) return;

        $trustScoreService->recalculate($profile);
    }
}
