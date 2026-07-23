<?php

namespace App\Services\Certificate;

use App\Algorithms\Contracts\CertificateHashInterface;

class CertificateHashService implements CertificateHashInterface
{
    public function compute(array $metadata): string
    {
        $fields = [
            $metadata['certificate_number'] ?? '',
            $metadata['volunteer_profile_id'] ?? '',
            $metadata['task_id'] ?? '',
            $metadata['ngo_id'] ?? '',
            $metadata['volunteer_name'] ?? '',
            $metadata['task_title'] ?? '',
            $metadata['hours_contributed'] ?? '0',
            $metadata['issue_date'] ?? '',
        ];

        $data = implode('|', $fields);

        $hash = hash('sha256', $data);

        $prefix = strtoupper(substr(hash('sha256', $metadata['certificate_number'] ?? ''), 0, 8));
        return "CERTHASH_{$prefix}_{$hash}";
    }

    public function verify(string $hash, array $metadata): bool
    {
        $expected = $this->compute($metadata);
        return hash_equals($expected, $hash);
    }
}
