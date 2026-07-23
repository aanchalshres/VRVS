<?php

namespace App\Algorithms\Contracts;

interface CertificateHashInterface
{
    public function compute(array $metadata): string;
    public function verify(string $hash, array $metadata): bool;
}
