<?php

namespace App\Algorithms\IdentityVerification\Contracts;

interface OcrProviderInterface
{
    public function extract(string $imagePath): array;

    public function getConfidence(): float;
}
