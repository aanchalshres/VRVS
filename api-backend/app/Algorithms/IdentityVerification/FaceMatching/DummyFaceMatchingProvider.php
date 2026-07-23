<?php

namespace App\Algorithms\IdentityVerification\FaceMatching;

use App\Algorithms\IdentityVerification\Contracts\FaceMatchingProviderInterface;

class DummyFaceMatchingProvider implements FaceMatchingProviderInterface
{
    public function compare(string $sourceImage, string $targetImage): array
    {
        $sourcePath = $this->resolvePath($sourceImage);
        $targetPath = $this->resolvePath($targetImage);

        $sourceMd5 = $sourcePath && file_exists($sourcePath) ? md5_file($sourcePath) : null;
        $targetMd5 = $targetPath && file_exists($targetPath) ? md5_file($targetPath) : null;

        $similarity = 50;

        if ($sourceMd5 && $targetMd5) {
            $lev = levenshtein($sourceMd5, $targetMd5);
            $maxLen = max(strlen($sourceMd5), strlen($targetMd5));
            $similarity = $maxLen > 0 ? round((1 - $lev / $maxLen) * 100, 2) : 50;
        }

        return [
            'similarity_score' => $similarity,
            'match_confidence' => $similarity > 70 ? 85 : ($similarity > 40 ? 50 : 20),
            'matched' => $similarity > 70,
            'source_faces_detected' => 1,
            'target_faces_detected' => 1,
        ];
    }

    public function detect(string $imagePath): array
    {
        $fullPath = $this->resolvePath($imagePath);

        if (!$fullPath || !file_exists($fullPath)) {
            return [
                'faces_detected' => 0,
                'status' => 'no_face',
                'message' => 'Image not found or unreadable',
            ];
        }

        $imageInfo = @getimagesize($fullPath);

        if (!$imageInfo) {
            return [
                'faces_detected' => 0,
                'status' => 'unreadable',
                'message' => 'Cannot read image metadata',
            ];
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];

        $quality = $this->assessImageQuality($width, $height, filesize($fullPath));

        return [
            'faces_detected' => 1,
            'status' => 'single_face',
            'message' => 'Face detected (simulated)',
            'image_width' => $width,
            'image_height' => $height,
            'image_quality' => $quality['score'],
            'is_blurry' => $quality['is_blurry'],
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

    private function assessImageQuality(int $width, int $height, int $fileSize): array
    {
        $minDim = min($width, $height);
        $maxDim = max($width, $height);

        $dimensionScore = match (true) {
            $minDim >= 1000 => 100,
            $minDim >= 600 => 80,
            $minDim >= 300 => 50,
            default => 20,
        };

        $sizeScore = match (true) {
            $fileSize > 500000 => 100,
            $fileSize > 200000 => 80,
            $fileSize > 50000 => 50,
            default => 30,
        };

        $aspectRatio = $maxDim / max($minDim, 1);
        $ratioScore = $aspectRatio < 2 ? 100 : ($aspectRatio < 3 ? 70 : 40);

        $score = round(($dimensionScore * 0.4 + $sizeScore * 0.3 + $ratioScore * 0.3), 2);

        return [
            'score' => $score,
            'is_blurry' => $score < 40,
        ];
    }
}
