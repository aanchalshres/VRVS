<?php

namespace App\Services\AttendanceVerification\Contracts;

use App\Models\Task;

interface GpsValidationServiceInterface
{
    public function validate(float $latitude, float $longitude, float $accuracy, Task $task): array;
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float;
}
