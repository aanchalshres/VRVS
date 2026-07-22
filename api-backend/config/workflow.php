<?php

return [

    'default_strategy' => env('WORKFLOW_RANKING_STRATEGY', 'recommendation'),

    'shortlist_limit' => (int) env('WORKFLOW_SHORTLIST_LIMIT', 10),

    'ngo_recommendation_limit' => (int) env('WORKFLOW_NGO_RECOMMENDATION_LIMIT', 10),

    'strategies' => [
        'recommendation' => [
            'label' => 'Recommendation Score',
            'weights' => ['semantic' => 0.30, 'distance' => 0.20, 'skill' => 0.20, 'availability' => 0.10, 'trust' => 0.20],
        ],
        'trust_first' => [
            'label' => 'Trust First',
            'weights' => ['semantic' => 0.15, 'distance' => 0.10, 'skill' => 0.15, 'availability' => 0.10, 'trust' => 0.50],
        ],
        'skills_first' => [
            'label' => 'Skills First',
            'weights' => ['semantic' => 0.15, 'distance' => 0.10, 'skill' => 0.50, 'availability' => 0.10, 'trust' => 0.15],
        ],
        'distance_first' => [
            'label' => 'Distance First',
            'weights' => ['semantic' => 0.15, 'distance' => 0.50, 'skill' => 0.15, 'availability' => 0.10, 'trust' => 0.10],
        ],
        'availability_first' => [
            'label' => 'Availability First',
            'weights' => ['semantic' => 0.15, 'distance' => 0.10, 'skill' => 0.15, 'availability' => 0.50, 'trust' => 0.10],
        ],
    ],
];
