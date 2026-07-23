<?php

return [
    /*
    |--------------------------------------------------------------------------
    | QR Code Configuration
    |--------------------------------------------------------------------------
    */
    'qr' => [
        'length' => env('ATT_QR_LENGTH', 64),
        'expiry_minutes' => env('ATT_QR_EXPIRY_MINUTES', 15),
        'signing_key' => env('ATT_QR_SIGNING_KEY', env('APP_KEY')),
    ],

    /*
    |--------------------------------------------------------------------------
    | GPS Validation
    |--------------------------------------------------------------------------
    */
    'gps' => [
        'max_distance_meters' => env('ATT_GPS_MAX_DISTANCE', 500),
        'require_gps' => env('ATT_REQUIRE_GPS', true),
        'max_accuracy_meters' => env('ATT_GPS_MAX_ACCURACY', 50),
    ],

    /*
    |--------------------------------------------------------------------------
    | Time Windows (minutes)
    |--------------------------------------------------------------------------
    */
    'time' => [
        'check_in_window_minutes' => env('ATT_CHECK_IN_WINDOW', 15),
        'check_out_window_minutes' => env('ATT_CHECK_OUT_WINDOW', 15),
        'allow_check_out_without_window' => env('ATT_ALLOW_OPEN_CHECK_OUT', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Confidence Score Weights (must sum to 1.0)
    |--------------------------------------------------------------------------
    */
    'weights' => [
        'qr_validity' => 0.30,
        'gps_accuracy' => 0.35,
        'time_validity' => 0.25,
        'device_consistency' => 0.10,
    ],

    /*
    |--------------------------------------------------------------------------
    | Confidence Thresholds
    |--------------------------------------------------------------------------
    */
    'thresholds' => [
        'high' => 85,
        'medium' => 65,
        'low' => 40,
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */
    'rate_limit' => [
        'max_attempts' => env('ATT_RATE_LIMIT_ATTEMPTS', 5),
        'decay_minutes' => env('ATT_RATE_LIMIT_DECAY', 1),
    ],

    /*
    |--------------------------------------------------------------------------
    | Jobs
    |--------------------------------------------------------------------------
    */
    'jobs' => [
        'audit_log' => env('ATT_AUDIT_LOG_ENABLED', true),
        'analytics_update' => env('ATT_ANALYTICS_UPDATE_ENABLED', true),
        'trust_score_update' => env('ATT_TRUST_SCORE_UPDATE_ENABLED', true),
    ],
];
