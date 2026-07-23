<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\CertificateAuthentication;
use App\Services\Certificate\CertificateAuthenticationService;
use App\Services\Certificate\CertificateVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificateAuthController extends Controller
{
    public function __construct(
        private CertificateAuthenticationService $authService,
        private CertificateVerificationService $verificationService,
    ) {}

    public function publicVerify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required_without:certificate_number|string',
            'certificate_number' => 'required_without:token|string',
        ]);

        $rateLimitKey = 'cert_verify_' . $request->ip();
        $cacheKey = "cert_verify_result_{$request->input('token', $request->input('certificate_number'))}";

        if (cache()->has($cacheKey)) {
            return response()->json(cache()->get($cacheKey));
        }

        if (isset($validated['token'])) {
            $result = $this->verificationService->verifyByToken($validated['token']);
        } else {
            $result = $this->verificationService->verifyByCertificateNumber($validated['certificate_number']);
        }

        cache()->put($cacheKey, $result, now()->addMinutes(5));

        return response()->json($result);
    }

    public function verifyById(Request $request, int $id): JsonResponse
    {
        $cert = Certificate::findOrFail($id);
        $result = $this->verificationService->verifyById($cert->id);
        return response()->json($result);
    }

    public function revoke(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $cert = Certificate::findOrFail($id);
        $auth = $this->authService->revoke($cert->id, $validated['reason'], $request->user()->id);

        return response()->json([
            'message' => 'Certificate revoked',
            'data' => [
                'is_revoked' => $auth->is_revoked,
                'revocation_reason' => $auth->revocation_reason,
                'revoked_at' => $auth->revoked_at,
            ],
        ]);
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        $cert = Certificate::findOrFail($id);
        $auth = $this->authService->restore($cert->id, $request->user()->id);

        return response()->json([
            'message' => 'Certificate restored',
            'data' => [
                'is_revoked' => $auth->is_revoked,
                'status' => $auth->status,
            ],
        ]);
    }

    public function status(int $id): JsonResponse
    {
        $cert = Certificate::findOrFail($id);
        $result = $this->authService->getVerificationStatus($cert->id);
        return response()->json($result);
    }

    public function history(Request $request, int $id): JsonResponse
    {
        $cert = Certificate::findOrFail($id);
        $auth = CertificateAuthentication::where('certificate_id', $cert->id)->first();

        if (!$auth) {
            return response()->json(['data' => []]);
        }

        return response()->json([
            'data' => [
                'verification_count' => $auth->verification_count,
                'last_verified_at' => $auth->last_verified_at,
                'is_revoked' => $auth->is_revoked,
                'status' => $auth->status,
                'created_at' => $auth->created_at,
            ],
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $data = $this->authService->getAnalytics();
        return response()->json(['data' => $data]);
    }

    public function setupAuthentication(Request $request, int $id): JsonResponse
    {
        $cert = Certificate::findOrFail($id);
        $auth = $this->authService->setupForCertificate($cert);

        return response()->json([
            'message' => 'Certificate authentication setup complete',
            'data' => [
                'verification_url' => $auth->verification_url,
                'verification_token' => $auth->verification_token,
                'status' => $auth->status,
                'qr_code_path' => $auth->qr_code_path ? url("storage/{$auth->qr_code_path}") : null,
            ],
        ]);
    }

    public function qrCode(Request $request, int $id): JsonResponse
    {
        $cert = Certificate::findOrFail($id);
        $auth = CertificateAuthentication::where('certificate_id', $cert->id)->first();

        if (!$auth) {
            return response()->json(['message' => 'Authentication not yet set up'], 404);
        }

        $qrUrl = $auth->qr_code_path ? url("storage/{$auth->qr_code_path}") : null;

        return response()->json([
            'data' => [
                'qr_code_url' => $qrUrl,
                'verification_url' => $auth->verification_url,
                'certificate_number' => $cert->certificate_number,
            ],
        ]);
    }
}
