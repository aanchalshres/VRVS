<?php

uses(Tests\TestCase::class);

use App\Services\TrustScoreService;
use App\Models\VolunteerProfile;
use App\Models\User;

it('returns default score for profile with no activity', function () {
    $profile = VolunteerProfile::factory()->create();

    $service = app(TrustScoreService::class);
    $result = $service->calculateForVolunteer($profile);

    expect($result['final_score'])->toBe(0.5);
    expect($result['components'])->toHaveKeys(['attendance', 'completion', 'ratings', 'verification', 'response', 'penalties']);
});

it('persists trust_score_components on recalculate', function () {
    $profile = VolunteerProfile::factory()->create();

    $service = app(TrustScoreService::class);
    $refreshed = $service->recalculate($profile);

    expect($refreshed->trust_score)->toBeFloat();
    expect($refreshed->trust_score_components)->toBeArray();
    expect($refreshed->trust_score_components)->toHaveKeys(['attendance', 'completion', 'ratings', 'verification', 'response', 'penalties']);
});

it('keeps trust_score synchronized with trust_score_components', function () {
    $profile = VolunteerProfile::factory()->create();

    $service = app(TrustScoreService::class);
    $refreshed = $service->recalculate($profile);

    $components = $refreshed->trust_score_components;
    $expectedScore = round(
        (0.25 * $components['attendance']) +
        (0.20 * $components['completion']) +
        (0.20 * $components['ratings']) +
        (0.15 * $components['verification']) +
        (0.10 * $components['response']) -
        (0.10 * $components['penalties']),
        4
    );

    $expectedScore = max(0.05, min(1.0, $expectedScore));
    expect($refreshed->trust_score)->toEqual($expectedScore);
});

it('returns score between MIN_SCORE and 1.0', function () {
    $profile = VolunteerProfile::factory()->create();
    $service = app(TrustScoreService::class);

    $result = $service->calculateForVolunteer($profile);

    expect($result['final_score'])->toBeGreaterThanOrEqual(0.05);
    expect($result['final_score'])->toBeLessThanOrEqual(1.0);
});

it('updates trust_updated_at timestamp', function () {
    $profile = VolunteerProfile::factory()->create();

    $service = app(TrustScoreService::class);
    $refreshed = $service->recalculate($profile);

    expect($refreshed->trust_updated_at)->not->toBeNull();
});

it('recalculates all volunteers', function () {
    VolunteerProfile::factory(3)->create();

    $service = app(TrustScoreService::class);
    $count = $service->recalculateAll();

    expect($count)->toBe(3);
});

it('produces deterministic results for same input', function () {
    $profile = VolunteerProfile::factory()->create();

    $service = app(TrustScoreService::class);
    $result1 = $service->calculateForVolunteer($profile);
    $result2 = $service->calculateForVolunteer($profile->fresh());

    expect($result1)->toEqual($result2);
});
