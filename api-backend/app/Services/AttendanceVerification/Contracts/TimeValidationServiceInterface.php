<?php

namespace App\Services\AttendanceVerification\Contracts;

interface TimeValidationServiceInterface
{
    public function validateCheckIn(\DateTimeInterface $now, ?\DateTimeInterface $taskStart, ?\DateTimeInterface $taskEnd): array;
    public function validateCheckOut(\DateTimeInterface $checkInTime, \DateTimeInterface $now): array;
}
