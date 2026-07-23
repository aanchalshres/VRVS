<?php

namespace App\Services\IdentityVerification;

use App\Algorithms\IdentityVerification\Contracts\LivenessDetectionProviderInterface;

class LivenessDetectionService
{
    public function __construct(
        private LivenessDetectionProviderInterface $livenessProvider,
    ) {}

    public function analyze(string $imagePath): array
    {
        $result = $this->livenessProvider->analyze($imagePath);

        $score = match ($result['status'] ?? 'failed') {
            'passed' => $result['confidence'] ?? 90,
            'uncertain' => ($result['confidence'] ?? 50) * 0.5,
            default => 0,
        };

        return [
            'liveness_score' => round(max(0, min(100, $score)), 2),
            'passed' => $result['passed'] ?? false,
            'status' => $result['status'] ?? 'failed',
            'details' => $result['details'] ?? 'Liveness check could not be completed',
            'raw_result' => $result,
        ];
    }
}
