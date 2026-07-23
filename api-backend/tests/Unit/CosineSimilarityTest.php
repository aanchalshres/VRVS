<?php

use App\Algorithms\Matching\CosineSimilarity;

beforeEach(function () {
    $this->similarity = new CosineSimilarity();
});

it('returns 1 for identical vectors', function () {
    $result = $this->similarity->calculate(
        ['term1' => 0.5, 'term2' => 0.5],
        ['term1' => 0.5, 'term2' => 0.5]
    );

    expect(round($result, 10))->toEqual(1.0);
});

it('returns 0 for orthogonal vectors', function () {
    $result = $this->similarity->calculate(
        ['term1' => 1.0],
        ['term2' => 1.0]
    );

    expect($result)->toEqual(0.0);
});

it('returns value between 0 and 1 for partially similar vectors', function () {
    $result = $this->similarity->calculate(
        ['term1' => 0.8, 'term2' => 0.2],
        ['term1' => 0.3, 'term3' => 0.7]
    );

    expect($result)->toBeGreaterThan(0);
    expect($result)->toBeLessThan(1);
});

it('handles empty vector A', function () {
    $result = $this->similarity->calculate(
        [],
        ['term1' => 0.5, 'term2' => 0.5]
    );

    expect($result)->toBe(0.0);
});

it('handles empty vector B', function () {
    $result = $this->similarity->calculate(
        ['term1' => 0.5, 'term2' => 0.5],
        []
    );

    expect($result)->toEqual(0.0);
});

it('handles both empty vectors', function () {
    $result = $this->similarity->calculate([], []);

    expect($result)->toEqual(0.0);
});

it('handles single-element identical vectors', function () {
    $result = $this->similarity->calculate(
        ['term' => 0.42],
        ['term' => 0.42]
    );

    expect($result)->toEqual(1.0);
});

it('handles vectors with zero weights', function () {
    $result = $this->similarity->calculate(
        ['term1' => 0.0],
        ['term1' => 0.5]
    );

    expect($result)->toEqual(0.0);
});

it('is symmetric', function () {
    $v1 = ['a' => 0.3, 'b' => 0.7];
    $v2 = ['b' => 0.4, 'c' => 0.6];

    expect($this->similarity->calculate($v1, $v2))
        ->toEqual($this->similarity->calculate($v2, $v1));
});

it('handles large weight differences', function () {
    $result = $this->similarity->calculate(
        ['term' => 1000.0],
        ['term' => 0.001]
    );

    expect($result)->toEqual(1.0);
});
