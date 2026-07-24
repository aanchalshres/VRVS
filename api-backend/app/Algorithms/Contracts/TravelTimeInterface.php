<?php

namespace App\Algorithms\Contracts;

interface TravelTimeInterface
{
    public function estimateMinutes(
        ?float $lat1, ?float $lng1,
        ?float $lat2, ?float $lng2
    ): int;

    public function distanceKm(
        ?float $lat1, ?float $lng1,
        ?float $lat2, ?float $lng2
    ): ?float;
}
