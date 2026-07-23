<?php

namespace App\Services\AttendanceVerification;

use App\Models\QrCode;
use App\Models\Task;
use App\Services\AttendanceVerification\Contracts\QrCodeServiceInterface;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class QrCodeService implements QrCodeServiceInterface
{
    public function __construct(
        private array $config = []
    ) {
        $this->config = config('attendance-verification.qr', []);
    }

    public function generate(Task $task, int $createdBy): QrCode
    {
        $token = Str::random($this->config['length'] ?? 64);
        $expiresAt = now()->addMinutes($this->config['expiry_minutes'] ?? 15);
        $signature = $this->sign($token, $task->id, $expiresAt->timestamp);

        return QrCode::create([
            'task_id' => $task->id,
            'created_by' => $createdBy,
            'token' => $token,
            'signature' => $signature,
            'expires_at' => $expiresAt,
            'is_active' => true,
        ]);
    }

    public function validate(string $token): array
    {
        $qr = QrCode::where('token', $token)->first();

        if (!$qr) {
            return ['valid' => false, 'reason' => 'QR code not found'];
        }

        if (!$qr->is_active) {
            return ['valid' => false, 'reason' => 'QR code has been revoked'];
        }

        if ($this->isExpired($qr)) {
            $qr->update(['is_active' => false]);
            return ['valid' => false, 'reason' => 'QR code has expired'];
        }

        $expectedSignature = $this->sign($qr->token, $qr->task_id, $qr->expires_at->timestamp);
        if (!hash_equals($expectedSignature, $qr->signature)) {
            return ['valid' => false, 'reason' => 'QR code signature mismatch'];
        }

        $task = $qr->task;
        if (!$task || $task->status !== 'Open') {
            return ['valid' => false, 'reason' => 'Task is not active'];
        }

        return [
            'valid' => true,
            'task' => $task,
            'qr_code' => $qr,
        ];
    }

    public function revoke(QrCode $qrCode): bool
    {
        return $qrCode->update(['is_active' => false]);
    }

    public function revokeByTask(Task $task): void
    {
        QrCode::where('task_id', $task->id)->update(['is_active' => false]);
    }

    public function isExpired(QrCode $qrCode): bool
    {
        return $qrCode->expires_at->isPast();
    }

    private function sign(string $token, int $taskId, int $timestamp): string
    {
        $key = $this->config['signing_key'] ?? config('app.key');
        return hash_hmac('sha256', "{$token}:{$taskId}:{$timestamp}", $key);
    }
}
