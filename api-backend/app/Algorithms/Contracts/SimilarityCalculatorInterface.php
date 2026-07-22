<?php

namespace App\Algorithms\Contracts;

interface SimilarityCalculatorInterface
{
    public function calculate(
        array $vectorA,
        array $vectorB
    ): float;
}
