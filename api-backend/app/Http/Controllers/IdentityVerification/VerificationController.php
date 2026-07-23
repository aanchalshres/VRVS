<?php

namespace App\Http\Controllers\IdentityVerification;

use App\Http\Controllers\Controller;
use App\Jobs\IdentityVerification\ProcessIdentityVerificationJob;
use App\Models\IdentityVerification\IdentityVerification;
use App\Services\IdentityVerification\VerificationPipelineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function __construct(
        private VerificationPipelineService $pipeline,
    ) {}

    public function start(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can start identity verification'], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $verification = $this->pipeline->startVerification($profile);

        return response()->json([
            'message' => 'Verification session started',
            'data' => $this->formatVerification($verification),
        ]);
    }

    public function uploadDocument(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'verification_id' => 'required|exists:identity_verifications,id',
            'document_type' => 'required|string|in:citizenship,national_id,student_id,volunteer_card,passport',
            'document' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
        ]);

        $verification = IdentityVerification::findOrFail($validated['verification_id']);

        $this->authorizeAccess($verification, $user);

        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'Verification session is not in pending state'], 422);
        }

        $document = $this->pipeline->uploadDocument(
            $verification,
            $request->file('document'),
            $validated['document_type']
        );

        return response()->json([
            'message' => 'Document uploaded',
            'data' => $document->toArray(),
        ]);
    }

    public function uploadSelfie(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'verification_id' => 'required|exists:identity_verifications,id',
            'selfie' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $verification = IdentityVerification::findOrFail($validated['verification_id']);

        $this->authorizeAccess($verification, $user);

        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'Verification session is not in pending state'], 422);
        }

        $selfie = $this->pipeline->uploadSelfie($verification, $request->file('selfie'));

        return response()->json([
            'message' => 'Selfie uploaded',
            'data' => $selfie->toArray(),
        ]);
    }

    public function submit(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'verification_id' => 'required|exists:identity_verifications,id',
        ]);

        $verification = IdentityVerification::findOrFail($validated['verification_id']);

        $this->authorizeAccess($verification, $user);

        if ($verification->status !== 'pending') {
            return response()->json(['message' => 'Verification already submitted or processed'], 422);
        }

        if ($verification->documents()->count() === 0) {
            return response()->json(['message' => 'At least one document must be uploaded before submitting'], 422);
        }

        ProcessIdentityVerificationJob::dispatch($verification->id);

        return response()->json([
            'message' => 'Verification submitted for processing',
            'data' => [
                'id' => $verification->id,
                'status' => 'processing',
            ],
        ]);
    }

    public function status(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $verification = IdentityVerification::with(['documents', 'selfie', 'logs'])
            ->findOrFail($id);

        $this->authorizeAccess($verification, $user);

        return response()->json([
            'data' => $this->formatVerification($verification),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        $verifications = IdentityVerification::where('verifiable_id', $user->volunteerProfile?->id)
            ->where('verifiable_type', get_class($user->volunteerProfile))
            ->with(['documents', 'selfie'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $verifications->map(fn($v) => $this->formatVerification($v)),
        ]);
    }

    private function authorizeAccess(IdentityVerification $verification, $user): void
    {
        $profile = $user->volunteerProfile;

        $isOwner = $profile && $verification->verifiable_id === $profile->id
            && $verification->verifiable_type === get_class($profile);

        $isAdmin = $user->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            abort(403, 'Unauthorized access to this verification');
        }
    }

    private function formatVerification(IdentityVerification $v): array
    {
        return [
            'id' => $v->id,
            'status' => $v->status,
            'confidence_score' => $v->confidence_score,
            'ocr_score' => $v->ocr_score,
            'face_match_score' => $v->face_match_score,
            'liveness_score' => $v->liveness_score,
            'document_quality_score' => $v->document_quality_score,
            'data_consistency_score' => $v->data_consistency_score,
            'decision' => $v->decision,
            'decision_reason' => $v->decision_reason,
            'started_at' => $v->started_at,
            'completed_at' => $v->completed_at,
            'documents' => $v->documents->map(fn($d) => [
                'id' => $d->id,
                'document_type' => $d->document_type,
                'original_name' => $d->original_name,
                'mime_type' => $d->mime_type,
                'file_url' => $d->file_path ? url("storage/{$d->file_path}") : null,
                'ocr_status' => $d->ocr_status,
                'ocr_confidence' => $d->ocr_confidence,
                'ocr_extracted_data' => $d->ocr_extracted_data,
                'validation_status' => $d->validation_status,
            ]),
            'selfie' => $v->selfie ? [
                'id' => $v->selfie->id,
                'file_url' => url("storage/{$v->selfie->file_path}"),
                'face_detection_status' => $v->selfie->face_detection_status,
                'liveness_status' => $v->selfie->liveness_status,
                'image_quality_score' => $v->selfie->image_quality_score,
            ] : null,
        ];
    }
}
