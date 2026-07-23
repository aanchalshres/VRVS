<?php

namespace App\Http\Controllers\IdentityVerification;

use App\Http\Controllers\Controller;
use App\Models\IdentityVerification\IdentityVerification;
use App\Services\IdentityVerification\VerificationPipelineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVerificationController extends Controller
{
    public function __construct(
        private VerificationPipelineService $pipeline,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = IdentityVerification::with(['verifiable', 'documents', 'selfie'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('decision')) {
            $query->where('decision', $request->decision);
        }

        $perPage = min((int) $request->input('per_page', 20), 50);
        $verifications = $query->paginate($perPage);

        $verifications->getCollection()->transform(function ($v) {
            return $this->formatForAdmin($v);
        });

        return response()->json([
            'data' => $verifications->items(),
            'meta' => [
                'current_page' => $verifications->currentPage(),
                'last_page' => $verifications->lastPage(),
                'per_page' => $verifications->perPage(),
                'total' => $verifications->total(),
            ],
        ]);
    }

    public function pending(): JsonResponse
    {
        $verifications = IdentityVerification::where('status', 'pending_review')
            ->orWhere('status', 'pending')
            ->with(['verifiable', 'documents', 'selfie', 'logs'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'data' => $verifications->map(fn($v) => $this->formatForAdmin($v)),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $verification = IdentityVerification::with([
            'verifiable',
            'verifiable.user',
            'documents',
            'selfie',
            'logs',
            'reviewer',
        ])->findOrFail($id);

        return response()->json([
            'data' => $this->formatForAdmin($verification),
        ]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string|max:1000',
        ]);

        $verification = IdentityVerification::findOrFail($id);

        $result = $this->pipeline->approve(
            $verification,
            $request->user()->id,
            $validated['remarks'] ?? null
        );

        return response()->json([
            'message' => 'Verification approved',
            'data' => $this->formatForAdmin($result),
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'remarks' => 'required|string|max:1000',
        ]);

        $verification = IdentityVerification::findOrFail($id);

        $result = $this->pipeline->reject(
            $verification,
            $request->user()->id,
            $validated['remarks']
        );

        return response()->json([
            'message' => 'Verification rejected',
            'data' => $this->formatForAdmin($result),
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total' => IdentityVerification::count(),
                'pending' => IdentityVerification::where('status', 'pending')->count(),
                'pending_review' => IdentityVerification::where('status', 'pending_review')->count(),
                'processing' => IdentityVerification::where('status', 'processing')->count(),
                'verified' => IdentityVerification::where('status', 'verified')->count(),
                'rejected' => IdentityVerification::where('status', 'rejected')->count(),
                'failed' => IdentityVerification::where('status', 'failed')->count(),
                'auto_verified' => IdentityVerification::where('decision', 'auto_verified')->count(),
                'admin_approved' => IdentityVerification::where('decision', 'admin_approved')->count(),
                'admin_rejected' => IdentityVerification::where('decision', 'admin_rejected')->count(),
                'avg_confidence' => IdentityVerification::whereNotNull('confidence_score')->avg('confidence_score'),
            ],
        ]);
    }

    private function formatForAdmin(IdentityVerification $v): array
    {
        $profile = $v->verifiable;

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
            'reviewed_at' => $v->reviewed_at,
            'admin_remarks' => $v->admin_remarks,
            'reviewer' => $v->reviewer ? [
                'id' => $v->reviewer->id,
                'name' => $v->reviewer->name,
                'email' => $v->reviewer->email,
            ] : null,
            'applicant' => $profile ? [
                'id' => $profile->id,
                'name' => $profile->user->name ?? 'Unknown',
                'email' => $profile->user->email ?? '',
                'phone' => $profile->user->phone ?? '',
                'city' => $profile->city ?? '',
                'country' => $profile->country ?? '',
                'trust_score' => $profile->trust_score ?? 0.5,
            ] : null,
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
                'validation_results' => $d->validation_results,
            ]),
            'selfie' => $v->selfie ? [
                'id' => $v->selfie->id,
                'file_url' => url("storage/{$v->selfie->file_path}"),
                'face_detection_status' => $v->selfie->face_detection_status,
                'faces_detected' => $v->selfie->faces_detected,
                'image_quality_score' => $v->selfie->image_quality_score,
                'is_blurry' => $v->selfie->is_blurry,
                'liveness_status' => $v->selfie->liveness_status,
                'liveness_result' => $v->selfie->liveness_result,
            ] : null,
            'logs' => $v->logs->map(fn($log) => [
                'step' => $log->step,
                'status' => $log->status,
                'message' => $log->message,
                'created_at' => $log->created_at,
            ]),
            'created_at' => $v->created_at,
            'updated_at' => $v->updated_at,
        ];
    }
}
