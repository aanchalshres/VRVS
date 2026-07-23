<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Document;
use App\Models\ServiceLog;
use App\Models\TrustScoreHistory;
use App\Models\VolunteerProfile;
use App\Algorithms\Contracts\TrustCalculatorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class TrustScoreService implements TrustCalculatorInterface
{
    private array $config;

    public function __construct()
    {
        $this->config = config('trust-score');
    }

    public function calculateForVolunteer(VolunteerProfile $profile): array
    {
        $weights = $this->config['weights'] ?? [];
        $totalWeight = array_sum($weights);
        if (abs($totalWeight - 1.0) > 0.01 || $totalWeight <= 0) {
            $weights = [
                'attendance' => 0.20, 'completion' => 0.20, 'ratings' => 0.20,
                'verification' => 0.15, 'response_rate' => 0.10, 'account_activity' => 0.05, 'penalties' => 0.10,
            ];
        }

        $attendance = $this->attendanceScore($profile);
        $completion = $this->completionScore($profile);
        $ratings = $this->ratingsScore($profile);
        $verification = $this->verificationScore($profile);
        $responseRate = $this->responseRateScore($profile);
        $accountActivity = $this->accountActivityScore($profile);
        $penalties = $this->penaltyScore($profile);

        $finalScore = 0;
        $components = [];

        $componentValues = [
            'attendance' => $attendance,
            'completion' => $completion,
            'ratings' => $ratings,
            'verification' => $verification,
            'response_rate' => $responseRate,
            'account_activity' => $accountActivity,
            'penalties' => $penalties,
        ];

        foreach ($weights as $key => $weight) {
            $val = $componentValues[$key] ?? 0;
            $components[$key] = round($val, 4);
            if ($key === 'penalties') {
                $finalScore -= $weight * $val;
            } else {
                $finalScore += $weight * $val;
            }
        }

        $minScore = $this->config['min_score'] ?? 0.05;
        $maxScore = $this->config['max_score'] ?? 1.0;
        $finalScore = round(min($maxScore, max($minScore, $finalScore)), 4);

        return [
            'final_score' => $finalScore,
            'components' => $components,
        ];
    }

    public function recalculate(VolunteerProfile $profile, ?string $reason = null): VolunteerProfile
    {
        $cacheKey = "trust_recalc_{$profile->id}";
        if (Cache::has($cacheKey)) return $profile;
        Cache::put($cacheKey, true, 5);

        try {
            $previousScore = $profile->trust_score;
            $result = $this->calculateForVolunteer($profile);

            DB::transaction(function () use ($profile, $result, $previousScore, $reason) {
                $profile->updateQuietly([
                    'trust_score' => $result['final_score'],
                    'trust_score_components' => $result['components'],
                    'trust_updated_at' => now(),
                ]);

                TrustScoreHistory::create([
                    'volunteer_profile_id' => $profile->id,
                    'previous_score' => $previousScore,
                    'new_score' => $result['final_score'],
                    'score_change' => round($result['final_score'] - ($previousScore ?? 0), 4),
                    'change_reason' => $reason,
                    'components_snapshot' => $result['components'],
                    'triggered_by' => $reason,
                ]);

                app(ActivityLogService::class)->log(
                    $profile->user_id,
                    'trust_score_updated',
                    'trust_score',
                    "Trust score updated to {$result['final_score']} (reason: {$reason})",
                );
            });

            return $profile->fresh();
        } finally {
            Cache::forget($cacheKey);
        }
    }

    public function recalculateAll(?string $reason = null): int
    {
        $count = 0;
        VolunteerProfile::chunk(100, function ($profiles) use (&$count, $reason) {
            foreach ($profiles as $profile) {
                $this->recalculate($profile, $reason);
                $count++;
            }
        });
        return $count;
    }

    private function attendanceScore(VolunteerProfile $profile): float
    {
        $completed = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'completed')->count();
        $absent = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'absent')->count();
        $total = $completed + $absent;
        if ($total === 0) return $this->config['default_score'] ?? 0.5;
        return $completed / max($total, 1);
    }

    private function completionScore(VolunteerProfile $profile): float
    {
        $accepted = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Accepted')->count();
        $completedTasks = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'completed')
            ->distinct('task_id')->count('task_id');
        $cancelled = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Cancelled')->count();
        $withdrawn = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Withdrawn')->count();
        $totalAccepted = $accepted + $completedTasks + $cancelled + $withdrawn;
        if ($totalAccepted === 0) return $this->config['default_score'] ?? 0.5;
        $completedRatio = $completedTasks / max($accepted, 1);
        $abandonedRatio = ($cancelled + $withdrawn) / max($totalAccepted, 1);
        return max(0, min(1, ($completedRatio * 0.7) + ((1 - $abandonedRatio) * 0.3)));
    }

    private function ratingsScore(VolunteerProfile $profile): float
    {
        $user = $profile->user;
        if (!$user) return $this->config['default_score'] ?? 0.5;
        $ratings = \App\Models\Review::where('reviewee_id', $user->id)->pluck('rating');
        $count = $ratings->count();
        if ($count === 0) return $this->config['default_score'] ?? 0.5;
        $priorCount = $this->config['bayesian']['prior_count'] ?? 3;
        $priorMean = $this->config['bayesian']['prior_mean'] ?? 0.7;
        $sum = $ratings->sum();
        $bayesian = ($sum + ($priorCount * $priorMean * 5)) / ($count + ($priorCount * 5));
        return min(1, $bayesian / 5);
    }

    private function verificationScore(VolunteerProfile $profile): float
    {
        $verifiedDocs = Document::where('documentable_type', 'App\Models\VolunteerProfile')
            ->where('documentable_id', $profile->id)
            ->where('status', 'verified')->count();
        $totalDocs = Document::where('documentable_type', 'App\Models\VolunteerProfile')
            ->where('documentable_id', $profile->id)->count();
        if ($totalDocs === 0) {
            $identityVerification = \App\Models\IdentityVerification\IdentityVerification::where('verifiable_id', $profile->id)
                ->where('verifiable_type', get_class($profile))
                ->whereIn('status', ['verified'])->count();
            if ($identityVerification > 0) return 0.8;
            return 0.1;
        }
        $verifiedRatio = $verifiedDocs / max($totalDocs, 1);
        $allVerified = $verifiedDocs > 0 && $verifiedDocs === $totalDocs;
        if ($allVerified) return 1.0;
        return 0.3 + ($verifiedRatio * 0.7);
    }

    private function responseRateScore(VolunteerProfile $profile): float
    {
        $totalApplications = Application::where('volunteer_profile_id', $profile->id)
            ->whereIn('status', ['Accepted', 'Rejected', 'Cancelled', 'Withdrawn'])->count();
        $accepted = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Accepted')->count();
        $withdrawn = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Withdrawn')->count();
        if ($totalApplications === 0) return $this->config['default_score'] ?? 0.5;
        $responseRate = $accepted / max($totalApplications, 1);
        $withdrawalRate = $withdrawn / max($totalApplications, 1);
        return max(0, min(1, ($responseRate * 0.7) + ((1 - $withdrawalRate) * 0.3)));
    }

    private function accountActivityScore(VolunteerProfile $profile): float
    {
        $lookbackDays = $this->config['activity']['lookback_days'] ?? 90;
        $threshold = $this->config['activity']['sessions_threshold'] ?? 5;
        $since = now()->subDays($lookbackDays);
        $recentSessions = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('created_at', '>=', $since)
            ->where('participation_status', 'completed')->count();
        $recentApplications = Application::where('volunteer_profile_id', $profile->id)
            ->where('created_at', '>=', $since)->count();
        $total = $recentSessions + $recentApplications;
        if ($total === 0) return 0.1;
        return min(1, $total / $threshold);
    }

    private function penaltyScore(VolunteerProfile $profile): float
    {
        $penaltyConfig = $this->config['penalties'] ?? [];
        $cancelled = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Cancelled')->count();
        $noShows = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'absent')->count();
        $withdrawn = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Withdrawn')->count();
        $lateCheckins = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('confidence_level', 'low')
            ->orWhere('confidence_level', 'manual_review')
            ->where('participation_status', 'completed')
            ->count();
        $totalPenalty =
            ($cancelled * ($penaltyConfig['cancellation_per_event'] ?? 0.15)) +
            ($noShows * ($penaltyConfig['no_show_per_event'] ?? 0.20)) +
            ($withdrawn * ($penaltyConfig['withdrawal_per_event'] ?? 0.10)) +
            ($lateCheckins * ($penaltyConfig['late_check_in_per_event'] ?? 0.05));
        return min($penaltyConfig['max_penalty'] ?? 1.0, $totalPenalty);
    }
}
