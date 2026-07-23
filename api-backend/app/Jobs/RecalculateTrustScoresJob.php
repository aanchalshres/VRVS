<?php

namespace App\Jobs;

use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecalculateTrustScoresJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $volunteerIds;

    public int $timeout = 300;

    public function __construct(array|int $volunteerIds)
    {
        $this->volunteerIds = is_array($volunteerIds) ? $volunteerIds : [$volunteerIds];
    }

    public function handle(TrustScoreService $trustService): void
    {
        $profiles = VolunteerProfile::whereIn('id', $this->volunteerIds)->get();

        foreach ($profiles as $profile) {
            $trustService->recalculate($profile);
        }
    }
}
