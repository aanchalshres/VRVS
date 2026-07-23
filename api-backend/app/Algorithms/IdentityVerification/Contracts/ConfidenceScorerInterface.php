<?php

namespace App\Algorithms\IdentityVerification\Contracts;

interface ConfidenceScorerInterface
{
    public function calculate(array $scores): array;

    public function decide(float $confidenceScore): array;
}
