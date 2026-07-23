<?php

uses(Tests\TestCase::class);

use App\Services\Ranking\Ranker;
use App\Services\Ranking\Strategies\RecommendationScoreStrategy;
use App\Services\Ranking\Strategies\TrustFirstStrategy;
use App\Services\Ranking\Strategies\SkillsFirstStrategy;
use App\Services\Ranking\Strategies\DistanceFirstStrategy;
use App\Services\Ranking\Strategies\AvailabilityFirstStrategy;

it('recommendation strategy calculates balanced score', function () {
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

it('trust first strategy favors trust score', function () {
    $strategy = new TrustFirstStrategy();
    $highTrust = $strategy->calculateScore([
        'semantic_match_score' => 0.1,
        'distance_score' => 0.1,
        'skill_overlap_score' => 0.1,
        'availability_score' => 0.1,
        'trust_score' => 1.0,
    ]);

    $lowTrust = $strategy->calculateScore([
        'semantic_match_score' => 1.0,
        'distance_score' => 1.0,
        'skill_overlap_score' => 1.0,
        'availability_score' => 1.0,
        'trust_score' => 0.1,
    ]);

    expect($highTrust)->toBeGreaterThan($lowTrust);
});

it('skills first strategy favors skill score', function () {
    $strategy = new SkillsFirstStrategy();
    $highSkill = $strategy->calculateScore([
        'semantic_match_score' => 0.1,
        'distance_score' => 0.1,
        'skill_overlap_score' => 1.0,
        'availability_score' => 0.1,
        'trust_score' => 0.1,
    ]);

    $lowSkill = $strategy->calculateScore([
        'semantic_match_score' => 1.0,
        'distance_score' => 1.0,
        'skill_overlap_score' => 0.0,
        'availability_score' => 1.0,
        'trust_score' => 1.0,
    ]);

    expect($highSkill)->toBeGreaterThan($lowSkill);
});

it('distance first strategy favors distance score', function () {
    $strategy = new DistanceFirstStrategy();
    $highDist = $strategy->calculateScore([
        'semantic_match_score' => 0.1,
        'distance_score' => 1.0,
        'skill_overlap_score' => 0.1,
        'availability_score' => 0.1,
        'trust_score' => 0.1,
    ]);

    $lowDist = $strategy->calculateScore([
        'semantic_match_score' => 1.0,
        'distance_score' => 0.0,
        'skill_overlap_score' => 1.0,
        'availability_score' => 1.0,
        'trust_score' => 1.0,
    ]);

    expect($highDist)->toBeGreaterThan($lowDist);
});

it('availability first strategy favors availability score', function () {
    $strategy = new AvailabilityFirstStrategy();
    $highAvail = $strategy->calculateScore([
        'semantic_match_score' => 0.1,
        'distance_score' => 0.1,
        'skill_overlap_score' => 0.1,
        'availability_score' => 1.0,
        'trust_score' => 0.1,
    ]);

    $lowAvail = $strategy->calculateScore([
        'semantic_match_score' => 1.0,
        'distance_score' => 1.0,
        'skill_overlap_score' => 1.0,
        'availability_score' => 0.0,
        'trust_score' => 1.0,
    ]);

    expect($highAvail)->toBeGreaterThan($lowAvail);
});

it('ranker resolves all strategies', function () {
    $ranker = app(Ranker::class);

    $strategies = ['recommendation', 'trust_first', 'skills_first', 'distance_first', 'availability_first'];

    foreach ($strategies as $name) {
        $strategy = $ranker->resolveStrategy($name);
        expect($strategy->getStrategyName())->toBe($name);
    }
});

it('ranker score delegates to strategy', function () {
    $ranker = app(Ranker::class);

    $score = $ranker->score([
        'semantic_match_score' => 0.8,
        'distance_score' => 0.6,
        'skill_overlap_score' => 0.7,
        'availability_score' => 0.5,
        'trust_score' => 0.9,
    ], 'recommendation');

    expect($score)->toBeGreaterThan(0);
    expect($score)->toBeLessThanOrEqual(1.0);
});

it('all strategies return weights from config', function () {
    $strategies = [
        new RecommendationScoreStrategy(),
        new TrustFirstStrategy(),
        new SkillsFirstStrategy(),
        new DistanceFirstStrategy(),
        new AvailabilityFirstStrategy(),
    ];

    foreach ($strategies as $strategy) {
        $weights = $strategy->getWeights();
        expect($weights)->toHaveKeys(['semantic', 'distance', 'skill', 'availability', 'trust']);
        $total = array_sum($weights);
        expect($total)->toBe(1.0);
    }
});

it('handles missing scores with defaults', function () {
    $strategy = new RecommendationScoreStrategy();

    $score = $strategy->calculateScore([]);

    expect($score)->toBeGreaterThanOrEqual(0.01);
});

it('ranker throws exception for unknown strategy', function () {
    $ranker = app(Ranker::class);

    expect(fn () => $ranker->resolveStrategy('nonexistent'))
        ->toThrow(\InvalidArgumentException::class);
});
