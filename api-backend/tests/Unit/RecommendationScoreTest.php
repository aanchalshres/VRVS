<?php

use App\Services\Ranking\Strategies\RecommendationScoreStrategy;
use App\Services\Ranking\Strategies\TrustFirstStrategy;
use App\Services\Ranking\Strategies\SkillsFirstStrategy;
use App\Services\Ranking\Strategies\DistanceFirstStrategy;
use App\Services\Ranking\Strategies\AvailabilityFirstStrategy;

uses(Tests\TestCase::class);

it('recommendation strategy returns score within bounds', function () {
    $strategy = new RecommendationScoreStrategy();

    $score = $strategy->calculateScore([
        'semantic_match_score' => 0.8,
        'distance_score' => 0.6,
        'skill_overlap_score' => 0.7,
        'availability_score' => 0.5,
        'trust_score' => 0.9,
    ]);

    expect($score)->toBeGreaterThan(0);
    expect($score)->toBeLessThanOrEqual(1.0);
});

it('trust first strategy prioritizes trust over other dimensions', function () {
    $strategy = new TrustFirstStrategy();

    $highTrust = $strategy->calculateScore([
        'semantic_match_score' => 0, 'distance_score' => 0,
        'skill_overlap_score' => 0, 'availability_score' => 0,
        'trust_score' => 1.0,
    ]);

    $lowTrust = $strategy->calculateScore([
        'semantic_match_score' => 0.5, 'distance_score' => 0.5,
        'skill_overlap_score' => 0.5, 'availability_score' => 0.5,
        'trust_score' => 0,
    ]);

    expect($highTrust)->toBeGreaterThan($lowTrust);
});

it('skills first strategy prioritizes skill over other dimensions', function () {
    $strategy = new SkillsFirstStrategy();

    $highSkill = $strategy->calculateScore([
        'semantic_match_score' => 0.1, 'distance_score' => 0.1,
        'skill_overlap_score' => 1.0, 'availability_score' => 0.1,
        'trust_score' => 0.1,
    ]);

    $lowSkill = $strategy->calculateScore([
        'semantic_match_score' => 1.0, 'distance_score' => 1.0,
        'skill_overlap_score' => 0.0, 'availability_score' => 1.0,
        'trust_score' => 1.0,
    ]);

    expect($highSkill)->toBeGreaterThan($lowSkill);
});

it('all strategies return weights that sum to 1.0', function () {
    $strategies = [
        new RecommendationScoreStrategy(),
        new TrustFirstStrategy(),
        new SkillsFirstStrategy(),
        new DistanceFirstStrategy(),
        new AvailabilityFirstStrategy(),
    ];

    foreach ($strategies as $strategy) {
        $weights = $strategy->getWeights();
        expect(array_sum($weights))->toBe(1.0);
    }
});

it('handles empty scores with defaults', function () {
    $strategy = new RecommendationScoreStrategy();

    $score = $strategy->calculateScore([]);

    expect($score)->toBeGreaterThanOrEqual(0.01);
});

it('produces deterministic scores for same input', function () {
    $strategy = new RecommendationScoreStrategy();

    $input = [
        'semantic_match_score' => 0.7,
        'distance_score' => 0.3,
        'skill_overlap_score' => 0.9,
        'availability_score' => 0.4,
        'trust_score' => 0.6,
    ];

    expect($strategy->calculateScore($input))
        ->toEqual($strategy->calculateScore($input));
});
