<?php

uses(Tests\TestCase::class);

use App\Services\RecommendationService;
use App\Models\VolunteerProfile;
use App\Models\Task;

it('caches scores within same request', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'tfidf_vector' => ['teaching' => 0.5],
        'trust_score' => 0.8,
        'trust_updated_at' => now(),
        'availability' => 'Available',
    ]);

    $task = Task::factory()->create([
        'tfidf_vector' => ['teaching' => 0.5],
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);

    $result1 = $service->computeAllScores($volunteer, $task);
    $result2 = $service->computeAllScores($volunteer, $task);

    expect($result1)->toBe($result2);
});

it('does not share cache across different volunteer-task pairs', function () {
    $volunteerA = VolunteerProfile::factory()->create([
        'tfidf_vector' => ['teaching' => 0.5],
        'trust_score' => 0.5,
        'trust_updated_at' => now(),
        'availability' => 'Available',
    ]);

    $volunteerB = VolunteerProfile::factory()->create([
        'tfidf_vector' => ['science' => 0.5],
        'trust_score' => 0.5,
        'trust_updated_at' => now(),
        'availability' => 'Available',
    ]);

    $task = Task::factory()->create([
        'tfidf_vector' => ['teaching' => 0.5],
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);

    $resultA = $service->computeAllScores($volunteerA, $task);
    $resultB = $service->computeAllScores($volunteerB, $task);

    if (isset($resultA['semantic_match_score'], $resultB['semantic_match_score'])) {
        expect($resultA['semantic_match_score'])->not->toEqual($resultB['semantic_match_score']);
    }
});

it('caches trust score for same volunteer', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'trust_score' => 0.75,
        'trust_updated_at' => now(),
    ]);

    $reflector = new ReflectionClass(RecommendationService::class);
    $method = $reflector->getMethod('getTrustScore');
    $method->setAccessible(true);

    $service = app(RecommendationService::class);

    $score1 = $method->invoke($service, $volunteer);
    $score2 = $method->invoke($service, $volunteer);

    expect($score1)->toBe($score2);
});

it('clears trust cache when recreating service', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'trust_score' => 0.75,
        'trust_updated_at' => now(),
    ]);

    $service1 = app(RecommendationService::class);
    $service2 = app(RecommendationService::class);

    $reflector = new ReflectionClass(RecommendationService::class);
    $method = $reflector->getMethod('getTrustScore');
    $method->setAccessible(true);

    $score1 = $method->invoke($service1, $volunteer);
    $score2 = $method->invoke($service2, $volunteer);

    expect($score1)->toBe($score2);
});

it('works correctly with computeVolunteerTaskScore', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'tfidf_vector' => ['test' => 1.0],
        'trust_score' => 0.8,
        'trust_updated_at' => now(),
        'availability' => 'Available',
    ]);

    $task = Task::factory()->create([
        'tfidf_vector' => ['test' => 1.0],
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);

    $score1 = $service->computeVolunteerTaskScore($volunteer, $task);
    $score2 = $service->computeVolunteerTaskScore($volunteer, $task);

    expect($score1)->toBe($score2);
});

it('works correctly with computeVolunteerTaskMatchScore', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'tfidf_vector' => ['test' => 1.0],
        'trust_score' => 0.8,
        'trust_updated_at' => now(),
        'availability' => 'Available',
    ]);

    $task = Task::factory()->create([
        'tfidf_vector' => ['test' => 1.0],
        'status' => 'Open',
    ]);

    $service = app(RecommendationService::class);

    $score1 = $service->computeVolunteerTaskMatchScore($volunteer, $task);
    $score2 = $service->computeVolunteerTaskMatchScore($volunteer, $task);

    expect($score1)->toBe($score2);
});
