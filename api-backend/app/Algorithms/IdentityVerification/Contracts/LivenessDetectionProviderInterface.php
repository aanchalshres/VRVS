<?php

namespace App\Algorithms\IdentityVerification\Contracts;

interface LivenessDetectionProviderInterface
{
    public function analyze(string $imagePath): array;
}
