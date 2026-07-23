<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Score Bounds
    |--------------------------------------------------------------------------
    */
    'min_score' => env('TRUST_MIN_SCORE', 0.05),
    'max_score' => env('TRUST_MAX_SCORE', 1.00),
    'default_score' => env('TRUST_DEFAULT_SCORE', 0.50),

    /*
    |--------------------------------------------------------------------------
    | Component Weights (must sum to ~1.0)
    |--------------------------------------------------------------------------
    */
    'weights' => [
        'attendance' => env('TRUST_WEIGHT_ATTENDANCE', 0.20),
        'completion' => env('TRUST_WEIGHT_COMPLETION', 0.20),
        'ratings' => env('TRUST_WEIGHT_RATINGS', 0.20),
        'verification' => env('TRUST_WEIGHT_VERIFICATION', 0.15),
        'response_rate' => env('TRUST_WEIGHT_RESPONSE', 0.10),
        'account_activity' => env('TRUST_WEIGHT_ACTIVITY', 0.05),
        'penalties' => env('TRUST_WEIGHT_PENALTY', 0.10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Penalties
    |--------------------------------------------------------------------------
    */
    'penalties' => [
        'cancellation_per_event' => env('TRUST_PENALTY_CANCELLATION', 0.15),
        'no_show_per_event' => env('TRUST_PENALTY_NOSHOW', 0.20),
        'withdrawal_per_event' => env('TRUST_PENALTY_WITHDRAWAL', 0.10),
        'late_check_in_per_event' => env('TRUST_PENALTY_LATE_CHECKIN', 0.05),
        'max_penalty' => env('TRUST_PENALTY_MAX', 1.0),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rewards
    |--------------------------------------------------------------------------
    */
    'rewards' => [
        'identity_verified_bonus' => env('TRUST_REWARD_VERIFIED', 0.05),
        'streak_bonus_per_session' => env('TRUST_REWARD_STREAK', 0.01),
        'max_streak_bonus' => env('TRUST_REWARD_MAX_STREAK', 0.10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Bayesian Averaging (for ratings)
    |--------------------------------------------------------------------------
    */
    'bayesian' => [
        'prior_count' => env('TRUST_PRIOR_COUNT', 3),
        'prior_mean' => env('TRUST_PRIOR_MEAN', 0.7),
    ],

    /*
    |--------------------------------------------------------------------------
    | Staleness
    |--------------------------------------------------------------------------
    */
    'staleness' => [
        'auto_recalculate_minutes' => env('TRUST_AUTO_RECALC_MINUTES', 60),
    ],

    /*
    |--------------------------------------------------------------------------
    | Caching
    |--------------------------------------------------------------------------
    */
    'cache' => [
        'ttl_seconds' => env('TRUST_CACHE_TTL', 300),
        'enabled' => env('TRUST_CACHE_ENABLED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Account Activity Thresholds
    |--------------------------------------------------------------------------
    */
    'activity' => [
        'lookback_days' => env('TRUST_ACTIVITY_LOOKBACK', 90),
        'sessions_threshold' => env('TRUST_ACTIVITY_SESSIONS', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | Late Check-in Definition
    |--------------------------------------------------------------------------
    */
    'late_check_in' => [
        'window_minutes' => env('TRUST_LATE_WINDOW', 15),
    ],
];
