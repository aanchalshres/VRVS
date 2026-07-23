<?php

namespace App\Algorithms\IdentityVerification\Contracts;

interface FaceMatchingProviderInterface
{
    public function compare(string $sourceImage, string $targetImage): array;

    public function detect(string $imagePath): array;
}
