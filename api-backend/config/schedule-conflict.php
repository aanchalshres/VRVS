<?php

return [
    'buffer_minutes' => env('CONFLICT_BUFFER_MINUTES', 30),
    'travel_speed_kmh' => env('CONFLICT_TRAVEL_SPEED', 30),
    'max_travel_distance_km' => env('CONFLICT_MAX_TRAVEL_DISTANCE', 50),
    'max_daily_service_hours' => env('CONFLICT_MAX_DAILY_HOURS', 8),
    'working_hours_start' => env('CONFLICT_WORKING_START', '06:00'),
    'working_hours_end' => env('CONFLICT_WORKING_END', '22:00'),

    'severity_thresholds' => [
        'minor' => 0.25,
        'partial' => 0.50,
        'major' => 0.75,
        'complete' => 1.00,
    ],

    'resolution_strategies' => [
        'reject' => 'Reject application automatically',
        'warn_volunteer' => 'Warn volunteer only',
        'warn_ngo' => 'Warn NGO only',
        'manual_override' => 'Require manual override',
        'suggest_alternative' => 'Suggest alternative volunteers/tasks',
    ],
    'default_resolution' => env('CONFLICT_DEFAULT_RESOLUTION', 'warn_ngo'),

    'check_on_apply' => env('CONFLICT_CHECK_ON_APPLY', true),
    'check_on_accept' => env('CONFLICT_CHECK_ON_ACCEPT', true),
    'check_on_assign' => env('CONFLICT_CHECK_ON_ASSIGN', true),
];
