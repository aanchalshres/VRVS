<?php

use App\Services\Ranking\Ranker;
use App\Services\Ranking\RankingStrategyInterface;

uses(Tests\TestCase::class);

it('resolves all registered strategies', function () {
    $ranker = app(Ranker::class);

    $strategies = ['recommendation', 'trust_first', 'skills_first', 'distance_first', 'availability_first'];

    foreach ($strategies as $name) {
        $strategy = $ranker->resolveStrategy($name);
        expect($strategy)->toBeInstanceOf(RankingStrategyInterface::class);
        expect($strategy->getStrategyName())->toBe($name);
    }
});

it('throws exception for unknown strategy', function () {
    $ranker = app(Ranker::class);

    expect(fn () => $ranker->resolveStrategy('nonexistent'))
        ->toThrow(InvalidArgumentException::class);
});

it('delegates score to resolved strategy', function () {
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

it('returns list of available strategies', function () {
    $strategies = Ranker::getAvailableStrategies();

    expect($strategies)->toHaveKeys([
        'recommendation', 'trust_first', 'skills_first', 'distance_first', 'availability_first',
    ]);
});

it('evaluates strategy with custom strategy instance', function () {
    $mock = Mockery::mock(RankingStrategyInterface::class);
    $mock->shouldReceive('calculateScore')
        ->once()
        ->with(Mockery::type('array'))
        ->andReturn(0.85);

    $ranker = new Ranker($mock);

    $score = $ranker->score([
        'semantic_match_score' => 0.5,
        'distance_score' => 0.5,
        'skill_overlap_score' => 0.5,
        'availability_score' => 0.5,
        'trust_score' => 0.5,
    ]);

    expect($score)->toBe(0.85);
});
