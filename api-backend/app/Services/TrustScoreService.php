<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Document;
use App\Models\ServiceLog;
use App\Models\VolunteerProfile;

class TrustScoreService
{
    private const WEIGHT_ATTENDANCE = 0.25;
    private const WEIGHT_COMPLETION = 0.20;
    private const WEIGHT_RATINGS = 0.20;
    private const WEIGHT_VERIFICATION = 0.15;
    private const WEIGHT_RESPONSE = 0.10;
    private const WEIGHT_PENALTY = 0.10;
    private const DEFAULT_SCORE = 0.5;
    private const MIN_SCORE = 0.05;
    private const PRIOR_COUNT = 3;
    private const PRIOR_MEAN = 0.7;

    public function calculateForVolunteer(VolunteerProfile $profile): array
    {
        $attendance = $this->attendanceScore($profile);
        $completion = $this->completionScore($profile);
        $ratings = $this->ratingsScore($profile);
        $verification = $this->verificationScore($profile);
        $response = $this->responseScore($profile);
        $penalties = $this->penaltyScore($profile);

        $finalScore = min(1.0, max(self::MIN_SCORE,
            (self::WEIGHT_ATTENDANCE * $attendance) +
            (self::WEIGHT_COMPLETION * $completion) +
            (self::WEIGHT_RATINGS * $ratings) +
            (self::WEIGHT_VERIFICATION * $verification) +
            (self::WEIGHT_RESPONSE * $response) -
            (self::WEIGHT_PENALTY * $penalties)
        ));

        $finalScore = round($finalScore, 4);

        return [
            'final_score' => $finalScore,
            'components' => [
                'attendance' => round($attendance, 4),
                'completion' => round($completion, 4),
                'ratings' => round($ratings, 4),
                'verification' => round($verification, 4),
                'response' => round($response, 4),
                'penalties' => round($penalties, 4),
            ],
        ];
    }

    public function recalculate(VolunteerProfile $profile): VolunteerProfile
    {
        $result = $this->calculateForVolunteer($profile);

        $profile->updateQuietly([
            'trust_score' => $result['final_score'],
            'trust_updated_at' => now(),
        ]);

        return $profile->fresh();
    }

    public function recalculateAll(): int
    {
        $count = 0;
        VolunteerProfile::chunk(100, function ($profiles) use (&$count) {
            foreach ($profiles as $profile) {
                $this->recalculate($profile);
                $count++;
            }
        });
        return $count;
    }

    private function attendanceScore(VolunteerProfile $profile): float
    {
        $completed = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'completed')
            ->count();

        $absent = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'absent')
            ->count();

        $total = $completed + $absent;

        if ($total === 0) {
            return self::DEFAULT_SCORE;
        }

        return $completed / max($total, 1);
    }

    private function completionScore(VolunteerProfile $profile): float
    {
        $accepted = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Accepted')
            ->count();

        $completedTasks = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'completed')
            ->distinct('task_id')
            ->count('task_id');

        $cancelled = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Cancelled')
            ->count();

        $withdrawn = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Withdrawn')
            ->count();

        $totalAccepted = $accepted + $completedTasks + $cancelled + $withdrawn;

        if ($totalAccepted === 0) {
            return self::DEFAULT_SCORE;
        }

        $completedRatio = $completedTasks / max($accepted, 1);
        $abandonedRatio = ($cancelled + $withdrawn) / max($totalAccepted, 1);

        return max(0, min(1, ($completedRatio * 0.7) + ((1 - $abandonedRatio) * 0.3)));
    }

    private function ratingsScore(VolunteerProfile $profile): float
    {
        $user = $profile->user;

        if (!$user) {
            return self::DEFAULT_SCORE;
        }

        $ratings = \App\Models\Review::where('reviewee_id', $user->id)->pluck('rating');

        $count = $ratings->count();

        if ($count === 0) {
            return self::DEFAULT_SCORE;
        }

        $sum = $ratings->sum();
        $bayesian = ($sum + (self::PRIOR_COUNT * self::PRIOR_MEAN * 5)) / ($count + (self::PRIOR_COUNT * 5));

        return min(1, $bayesian / 5);
    }

    private function verificationScore(VolunteerProfile $profile): float
    {
        $verifiedDocs = Document::where('documentable_type', 'App\Models\VolunteerProfile')
            ->where('documentable_id', $profile->id)
            ->where('status', 'verified')
            ->count();

        $totalDocs = Document::where('documentable_type', 'App\Models\VolunteerProfile')
            ->where('documentable_id', $profile->id)
            ->count();

        if ($totalDocs === 0) {
            return 0.1;
        }

        $verifiedRatio = $verifiedDocs / max($totalDocs, 1);

        $allVerified = $verifiedDocs > 0 && $verifiedDocs === $totalDocs;

        if ($allVerified) {
            return 1.0;
        }

        return 0.3 + ($verifiedRatio * 0.7);
    }

    private function responseScore(VolunteerProfile $profile): float
    {
        $totalApplications = Application::where('volunteer_profile_id', $profile->id)
            ->whereIn('status', ['Accepted', 'Rejected', 'Cancelled', 'Withdrawn'])
            ->count();

        $accepted = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Accepted')
            ->count();

        $withdrawn = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Withdrawn')
            ->count();

        if ($totalApplications === 0) {
            return self::DEFAULT_SCORE;
        }

        $responseRate = $accepted / max($totalApplications, 1);
        $withdrawalRate = $withdrawn / max($totalApplications, 1);

        $score = ($responseRate * 0.7) + ((1 - $withdrawalRate) * 0.3);

        return max(0, min(1, $score));
    }

    private function penaltyScore(VolunteerProfile $profile): float
    {
        $cancelledAfterAcceptance = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Cancelled')
            ->count();

        $noShows = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'absent')
            ->count();

        $withdrawnAfterAcceptance = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Withdrawn')
            ->count();

        $totalPenalties = $cancelledAfterAcceptance + $noShows + $withdrawnAfterAcceptance;

        if ($totalPenalties === 0) {
            return 0;
        }

        return min(1, $totalPenalties * 0.15);
    }
}
