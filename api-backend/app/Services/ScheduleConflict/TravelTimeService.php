<?php

namespace App\Services\ScheduleConflict;

use App\Algorithms\Contracts\TravelTimeInterface;

class TravelTimeService implements TravelTimeInterface
{
    private array $config;

    public function __construct()
    {
        $this->config = config('schedule-conflict');
    }

    public function estimateMinutes(
        ?float $lat1, ?float $lng1,
        ?float $lat2, ?float $lng2
    ): int {
        $distance = $this->distanceKm($lat1, $lng1, $lat2, $lng2);
        if ($distance === null) return 0;

        $speed = $this->config['travel_speed_kmh'] ?? 30;
        $hours = $distance / max($speed, 1);

        return (int)ceil($hours * 60);
    }

    public function distanceKm(
        ?float $lat1, ?float $lng1,
        ?float $lat2, ?float $lng2
    ): ?float {
        if ($lat1 === null || $lng1 === null || $lat2 === null || $lng2 === null) {
            return null;
        }

        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }
}
