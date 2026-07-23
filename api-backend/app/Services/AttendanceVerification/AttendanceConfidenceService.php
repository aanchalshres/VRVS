<?php

namespace App\Services\AttendanceVerification;

use App\Services\AttendanceVerification\Contracts\AttendanceConfidenceServiceInterface;

class AttendanceConfidenceService implements AttendanceConfidenceServiceInterface
{
    public function __construct(
        private array $weightConfig = [],
        private array $thresholdConfig = []
    ) {
        $this->weightConfig = config('attendance-verification.weights', []);
        $this->thresholdConfig = config('attendance-verification.thresholds', []);
    }

    public function calculate(array $components): array
    {
        $weights = $this->weightConfig;
        $totalWeight = array_sum($weights);
        if ($totalWeight <= 0) {
            $weights = [
                'qr_validity' => 0.30,
                'gps_accuracy' => 0.35,
                'time_validity' => 0.25,
                'device_consistency' => 0.10,
            ];
        }

        $weightedSum = 0;
        $details = [];

        foreach ($weights as $key => $weight) {
            $score = $components[$key] ?? 0;
            $weightedSum += $score * $weight;
            $details[$key] = [
                'score' => round($score, 1),
                'weight' => $weight,
                'contribution' => round($score * $weight, 1),
            ];
        }

        $finalScore = round($weightedSum, 1);
        $level = $this->classify($finalScore);

        return [
            'score' => $finalScore,
            'level' => $level,
            'details' => $details,
        ];
    }

    public function classify(float $score): string
    {
        $thresholds = $this->thresholdConfig;
        $high = $thresholds['high'] ?? 85;
        $medium = $thresholds['medium'] ?? 65;
        $low = $thresholds['low'] ?? 40;

        if ($score >= $high) return 'high';
        if ($score >= $medium) return 'medium';
        if ($score >= $low) return 'low';
        return 'manual_review';
    }
}
