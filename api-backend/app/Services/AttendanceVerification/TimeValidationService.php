<?php

namespace App\Services\AttendanceVerification;

use App\Services\AttendanceVerification\Contracts\TimeValidationServiceInterface;
use Carbon\Carbon;

class TimeValidationService implements TimeValidationServiceInterface
{
    public function __construct(
        private array $config = []
    ) {
        $this->config = config('attendance-verification.time', []);
    }

    public function validateCheckIn(\DateTimeInterface $now, ?\DateTimeInterface $taskStart, ?\DateTimeInterface $taskEnd): array
    {
        $windowMinutes = $this->config['check_in_window_minutes'] ?? 15;
        $nowCarbon = Carbon::instance($now);
        $errors = [];
        $score = 100;

        if ($taskStart) {
            $startCarbon = Carbon::instance($taskStart);
            $windowStart = $startCarbon->copy()->subMinutes($windowMinutes);
            $windowEnd = $startCarbon->copy()->addMinutes($windowMinutes);

            if ($nowCarbon->lt($windowStart)) {
                $errors[] = "Check-in too early. Window opens at {$windowStart->format('H:i')}";
                $score -= 100;
            } elseif ($nowCarbon->gt($windowEnd)) {
                $errors[] = "Check-in window closed at {$windowEnd->format('H:i')}";
                $score -= 100;
            } else {
                $totalWindow = $windowStart->diffInMinutes($windowEnd) ?: 1;
                $elapsed = $windowStart->diffInMinutes($nowCarbon);
                $score = max(0, 100 - ($elapsed / $totalWindow) * 40);
            }
        }

        if ($taskEnd && $nowCarbon->gt(Carbon::instance($taskEnd))) {
            $errors[] = 'Task has already ended';
            $score -= 50;
        }

        return [
            'valid' => count($errors) === 0,
            'score' => max(0, min(100, $score)),
            'errors' => $errors,
        ];
    }

    public function validateCheckOut(\DateTimeInterface $checkInTime, \DateTimeInterface $now): array
    {
        $windowMinutes = $this->config['check_out_window_minutes'] ?? 15;
        $allowOpen = $this->config['allow_check_out_without_window'] ?? false;
        $checkInCarbon = Carbon::instance($checkInTime);
        $nowCarbon = Carbon::instance($now);
        $errors = [];
        $score = 100;

        if ($nowCarbon->lt($checkInCarbon)) {
            $errors[] = 'Check-out time cannot be before check-in time';
            $score -= 100;
        }

        $elapsedMinutes = $checkInCarbon->diffInMinutes($nowCarbon);

        if (!$allowOpen && $elapsedMinutes < 1) {
            $errors[] = 'Must be checked in for at least 1 minute before checking out';
            $score -= 50;
        }

        $expectedWindowEnd = $checkInCarbon->copy()->addMinutes($windowMinutes);
        if ($nowCarbon->gt($expectedWindowEnd)) {
            $score -= max(0, 100 - ($elapsedMinutes / 120) * 100);
        }

        return [
            'valid' => count($errors) === 0,
            'score' => max(0, min(100, $score)),
            'minutes_elapsed' => $elapsedMinutes,
            'errors' => $errors,
        ];
    }
}
