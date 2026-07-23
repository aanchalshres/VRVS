<?php

uses(Tests\TestCase::class);

use App\Services\RecommendationService;
use App\Models\VolunteerProfile;
use App\Models\Task;

it('computes all scores with valid profiles', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'latitude' => 27.7172,
        'longitude' => 85.3240,
        'tfidf_vector' => ['teaching' => 0.5, 'children' => 0.3],
        'trust_score' => 0.8,
        'trust_updated_at' => now(),
        'availability' => 'Available',
    ]);

    $task = Task::factory()->create([
        'latitude' => 27.7172,
        'longitude' => 85.3240,
        'tfidf_vector' => ['teaching' => 0.4, 'children' => 0.4, 'school' => 0.2],
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);
    $scores = $service->computeAllScores($volunteer, $task);

    expect($scores)->toHaveKeys([
        'recommendation_score', 'semantic_match_score', 'distance_score',
        'skill_overlap_score', 'availability_score', 'trust_score',
    ]);
    expect($scores['recommendation_score'])->toBeGreaterThan(0);
});

it('returns cached results for same volunteer-task pair', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'tfidf_vector' => ['teaching' => 0.5],
        'trust_score' => 0.8,
        'trust_updated_at' => now(),
        'availability' => 'Available',
    ]);

    $task = Task::factory()->create([
        'tfidf_vector' => ['teaching' => 0.4],
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);
    $result1 = $service->computeAllScores($volunteer, $task);
    $result2 = $service->computeAllScores($volunteer, $task);

    expect($result1)->toEqual($result2);
});

it('handles null tfidf vectors', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'tfidf_vector' => null,
        'trust_score' => 0.5,
        'trust_updated_at' => now(),
    ]);

    $task = Task::factory()->create([
        'tfidf_vector' => null,
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);
    $scores = $service->computeAllScores($volunteer, $task);

    expect($scores['semantic_match_score'])->toBe(0.0);
});

it('handles empty tfidf vectors', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'tfidf_vector' => [],
        'trust_score' => 0.5,
        'trust_updated_at' => now(),
    ]);

    $task = Task::factory()->create([
        'tfidf_vector' => [],
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);
    $scores = $service->computeAllScores($volunteer, $task);

    expect($scores['semantic_match_score'])->toBe(0.0);
});

it('returns 0.5 distance score when no coordinates', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'latitude' => null,
        'longitude' => null,
        'tfidf_vector' => ['test' => 1.0],
        'trust_score' => 0.5,
        'trust_updated_at' => now(),
    ]);

    $task = Task::factory()->create([
        'latitude' => null,
        'longitude' => null,
        'tfidf_vector' => ['test' => 1.0],
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);
    $scores = $service->computeAllScores($volunteer, $task);

    expect($scores['distance_score'])->toBe(0.5);
});

it('produces deterministic scores', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'latitude' => 27.7172,
        'longitude' => 85.3240,
        'tfidf_vector' => ['a' => 0.5, 'b' => 0.3],
        'trust_score' => 0.7,
        'trust_updated_at' => now(),
        'availability' => 'Available',
    ]);

    $task = Task::factory()->create([
        'latitude' => 28.2096,
        'longitude' => 83.9856,
        'tfidf_vector' => ['a' => 0.4, 'c' => 0.6],
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);
    $run1 = $service->computeAllScores($volunteer, $task);
    $run2 = $service->computeAllScores($volunteer->fresh(), $task->fresh());

    expect($run1)->toEqual($run2);
});
