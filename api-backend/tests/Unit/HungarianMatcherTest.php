<?php

use App\Algorithms\Assignment\HungarianMatcher;

beforeEach(function () {
    $this->matcher = new HungarianMatcher();
});

it('solves 2x2 cost matrix optimally', function () {
    $matrix = [
        [4, 2],
        [3, 5],
    ];

    $result = $this->matcher->solve($matrix);

    expect($result)->toHaveCount(2);
    expect($result[0])->toBe(1);
    expect($result[1])->toBe(0);
});

it('solves 3x3 identity cost matrix', function () {
    $matrix = [
        [1, 10, 10],
        [10, 1, 10],
        [10, 10, 1],
    ];

    $result = $this->matcher->solve($matrix);

    expect($result)->toHaveCount(3);
    expect($result[0])->toBe(0);
    expect($result[1])->toBe(1);
    expect($result[2])->toBe(2);
});

it('solves 1x1 matrix', function () {
    $result = $this->matcher->solve([[5]]);

    expect($result[0])->toBe(0);
});

it('prefers lower cost assignments', function () {
    $matrix = [
        [10, 1],
        [1, 10],
    ];

    $result = $this->matcher->solve($matrix);

    expect($result[0])->toBe(1);
    expect($result[1])->toBe(0);
});

it('handles zero-cost matrix', function () {
    $matrix = [
        [0, 0],
        [0, 0],
    ];

    $result = $this->matcher->solve($matrix);

    expect($result)->toHaveCount(2);
});

it('handles 4x4 matrix', function () {
    $matrix = [
        [9, 2, 7, 8],
        [6, 4, 3, 7],
        [5, 8, 1, 8],
        [7, 6, 9, 4],
    ];

    $result = $this->matcher->solve($matrix);

    expect($result)->toHaveCount(4);
    $uniqueTasks = array_unique(array_values($result));
    expect($uniqueTasks)->toHaveCount(4);
});

it('assigns all rows to unique columns', function () {
    $matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ];

    $result = $this->matcher->solve($matrix);

    $uniqueTasks = array_unique(array_values($result));
    expect($uniqueTasks)->toHaveCount(3);
});

it('handles floating point costs', function () {
    $matrix = [
        [0.1, 0.9],
        [0.8, 0.2],
    ];

    $result = $this->matcher->solve($matrix);

    expect($result[0])->toBe(0);
    expect($result[1])->toBe(1);
});

it('solves 5x5 matrix', function () {
    $matrix = array_fill(0, 5, array_fill(0, 5, 1));
    $matrix[0][0] = 0.1;
    $matrix[1][1] = 0.1;
    $matrix[2][2] = 0.1;
    $matrix[3][3] = 0.1;
    $matrix[4][4] = 0.1;

    $result = $this->matcher->solve($matrix);

    expect($result[0])->toBe(0);
    expect($result[1])->toBe(1);
    expect($result[2])->toBe(2);
    expect($result[3])->toBe(3);
    expect($result[4])->toBe(4);
});
