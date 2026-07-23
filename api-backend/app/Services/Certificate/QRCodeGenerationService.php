<?php

namespace App\Services\Certificate;

use App\Algorithms\Contracts\QRCodeInterface;

class QRCodeGenerationService implements QRCodeInterface
{
    public function generate(string $data, string $path): string
    {
        $dataUri = $this->getDataUri($data);

        $base64 = explode(',', $dataUri, 2)[1] ?? '';
        $binary = base64_decode($base64);
        file_put_contents($path, $binary);

        return $path;
    }

    public function getDataUri(string $data): string
    {
        $size = 10;
        $margin = 2;
        $qr = $this->createQrMatrix($data);

        $moduleCount = count($qr);
        $imageSize = ($moduleCount + 2 * $margin) * $size;

        $image = imagecreatetruecolor($imageSize, $imageSize);
        if (!$image) return '';

        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);
        imagefill($image, 0, 0, $white);

        for ($row = 0; $row < $moduleCount; $row++) {
            for ($col = 0; $col < $moduleCount; $col++) {
                if ($qr[$row][$col]) {
                    imagefilledrectangle(
                        $image,
                        ($col + $margin) * $size,
                        ($row + $margin) * $size,
                        ($col + $margin + 1) * $size - 1,
                        ($row + $margin + 1) * $size - 1,
                        $black
                    );
                }
            }
        }

        ob_start();
        imagepng($image);
        $pngData = ob_get_clean();
        imagedestroy($image);

        return 'data:image/png;base64,' . base64_encode($pngData);
    }

    private function createQrMatrix(string $data): array
    {
        $len = strlen($data);
        $size = 21;
        while ($size < 41 && $len > ($size - 8) * ($size - 8) / 8) {
            $size += 4;
        }
        $size = max($size, 21);

        $matrix = array_fill(0, $size, array_fill(0, $size, false));

        $version = ($size - 17) / 4;

        $this->addFinderPatterns($matrix, $size);
        $this->addTimingPatterns($matrix, $size);
        $this->addFormatInfo($matrix, $size);

        $bitIndex = 0;
        $dataBits = [];
        foreach (str_split($data) as $char) {
            $byte = ord($char);
            for ($b = 7; $b >= 0; $b--) {
                $dataBits[] = (bool)($byte & (1 << $b));
            }
        }

        $dataBits = array_pad($dataBits, (int)(ceil(count($dataBits) / 8) * 8), false);
        $totalModules = ($size * $size);

        $dummyPad = array_fill(0, $totalModules, false);
        for ($i = 0; $i < min(count($dataBits), $totalModules); $i++) {
            $dummyPad[$i] = $dataBits[$i];
        }
        $dataBits = $dummyPad;

        $row = $size - 1;
        $col = $size - 1;
        $direction = -1;

        while ($col > 0) {
            if ($col === 6) {
                $col--;
                continue;
            }

            $skip = false;
            for ($r = 0; $r < 2; $r++) {
                $c = $col - $r;
                if ($c < 0) continue;
                if ($this->isFunctionModule($matrix, $size, $row, $c)) {
                    $skip = true;
                    continue;
                }
                if ($skip) continue;

                if (isset($dataBits[$bitIndex]) && $dataBits[$bitIndex]) {
                    $matrix[$row][$c] = !$matrix[$row][$c];
                }
                $bitIndex++;
            }

            $row += $direction;
            if ($row < 0 || $row >= $size) {
                $direction *= -1;
                $row += $direction;
                $col -= 2;
                if ($col === 6) $col--;
            }
        }

        $this->applyMask($matrix, $size);

        return $matrix;
    }

    private function isFunctionModule(array &$matrix, int $size, int $row, int $col): bool
    {
        if ($row < 9 && $col < 9) return true;
        if ($row < 9 && $col >= $size - 8) return true;
        if ($row >= $size - 8 && $col < 9) return true;
        if ($row === 6 || $col === 6) return true;
        return false;
    }

    private function addFinderPatterns(array &$matrix, int $size): void
    {
        $this->drawFinderPattern($matrix, 0, 0);
        $this->drawFinderPattern($matrix, $size - 7, 0);
        $this->drawFinderPattern($matrix, 0, $size - 7);
    }

    private function drawFinderPattern(array &$matrix, int $startRow, int $startCol): void
    {
        for ($r = -1; $r <= 7; $r++) {
            for ($c = -1; $c <= 7; $c++) {
                $row = $startRow + $r;
                $col = $startCol + $c;
                if ($row < 0 || $col < 0 || $row >= count($matrix) || $col >= count($matrix)) continue;
                $isBorder = $r === -1 || $c === -1 || $r === 7 || $c === 7;
                $isInner = ($r >= 2 && $r <= 4) && ($c >= 2 && $c <= 4);
                $matrix[$row][$col] = $isBorder || $isInner;
            }
        }
    }

    private function addTimingPatterns(array &$matrix, int $size): void
    {
        for ($i = 8; $i < $size - 8; $i++) {
            $matrix[6][$i] = $i % 2 === 0;
            $matrix[$i][6] = $i % 2 === 0;
        }
    }

    private function addFormatInfo(array &$matrix, int $size): void
    {
        $formatBits = [1,0,0,1,1,1,0,1,1,1,0,0,1,0,0,1];
        $formatIdx = 0;

        for ($i = 0; $i <= 5; $i++) {
            if ($formatIdx < count($formatBits)) {
                $matrix[8][$i] = $formatBits[$formatIdx++] === 1;
            }
        }
        for ($i = 7; $i <= 8; $i++) {
            if ($formatIdx < count($formatBits)) {
                $matrix[8][$i] = $formatBits[$formatIdx++] === 1;
            }
        }
        for ($i = $size - 8; $i < $size; $i++) {
            if ($formatIdx < count($formatBits)) {
                $matrix[8][$i] = $formatBits[$formatIdx++] === 1;
            }
        }

        $formatIdx = 0;
        for ($i = 0; $i <= 5; $i++) {
            if ($formatIdx < count($formatBits)) {
                $matrix[$i][8] = $formatBits[$formatIdx++] === 1;
            }
        }
        for ($i = $size - 7; $i <= $size - 1; $i++) {
            if ($formatIdx < count($formatBits)) {
                $matrix[$i][8] = $formatBits[$formatIdx++] === 1;
            }
        }
        if ($formatIdx < count($formatBits)) {
            $matrix[7][8] = $formatBits[$formatIdx++] === 1;
        }
    }

    private function applyMask(array &$matrix, int $size): void
    {
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                if ($this->isFunctionModule($matrix, $size, $r, $c)) continue;
                if (($r + $c) % 2 === 0) {
                    $matrix[$r][$c] = !$matrix[$r][$c];
                }
            }
        }
    }
}
