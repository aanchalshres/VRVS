<?php

use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\RecommendationService;

uses(Tests\TestCase::class);

it('returns same instance for same volunteer-task pair', function () {
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

it('computes different scores for different volunteers', function () {
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

    expect($resultA['semantic_match_score'])->not->toEqual($resultB['semantic_match_score']);
});

it('caches trust score for same volunteer across calls', function () {
    $volunteer = VolunteerProfile::factory()->create([
        'trust_score' => 0.75,
        'trust_updated_at' => now(),
        'tfidf_vector' => ['test' => 0.5],
        'availability' => 'Available',
    ]);

    $service = app(RecommendationService::class);

    $method = (new ReflectionClass(RecommendationService::class))
        ->getMethod('getTrustScore');
    $method->setAccessible(true);

    $score1 = $method->invoke($service, $volunteer);
    $score2 = $method->invoke($service, $volunteer);

    expect($score1)->toBe($score2);
});
