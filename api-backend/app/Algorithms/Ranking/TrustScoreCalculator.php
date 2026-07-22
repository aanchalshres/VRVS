<?php

namespace App\Services;

use App\Models\VolunteerProfile;

class TrustScoreCalculator
{
    const WEIGHTS = [
        'gov_id_uploaded'     =>  0.15,
        'liveness_passed'     =>  0.12,
        'task_completed'      =>  0.08,
        'review_5star'        =>  0.06,
        'review_1star'        => -0.10,
        'no_show'             => -0.12,
        'account_flagged'     => -0.20,
        'prior_participation' =>  0.04,
    ];

    public function update(VolunteerProfile $profile, string $event): void
    {
        $delta = self::WEIGHTS[$event] ?? 0;

        // Decay toward 0.5 if inactive
        $daysSinceUpdate = now()->diffInDays($profile->trust_updated_at ?? now());
        $decayed         = $profile->trust_score + ($daysSinceUpdate * -0.001);

        $newScore = $this->clamp($decayed + $delta, 0.1, 0.99);

        $profile->update([
            'trust_score'      => $newScore,
            'trust_updated_at' => now(),
        ]);
    }

    public function initialize(VolunteerProfile $profile): void
    {
        // Beta(2,2) prior — neutral starting point
        $profile->update([
            'trust_score'      => 0.5,
            'trust_updated_at' => now(),
        ]);
    }

    private function clamp(float $value, float $min, float $max): float
    {
        return max($min, min($max, $value));
    }
}
