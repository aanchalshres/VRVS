<?php

namespace App\Algorithms\IdentityVerification\DocumentValidation;

use App\Algorithms\IdentityVerification\Contracts\DocumentValidatorInterface;
use Illuminate\Http\UploadedFile;

class DocumentValidator implements DocumentValidatorInterface
{
    private array $allowedTypes;

    private int $maxSize;

    private int $minWidth;

    private int $minHeight;

    public function __construct()
    {
        $this->allowedTypes = config('identity-verification.document_validation.allowed_mime_types', [
            'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
        ]);
        $this->maxSize = config('identity-verification.document_validation.max_file_size', 10 * 1024 * 1024);
        $this->minWidth = config('identity-verification.document_validation.min_image_width', 600);
        $this->minHeight = config('identity-verification.document_validation.min_image_height', 400);
    }

    public function validate(UploadedFile $file): array
    {
        $errors = [];
        $warnings = [];

        if (!in_array($file->getMimeType(), $this->allowedTypes)) {
            $errors[] = "Unsupported file type: {$file->getMimeType()}";
        }

        if ($file->getSize() > $this->maxSize) {
            $errors[] = 'File exceeds maximum size of ' . ($this->maxSize / 1024 / 1024) . 'MB';
        }

        if ($file->getSize() === 0) {
            $errors[] = 'File is empty';
        }

        if (str_starts_with($file->getMimeType(), 'image/')) {
            $imageInfo = @getimagesize($file->getPathname());

            if (!$imageInfo) {
                $warnings[] = 'Cannot read image metadata';
            } else {
                if ($imageInfo[0] < $this->minWidth) {
                    $errors[] = "Image width {$imageInfo[0]}px is below minimum {$this->minWidth}px";
                }
                if ($imageInfo[1] < $this->minHeight) {
                    $errors[] = "Image height {$imageInfo[1]}px is below minimum {$this->minHeight}px";
                }
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'original_name' => $file->getClientOriginalName(),
        ];
    }

    public function validateImageQuality(string $imagePath): array
    {
        $fullPath = $this->resolvePath($imagePath);

        if (!$fullPath || !file_exists($fullPath)) {
            return [
                'score' => 0,
                'is_blurry' => true,
                'missing_corners' => true,
                'errors' => ['Image not found'],
            ];
        }

        $imageInfo = @getimagesize($fullPath);

        if (!$imageInfo) {
            return [
                'score' => 0,
                'is_blurry' => true,
                'missing_corners' => false,
                'errors' => ['Cannot read image'],
            ];
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $fileSize = filesize($fullPath);

        $dimScore = match (true) {
            $width >= 2000 && $height >= 1500 => 100,
            $width >= 1200 && $height >= 800 => 80,
            $width >= $this->minWidth && $height >= $this->minHeight => 60,
            default => 30,
        };

        $sizeScore = match (true) {
            $fileSize > 1024 * 1024 => 100,
            $fileSize > 500 * 1024 => 80,
            $fileSize > 100 * 1024 => 50,
            default => 30,
        };

        $score = round($dimScore * 0.5 + $sizeScore * 0.5, 2);

        return [
            'score' => $score,
            'is_blurry' => $score < 40,
            'missing_corners' => false,
            'image_width' => $width,
            'image_height' => $height,
            'file_size' => $fileSize,
            'errors' => [],
        ];
    }

    private function resolvePath(string $path): ?string
    {
        if (file_exists($path)) return $path;
        $storagePath = storage_path("app/public/{$path}");
        if (file_exists($storagePath)) return $storagePath;
        $publicPath = public_path("storage/{$path}");
        if (file_exists($publicPath)) return $publicPath;
        return null;
    }
}
