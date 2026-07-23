<?php

namespace App\Services\Certificate;

use App\Models\Certificate;
use App\Models\CertificateAuthentication;
use App\Services\ActivityLogService;

class CertificateVerificationService
{
    public function __construct(
        private CertificateHashService $hashService,
        private CertificateSignatureService $signatureService,
        private ActivityLogService $activityLog,
    ) {}

    public function verifyByToken(string $token): array
    {
        $auth = CertificateAuthentication::where('verification_token', $token)
            ->with('certificate.ngo', 'certificate.volunteer.user', 'certificate.task')
            ->first();

        if (!$auth) {
            return $this->result('not_found', 'Certificate not found');
        }

        return $this->performVerification($auth);
    }

    public function verifyByCertificateNumber(string $number): array
    {
        $cert = Certificate::where('certificate_number', $number)->first();
        if (!$cert) {
            return $this->result('not_found', 'Certificate not found');
        }

        $auth = CertificateAuthentication::where('certificate_id', $cert->id)->first();
        if (!$auth) {
            return $this->result('not_found', 'Certificate authentication record not found');
        }

        return $this->performVerification($auth);
    }

    public function verifyById(int $certId): array
    {
        $auth = CertificateAuthentication::where('certificate_id', $certId)->first();
        if (!$auth) {
            return $this->result('not_found', 'Certificate authentication record not found');
        }

        return $this->performVerification($auth);
    }

    private function performVerification(CertificateAuthentication $auth): array
    {
        if ($auth->is_revoked) {
            $this->incrementVerification($auth);
            return $this->result('revoked', 'Certificate has been revoked', $auth, [
                'reason' => $auth->revocation_reason,
                'revoked_at' => $auth->revoked_at,
            ]);
        }

        if ($auth->status === 'expired' || ($auth->expires_at && $auth->expires_at->isPast())) {
            if ($auth->status !== 'expired') {
                $auth->update(['status' => 'expired']);
            }
            $this->incrementVerification($auth);
            return $this->result('expired', 'Certificate has expired', $auth);
        }

        $cert = $auth->certificate;
        if (!$cert) {
            return $this->result('not_found', 'Linked certificate record not found');
        }

        $content = $cert->content ?? [];
        $metadata = $this->buildMetadata($cert, $content);

        $hashValid = $this->hashService->verify($auth->certificate_hash, $metadata);

        if (!$hashValid) {
            $this->incrementVerification($auth);
            return $this->result('tampered', 'Certificate data has been tampered with', $auth);
        }

        $sigValid = $this->signatureService->verify($auth->verification_token, [
            'certificate_number' => $cert->certificate_number,
            'id' => $cert->id,
        ]);

        if (!$sigValid) {
            $this->incrementVerification($auth);
            return $this->result('tampered', 'Certificate signature is invalid', $auth);
        }

        $this->incrementVerification($auth);

        return $this->result('authentic', 'Certificate is authentic', $auth);
    }

    private function incrementVerification(CertificateAuthentication $auth): void
    {
        $auth->increment('verification_count');
        $auth->update(['last_verified_at' => now()]);
    }

    private function buildMetadata(Certificate $cert, array $content): array
    {
        return [
            'certificate_number' => $cert->certificate_number,
            'volunteer_profile_id' => $cert->volunteer_profile_id,
            'task_id' => $cert->task_id,
            'ngo_id' => $cert->ngo_id,
            'volunteer_name' => $content['volunteer_name'] ?? '',
            'task_title' => $content['task_title'] ?? '',
            'hours_contributed' => $content['hours_contributed'] ?? '0',
            'issue_date' => $cert->issued_at ? $cert->issued_at->format('Y-m-d') : '',
        ];
    }

    private function result(string $status, string $message, ?CertificateAuthentication $auth = null, array $extra = []): array
    {
        $data = array_merge([
            'verified' => $status === 'authentic',
            'status' => $status,
            'message' => $message,
        ], $extra);

        if ($auth && $auth->certificate) {
            $cert = $auth->certificate;
            $content = $cert->content ?? [];
            $data['certificate'] = [
                'id' => $cert->id,
                'number' => $cert->certificate_number,
                'volunteer_name' => $content['volunteer_name'] ?? $cert->volunteer?->user?->name ?? '',
                'task_title' => $content['task_title'] ?? $cert->task?->title ?? '',
                'organization_name' => $content['organization_name'] ?? $cert->ngo?->organization_name ?? '',
                'hours_contributed' => $content['hours_contributed'] ?? 0,
                'issued_at' => $cert->issued_at?->format('Y-m-d'),
                'verification_count' => $auth->verification_count,
                'last_verified_at' => $auth->last_verified_at,
            ];
        }

        return $data;
    }
}
