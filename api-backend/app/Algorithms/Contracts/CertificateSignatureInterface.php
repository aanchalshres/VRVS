<?php

namespace App\Algorithms\Contracts;

interface CertificateSignatureInterface
{
    public function sign(array $data): string;
    public function verify(string $signature, array $data): bool;
}
