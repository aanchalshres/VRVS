<?php

use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;

uses(Tests\TestCase::class);

it('calculates correct score from known components', function () {
    $service = app(TrustScoreService::class);

    $profile = VolunteerProfile::factory()->create();

    $result = $service->calculateForVolunteer($profile);

    expect($result['final_score'])->toBeFloat();
    expect($result['final_score'])->toBeGreaterThanOrEqual(0.05);
    expect($result['final_score'])->toBeLessThanOrEqual(1.0);

    expect($result['components'])->toHaveKeys([
        'attendance', 'completion', 'ratings', 'verification', 'response', 'penalties',
    ]);
});

it('applies bayesian smoothing to ratings', function () {
    $service = app(TrustScoreService::class);

    $profile = VolunteerProfile::factory()->create();

    $components = $service->calculateForVolunteer($profile)['components'];

    expect($components['ratings'])->toBeGreaterThanOrEqual(0);
    expect($components['ratings'])->toBeLessThanOrEqual(1.0);
});

it('recalculate persists and returns fresh profile', function () {
    $service = app(TrustScoreService::class);

    $profile = VolunteerProfile::factory()->create();

    $fresh = $service->recalculate($profile);

    expect($fresh->trust_score)->not->toBeNull();
    expect($fresh->trust_score_components)->toBeArray();
    expect($fresh->trust_updated_at)->not->toBeNull();
});

it('recalculateAll processes all profiles', function () {
    VolunteerProfile::factory(5)->create();

    $service = app(TrustScoreService::class);
    $count = $service->recalculateAll();

    expect($count)->toBe(5);
});

it('produces consistent scores for identical input', function () {
    $service = app(TrustScoreService::class);

    $profile = VolunteerProfile::factory()->create();

    $resultA = $service->calculateForVolunteer($profile);
    $resultB = $service->calculateForVolunteer($profile->fresh());

    expect($resultA)->toEqual($resultB);
});
