<?php

namespace App\Services\Certificate;

use App\Models\Certificate;
use App\Models\CertificateAuthentication;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CertificateAuthenticationService
{
    public function __construct(
        private CertificateHashService $hashService,
        private QRCodeGenerationService $qrService,
        private CertificateVerificationService $verificationService,
        private CertificateSignatureService $signatureService,
        private ActivityLogService $activityLog,
    ) {}

    public function setupForCertificate(Certificate $cert): CertificateAuthentication
    {
        $existing = CertificateAuthentication::where('certificate_id', $cert->id)->first();
        if ($existing) return $existing;

        $content = $cert->content ?? [];
        $metadata = [
            'certificate_number' => $cert->certificate_number,
            'volunteer_profile_id' => $cert->volunteer_profile_id,
            'task_id' => $cert->task_id,
            'ngo_id' => $cert->ngo_id,
            'volunteer_name' => $content['volunteer_name'] ?? '',
            'task_title' => $content['task_title'] ?? '',
            'hours_contributed' => $content['hours_contributed'] ?? '0',
            'issue_date' => $cert->issued_at ? $cert->issued_at->format('Y-m-d') : '',
        ];

        $hash = $this->hashService->compute($metadata);
        $token = $this->generateVerificationToken();
        $url = url("/verify-certificate?token={$token}");

        return DB::transaction(function () use ($cert, $hash, $token, $url) {
            $auth = CertificateAuthentication::create([
                'certificate_id' => $cert->id,
                'certificate_hash' => $hash,
                'verification_token' => $token,
                'verification_url' => $url,
                'status' => 'active',
                'is_revoked' => false,
            ]);

            $qrDir = storage_path('app/public/qr-codes');
            if (!is_dir($qrDir)) {
                mkdir($qrDir, 0755, true);
            }
            $qrPath = "{$qrDir}/cert-{$cert->id}.png";
            $this->qrService->generate($url, $qrPath);
            $relativePath = "qr-codes/cert-{$cert->id}.png";
            $auth->update(['qr_code_path' => $relativePath]);

            return $auth;
        });
    }

    public function revoke(int $certId, string $reason, ?int $userId = null): CertificateAuthentication
    {
        $auth = CertificateAuthentication::where('certificate_id', $certId)->firstOrFail();
        $auth->update([
            'is_revoked' => true,
            'status' => 'revoked',
            'revocation_reason' => $reason,
            'revoked_at' => now(),
        ]);

        if ($userId) {
            $this->activityLog->log($userId, 'certificate_revoked', 'certificate',
                "Certificate #{$auth->certificate->certificate_number} revoked: {$reason}");
        }

        return $auth->fresh();
    }

    public function restore(int $certId, ?int $userId = null): CertificateAuthentication
    {
        $auth = CertificateAuthentication::where('certificate_id', $certId)->firstOrFail();
        $auth->update([
            'is_revoked' => false,
            'status' => 'active',
            'revocation_reason' => null,
            'revoked_at' => null,
        ]);

        if ($userId) {
            $this->activityLog->log($userId, 'certificate_restored', 'certificate',
                "Certificate #{$auth->certificate->certificate_number} restored");
        }

        return $auth->fresh();
    }

    public function expire(int $certId): CertificateAuthentication
    {
        $auth = CertificateAuthentication::where('certificate_id', $certId)->firstOrFail();
        $auth->update([
            'status' => 'expired',
            'expires_at' => now(),
        ]);
        return $auth->fresh();
    }

    public function getVerificationStatus(int $certId): array
    {
        return $this->verificationService->verifyById($certId);
    }

    public function getAnalytics(): array
    {
        return [
            'total_authenticated' => CertificateAuthentication::count(),
            'active' => CertificateAuthentication::where('status', 'active')->where('is_revoked', false)->count(),
            'revoked' => CertificateAuthentication::where('is_revoked', true)->count(),
            'expired' => CertificateAuthentication::where('status', 'expired')->count(),
            'total_verifications' => CertificateAuthentication::sum('verification_count'),
            'avg_verifications' => round(CertificateAuthentication::avg('verification_count') ?? 0, 1),
        ];
    }

    private function generateVerificationToken(): string
    {
        return 'cert_vrfy_' . Str::random(48);
    }
}
