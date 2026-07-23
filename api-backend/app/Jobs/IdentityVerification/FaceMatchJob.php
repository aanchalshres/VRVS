<?php

namespace App\Jobs\IdentityVerification;

use App\Models\IdentityVerification\IdentityDocument;
use App\Models\IdentityVerification\IdentitySelfie;
use App\Services\IdentityVerification\FaceMatchingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FaceMatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public function __construct(
        private int $documentId,
        private int $selfieId,
    ) {}

    public function handle(FaceMatchingService $faceMatchingService): void
    {
        $document = IdentityDocument::find($this->documentId);
        $selfie = IdentitySelfie::find($this->selfieId);

        if (!$document || !$selfie) {
            return;
        }

        $result = $faceMatchingService->compare($document->file_path, $selfie->file_path);

        $selfie->update([
            'face_detection_status' => $result['face_detection_status'],
            'faces_detected' => $result['detection']['faces_detected'] ?? null,
            'image_quality_score' => $result['detection']['image_quality'] ?? null,
            'is_blurry' => $result['detection']['is_blurry'] ?? null,
        ]);
    }
}
