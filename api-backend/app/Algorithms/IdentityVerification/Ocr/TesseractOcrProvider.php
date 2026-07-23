<?php

namespace App\Algorithms\IdentityVerification\Ocr;

use App\Algorithms\IdentityVerification\Contracts\OcrProviderInterface;

class TesseractOcrProvider implements OcrProviderInterface
{
    private float $confidence = 0;

    public function extract(string $imagePath): array
    {
        $fullPath = storage_path("app/public/{$imagePath}");

        if (!file_exists($fullPath)) {
            $this->confidence = 0;
            return [];
        }

        $escapedPath = escapeshellarg($fullPath);

        $output = shell_exec("tesseract {$escapedPath} stdout 2>/dev/null");

        if ($output === null || trim($output) === '') {
            $this->confidence = 0;
            return [];
        }

        $text = trim($output);
        $lines = array_filter(explode("\n", $text), fn($l) => trim($l) !== '');
        $lines = array_values($lines);

        $this->confidence = $this->estimateConfidence($lines);

        return [
            'raw_text' => $text,
            'lines' => $lines,
            'line_count' => count($lines),
        ];
    }

    public function getConfidence(): float
    {
        return $this->confidence;
    }

    private function estimateConfidence(array $lines): float
    {
        if (empty($lines)) {
            return 0;
        }

        $totalChars = 0;
        $alphaChars = 0;

        foreach ($lines as $line) {
            $len = strlen($line);
            $totalChars += $len;
            $alphaChars += preg_match_all('/[a-zA-Z0-9]/', $line);
        }

        if ($totalChars === 0) {
            return 0;
        }

        $ratio = $alphaChars / $totalChars;

        $lineLengthScore = min(1, count($lines) / 10);

        return round(($ratio * 0.7 + $lineLengthScore * 0.3) * 100, 2);
    }
}
