<?php

namespace App\Algorithms\IdentityVerification\Liveness;

use App\Algorithms\IdentityVerification\Contracts\LivenessDetectionProviderInterface;

class DummyLivenessDetectionProvider implements LivenessDetectionProviderInterface
{
    public function analyze(string $imagePath): array
    {
        $fullPath = $this->resolvePath($imagePath);

        if (!$fullPath || !file_exists($fullPath)) {
            return [
                'passed' => false,
                'status' => 'failed',
                'confidence' => 0,
                'details' => 'Image not found',
            ];
        }

        $imageInfo = @getimagesize($fullPath);

        if (!$imageInfo) {
            return [
                'passed' => false,
                'status' => 'failed',
                'confidence' => 0,
                'details' => 'Unreadable image',
            ];
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $fileSize = filesize($fullPath);

        $qualityScore = $this->assumeQuality($width, $height, $fileSize);

        $confidence = $qualityScore;

        $passed = $confidence > 50;

        $status = match (true) {
            $confidence >= 80 => 'passed',
            $confidence >= 50 => 'uncertain',
            default => 'failed',
        };

        $details = match (true) {
            $confidence >= 80 => 'Image appears to be from a live source',
            $confidence >= 50 => 'Image quality is marginal, manual review recommended',
            default => 'Possible spoof attempt detected: low image quality',
        };

        return [
            'passed' => $passed,
            'status' => $status,
            'confidence' => round($confidence, 2),
            'details' => $details,
            'quality_score' => $qualityScore,
        ];
    }

    private function resolvePath(string $path): ?string
    {
        if (file_exists($path)) {
            return $path;
        }
        $storagePath = storage_path("app/public/{$path}");
        if (file_exists($storagePath)) {
            return $storagePath;
        }
        $publicPath = public_path("storage/{$path}");
        if (file_exists($publicPath)) {
            return $publicPath;
        }
        return null;
    }

    private function assumeQuality(int $width, int $height, int $fileSize): float
    {
        $minDim = min($width, $height);

        $dimScore = match (true) {
            $minDim >= 800 => 100,
            $minDim >= 500 => 80,
            $minDim >= 300 => 50,
            default => 20,
        };

        $sizeScore = match (true) {
            $fileSize > 300000 => 100,
            $fileSize > 100000 => 80,
            $fileSize > 30000 => 50,
            default => 30,
        };

        return ($dimScore * 0.5 + $sizeScore * 0.5);
    }
}
