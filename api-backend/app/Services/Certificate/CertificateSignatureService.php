<?php

namespace App\Services\Certificate;

use App\Algorithms\Contracts\CertificateSignatureInterface;

class CertificateSignatureService implements CertificateSignatureInterface
{
    public function sign(array $data): string
    {
        $payload = json_encode($data) . '.' . ($data['certificate_number'] ?? '');
        return hash_hmac('sha256', $payload, config('app.key'));
    }

    public function verify(string $signature, array $data): bool
    {
        return hash_equals($this->sign($data), $signature);
    }
}
