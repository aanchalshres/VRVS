<?php

namespace App\Jobs\IdentityVerification;

use App\Models\IdentityVerification\IdentityDocument;
use App\Services\IdentityVerification\OcrService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class OcrProcessJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public function __construct(
        private int $documentId,
    ) {}

    public function handle(OcrService $ocrService): void
    {
        $document = IdentityDocument::with('verification')->find($this->documentId);

        if (!$document || !$document->verification) {
            return;
        }

        $result = $ocrService->process($document->file_path, $document->document_type);

        $document->update([
            'ocr_extracted_data' => $result['extracted_data'],
            'ocr_confidence' => $result['ocr_confidence'],
            'ocr_status' => 'completed',
        ]);
    }
}
