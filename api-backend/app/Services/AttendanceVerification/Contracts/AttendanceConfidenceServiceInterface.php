<?php

namespace App\Services\AttendanceVerification\Contracts;

interface AttendanceConfidenceServiceInterface
{
    public function calculate(array $components): array;
    public function classify(float $score): string;
}
