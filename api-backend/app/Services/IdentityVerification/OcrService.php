<?php

namespace App\Services\IdentityVerification;

use App\Algorithms\IdentityVerification\Contracts\OcrProviderInterface;
use App\Algorithms\IdentityVerification\Ocr\StructuredOcrParser;

class OcrService
{
    public function __construct(
        private OcrProviderInterface $ocrProvider,
        private StructuredOcrParser $parser,
    ) {}

    public function process(string $filePath, string $documentType): array
    {
        $rawResult = $this->ocrProvider->extract($filePath);

        $ocrConfidence = $this->ocrProvider->getConfidence();

        $structured = $this->parser->parse($documentType, $rawResult);

        return [
            'raw_text' => $rawResult['raw_text'] ?? '',
            'lines' => $rawResult['lines'] ?? [],
            'ocr_confidence' => $ocrConfidence,
            'extracted_data' => $structured,
        ];
    }
}
