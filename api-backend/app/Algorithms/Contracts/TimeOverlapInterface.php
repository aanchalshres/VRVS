<?php

namespace App\Algorithms\Contracts;

interface TimeOverlapInterface
{
    public function calculateOverlap(
        ?string $taskAStart, ?string $taskAEnd,
        ?string $taskBStart, ?string $taskBEnd
    ): array;

    public function hasOverlap(
        ?string $taskAStart, ?string $taskAEnd,
        ?string $taskBStart, ?string $taskBEnd,
        int $bufferMinutes = 0
    ): bool;

    public function classifyConflict(float $overlapRatio): string;
}
