<?php

namespace App\Listeners\TrustScore;

use App\Events\TrustScore\TaskCompleted;
use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;

class RecalculateOnTaskCompleted
{
    public function __construct(
        private TrustScoreService $trustService,
    ) {}

    public function handle(TaskCompleted $event): void
    {
        $profile = VolunteerProfile::find($event->volunteerProfileId);
        if (!$profile) return;

        $this->trustService->recalculate($profile, 'task_completed');
    }
}
