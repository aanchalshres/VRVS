<?php

use App\Algorithms\Matching\HaversineDistance;

beforeEach(function () {
    $this->haversine = new HaversineDistance();
});

it('returns 0 for same coordinates', function () {
    $result = $this->haversine->calculate(27.7172, 85.3240, 27.7172, 85.3240);

    expect($result)->toBe(0.0);
});

it('calculates distance between Kathmandu and Pokhara', function () {
    $km = $this->haversine->calculate(27.7172, 85.3240, 28.2096, 83.9856);

    expect($km)->toBeGreaterThan(100);
    expect($km)->toBeLessThan(250);
});

it('calculates distance between London and New York', function () {
    $km = $this->haversine->calculate(51.5074, -0.1278, 40.7128, -74.0060);

    expect($km)->toBeGreaterThan(5500);
    expect($km)->toBeLessThan(5600);
});

it('handles antipodal points', function () {
    $km = $this->haversine->calculate(0.0, 0.0, 0.0, 180.0);

    expect($km)->toBeGreaterThan(20000);
});

it('handles equatorial distance', function () {
    $km = $this->haversine->calculate(0.0, 0.0, 0.0, 1.0);

    expect($km)->toBeGreaterThan(110);
    expect($km)->toBeLessThan(112);
});

it('handles negative latitudes', function () {
    $km = $this->haversine->calculate(-33.8688, 151.2093, -37.8136, 144.9631);

    expect($km)->toBeGreaterThan(700);
    expect($km)->toBeLessThan(800);
});

it('returns consistent results (symmetric)', function () {
    $d1 = $this->haversine->calculate(27.7172, 85.3240, 28.2096, 83.9856);
    $d2 = $this->haversine->calculate(28.2096, 83.9856, 27.7172, 85.3240);

    expect($d1)->toEqual($d2);
});

it('handles zero degrees latitude', function () {
    $km = $this->haversine->calculate(0.0, 0.0, 0.0, 0.0);

    expect($km)->toBe(0.0);
});

it('returns non-negative distance', function () {
    $km = $this->haversine->calculate(-90.0, -180.0, 90.0, 180.0);

    expect($km)->toBeGreaterThan(0);
});

it('handles small distances', function () {
    $km = $this->haversine->calculate(27.7172, 85.3240, 27.7175, 85.3243);

    expect($km)->toBeLessThan(1);
});
