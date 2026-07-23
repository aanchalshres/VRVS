<?php

namespace App\Services\AttendanceVerification\Contracts;

use App\Models\QrCode;
use App\Models\Task;

interface QrCodeServiceInterface
{
    public function generate(Task $task, int $createdBy): QrCode;
    public function validate(string $token): array;
    public function revoke(QrCode $qrCode): bool;
    public function revokeByTask(Task $task): void;
    public function isExpired(QrCode $qrCode): bool;
}
