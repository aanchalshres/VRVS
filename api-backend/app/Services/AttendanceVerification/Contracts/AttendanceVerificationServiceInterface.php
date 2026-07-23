<?php

namespace App\Services\AttendanceVerification\Contracts;

use App\Models\ServiceLog;
use App\Models\Task;
use App\Models\VolunteerProfile;

interface AttendanceVerificationServiceInterface
{
    public function checkIn(VolunteerProfile $volunteer, Task $task, string $qrToken, array $gpsData, ?array $deviceInfo = null): ServiceLog;
    public function checkOut(ServiceLog $log, string $qrToken, array $gpsData, ?array $deviceInfo = null): ServiceLog;
    public function validateQr(string $token): array;
    public function getStatus(ServiceLog $log): array;
}
