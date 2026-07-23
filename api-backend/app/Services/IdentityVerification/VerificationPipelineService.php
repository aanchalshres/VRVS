<?php

namespace App\Services\IdentityVerification;

use App\Algorithms\IdentityVerification\Contracts\ConfidenceScorerInterface;
use App\Algorithms\IdentityVerification\DocumentValidation\DocumentValidator;
use App\Models\IdentityVerification\IdentityDocument;
use App\Models\IdentityVerification\IdentitySelfie;
use App\Models\IdentityVerification\IdentityVerification;
use App\Models\IdentityVerification\IdentityVerificationLog;
use App\Models\VolunteerProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class VerificationPipelineService
{
    public function __construct(
        private OcrService $ocrService,
        private FaceMatchingService $faceMatchingService,
        private LivenessDetectionService $livenessDetectionService,
        private DocumentValidator $documentValidator,
        private DataConsistencyService $dataConsistencyService,
        private ConfidenceScorerInterface $confidenceScorer,
    ) {}

    public function startVerification(VolunteerProfile $profile): IdentityVerification
    {
        $existing = IdentityVerification::where('verifiable_id', $profile->id)
            ->where('verifiable_type', VolunteerProfile::class)
            ->whereIn('status', ['pending', 'processing'])
            ->first();

        if ($existing) {
            return $existing;
        }

        $verification = IdentityVerification::create([
            'verifiable_id' => $profile->id,
            'verifiable_type' => VolunteerProfile::class,
            'status' => 'pending',
            'started_at' => now(),
        ]);

        $this->logStep($verification, 'verification_started', 'success', 'Identity verification initiated');

        return $verification;
    }

    public function uploadDocument(
        IdentityVerification $verification,
        UploadedFile $file,
        string $documentType
    ): IdentityDocument {
        $validation = $this->documentValidator->validate($file);

        if (!$validation['valid']) {
            $this->logStep($verification, 'document_upload', 'failed', implode('; ', $validation['errors']), $validation);
            abort(422, 'Document validation failed: ' . implode('; ', $validation['errors']));
        }

        $path = $file->store(
            config('identity-verification.storage.documents_path', 'identity-verification/documents'),
            config('identity-verification.storage.documents_disk', 'public')
        );

        $document = IdentityDocument::create([
            'identity_verification_id' => $verification->id,
            'document_type' => $documentType,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'ocr_status' => 'pending',
            'validation_status' => 'pending',
        ]);

        $this->logStep($verification, 'document_upload', 'success', "Document uploaded: {$documentType}", [
            'document_id' => $document->id,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return $document;
    }

    public function uploadSelfie(
        IdentityVerification $verification,
        UploadedFile $file
    ): IdentitySelfie {
        $validation = $this->documentValidator->validate($file);

        if (!$validation['valid']) {
            abort(422, 'Selfie validation failed: ' . implode('; ', $validation['errors']));
        }

        $path = $file->store(
            config('identity-verification.storage.selfies_path', 'identity-verification/selfies'),
            config('identity-verification.storage.documents_disk', 'public')
        );

        $existingSelfie = IdentitySelfie::where('identity_verification_id', $verification->id)->first();
        if ($existingSelfie) {
            Storage::disk('public')->delete($existingSelfie->file_path);
            $existingSelfie->delete();
        }

        $selfie = IdentitySelfie::create([
            'identity_verification_id' => $verification->id,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'face_detection_status' => null,
            'liveness_status' => 'pending',
        ]);

        $this->logStep($verification, 'selfie_upload', 'success', 'Selfie uploaded', [
            'selfie_id' => $selfie->id,
        ]);

        return $selfie;
    }

    public function process(IdentityVerification $verification): IdentityVerification
    {
        $verification->update(['status' => 'processing']);
        $this->logStep($verification, 'processing_started', 'success', 'Verification processing started');

        try {
            $documents = $verification->documents;
            $selfie = $verification->selfie;

            if ($documents->isEmpty()) {
                throw new \RuntimeException('No documents uploaded for verification');
            }

            $document = $documents->first();
            $profile = $verification->verifiable;

            $ocrResult = $this->processOcr($verification, $document);
            $faceMatchResult = $this->processFaceMatching($verification, $document, $selfie);
            $livenessResult = $this->processLiveness($verification, $selfie);
            $qualityResult = $this->processDocumentQuality($verification, $document);
            $consistencyResult = $this->processDataConsistency($verification, $ocrResult, $profile);

            $scored = $this->confidenceScorer->calculate([
                'ocr_accuracy' => $ocrResult['ocr_confidence'] ?? 0,
                'face_match' => $faceMatchResult['match_score'] ?? 0,
                'liveness' => $livenessResult['liveness_score'] ?? 0,
                'document_quality' => $qualityResult['quality_score'] ?? 0,
                'data_consistency' => $consistencyResult['consistency_score'] ?? 0,
            ]);

            $decision = $this->confidenceScorer->decide($scored['confidence_score']);

            $verification->update([
                'status' => $decision['decision'] === 'auto_verified' ? 'verified' : 'pending_review',
                'confidence_score' => $scored['confidence_score'],
                'ocr_score' => $scored['components']['ocr_accuracy'],
                'face_match_score' => $scored['components']['face_match'],
                'liveness_score' => $scored['components']['liveness'],
                'document_quality_score' => $scored['components']['document_quality'],
                'data_consistency_score' => $scored['components']['data_consistency'],
                'decision' => $decision['decision'],
                'decision_reason' => $decision['reason'],
                'completed_at' => $decision['decision'] === 'auto_verified' ? now() : null,
            ]);

            $this->logStep($verification, 'verification_completed', 'success', $decision['reason'], [
                'confidence_score' => $scored['confidence_score'],
                'decision' => $decision['decision'],
            ]);

            if ($decision['decision'] === 'auto_verified') {
                $this->applyAutoVerified($verification);
            }
        } catch (\Throwable $e) {
            $verification->update(['status' => 'failed']);
            $this->logStep($verification, 'verification_failed', 'error', $e->getMessage());
            Log::error('Identity verification processing failed', [
                'verification_id' => $verification->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return $verification->fresh();
    }

    public function approve(IdentityVerification $verification, int $reviewedBy, ?string $remarks = null): IdentityVerification
    {
        $verification->update([
            'status' => 'verified',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
            'admin_remarks' => $remarks,
            'completed_at' => now(),
            'decision' => 'admin_approved',
            'decision_reason' => $remarks ? "Admin approved: {$remarks}" : 'Admin approved',
        ]);

        $this->applyAutoVerified($verification);
        $this->logStep($verification, 'admin_approved', 'success', $remarks ?? 'Admin approved verification');

        return $verification->fresh();
    }

    public function reject(IdentityVerification $verification, int $reviewedBy, ?string $remarks = null): IdentityVerification
    {
        $verification->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
            'admin_remarks' => $remarks,
            'completed_at' => now(),
            'decision' => 'admin_rejected',
            'decision_reason' => $remarks ? "Admin rejected: {$remarks}" : 'Admin rejected',
        ]);

        $this->logStep($verification, 'admin_rejected', 'success', $remarks ?? 'Admin rejected verification');

        return $verification->fresh();
    }

    private function processOcr(IdentityVerification $verification, IdentityDocument $document): array
    {
        $this->logStep($verification, 'ocr_processing', 'processing', 'Starting OCR processing');

        $result = $this->ocrService->process($document->file_path, $document->document_type);

        $document->update([
            'ocr_extracted_data' => $result['extracted_data'],
            'ocr_confidence' => $result['ocr_confidence'],
            'ocr_status' => 'completed',
        ]);

        $this->logStep($verification, 'ocr_processing', 'success', "OCR completed with confidence {$result['ocr_confidence']}%", [
            'confidence' => $result['ocr_confidence'],
            'extracted_fields' => array_keys(array_filter($result['extracted_data'] ?? [])),
        ]);

        return $result;
    }

    private function processFaceMatching(
        IdentityVerification $verification,
        IdentityDocument $document,
        ?IdentitySelfie $selfie
    ): array {
        if (!$selfie) {
            $this->logStep($verification, 'face_matching', 'skipped', 'No selfie provided for face matching');
            return ['match_score' => 0, 'matched' => false];
        }

        $this->logStep($verification, 'face_matching', 'processing', 'Starting face matching');

        $result = $this->faceMatchingService->compare($document->file_path, $selfie->file_path);

        $selfie->update([
            'face_detection_status' => $result['face_detection_status'],
            'faces_detected' => $result['detection']['faces_detected'] ?? null,
            'image_quality_score' => $result['detection']['image_quality'] ?? null,
            'is_blurry' => $result['detection']['is_blurry'] ?? null,
        ]);

        $this->logStep($verification, 'face_matching', 'success', "Face match score: {$result['match_score']}%", $result);

        return $result;
    }

    private function processLiveness(
        IdentityVerification $verification,
        ?IdentitySelfie $selfie
    ): array {
        if (!$selfie) {
            $this->logStep($verification, 'liveness_detection', 'skipped', 'No selfie provided for liveness check');
            return ['liveness_score' => 0, 'passed' => false];
        }

        $this->logStep($verification, 'liveness_detection', 'processing', 'Starting liveness detection');

        $result = $this->livenessDetectionService->analyze($selfie->file_path);

        $selfie->update([
            'liveness_result' => $result['raw_result'],
            'liveness_status' => $result['status'],
        ]);

        $this->logStep($verification, 'liveness_detection', 'success', "Liveness status: {$result['status']}", $result);

        return $result;
    }

    private function processDocumentQuality(
        IdentityVerification $verification,
        IdentityDocument $document
    ): array {
        $this->logStep($verification, 'document_quality', 'processing', 'Checking document quality');

        $qualityResult = $this->documentValidator->validateImageQuality($document->file_path);

        $document->update([
            'validation_results' => $qualityResult,
            'validation_status' => $qualityResult['score'] >= 40 ? 'passed' : 'failed',
        ]);

        $this->logStep($verification, 'document_quality', 'success', "Document quality score: {$qualityResult['score']}%", $qualityResult);

        return [
            'quality_score' => $qualityResult['score'],
            'is_blurry' => $qualityResult['is_blurry'],
            'details' => $qualityResult,
        ];
    }

    private function processDataConsistency(
        IdentityVerification $verification,
        array $ocrResult,
        $profile
    ): array {
        $this->logStep($verification, 'data_consistency', 'processing', 'Checking data consistency');

        $result = $this->dataConsistencyService->check($ocrResult['extracted_data'] ?? [], $profile);

        $this->logStep($verification, 'data_consistency', 'success', "Data consistency score: {$result['consistency_score']}%", $result);

        return $result;
    }

    private function applyAutoVerified(IdentityVerification $verification): void
    {
        $profile = $verification->verifiable;

        if ($profile && $profile instanceof VolunteerProfile) {
            $profile->updateQuietly([
                'trust_score' => min(1.0, ($profile->trust_score ?? 0.5) + 0.05),
                'trust_updated_at' => now(),
            ]);
        }
    }

    private function logStep(
        IdentityVerification $verification,
        string $step,
        string $status,
        ?string $message = null,
        ?array $payload = null
    ): void {
        IdentityVerificationLog::create([
            'identity_verification_id' => $verification->id,
            'step' => $step,
            'status' => $status,
            'message' => $message,
            'payload' => $payload,
        ]);
    }
}
