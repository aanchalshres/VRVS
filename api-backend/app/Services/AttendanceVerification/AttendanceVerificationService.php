<?php

namespace App\Services\AttendanceVerification;

use App\Models\ServiceLog;
use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\AttendanceVerification\Contracts\AttendanceVerificationServiceInterface;
use App\Services\AttendanceVerification\Contracts\QrCodeServiceInterface;
use App\Services\AttendanceVerification\Contracts\GpsValidationServiceInterface;
use App\Services\AttendanceVerification\Contracts\TimeValidationServiceInterface;
use App\Services\AttendanceVerification\Contracts\AttendanceConfidenceServiceInterface;
use App\Jobs\AttendanceAuditLogJob;
use App\Jobs\UpdateAttendanceAnalyticsJob;
use App\Jobs\UpdateAttendanceTrustScoreJob;
use Illuminate\Support\Facades\DB;

class AttendanceVerificationService implements AttendanceVerificationServiceInterface
{
    public function __construct(
        private QrCodeServiceInterface $qrCodeService,
        private GpsValidationServiceInterface $gpsService,
        private TimeValidationServiceInterface $timeService,
        private AttendanceConfidenceServiceInterface $confidenceService,
    ) {}

    public function validateQr(string $token): array
    {
        return $this->qrCodeService->validate($token);
    }

    public function checkIn(
        VolunteerProfile $volunteer,
        Task $task,
        string $qrToken,
        array $gpsData,
        ?array $deviceInfo = null
    ): ServiceLog {
        $qrResult = $this->qrCodeService->validate($qrToken);
        if (!$qrResult['valid']) {
            abort(422, $qrResult['reason']);
        }

        if ($task->status !== 'Open') {
            abort(422, 'Task is not active');
        }

        $application = $volunteer->applications()
            ->where('task_id', $task->id)
            ->where('status', 'Accepted')
            ->first();

        if (!$application) {
            abort(403, 'You are not assigned to this task');
        }

        $existingActive = ServiceLog::where('volunteer_profile_id', $volunteer->id)
            ->where('task_id', $task->id)
            ->where('participation_status', 'active')
            ->first();

        if ($existingActive) {
            abort(422, 'You are already checked in to this task');
        }

        $existingCompleted = ServiceLog::where('volunteer_profile_id', $volunteer->id)
            ->where('task_id', $task->id)
            ->where('participation_status', 'completed')
            ->first();

        if ($existingCompleted) {
            abort(422, 'Attendance already recorded for this task');
        }

        $gpsValidation = $this->gpsService->validate(
            $gpsData['latitude'] ?? 0,
            $gpsData['longitude'] ?? 0,
            $gpsData['accuracy'] ?? 999,
            $task
        );

        $timeValidation = $this->timeService->validateCheckIn(
            now(),
            $task->start_date,
            $task->end_date
        );

        $confidence = $this->confidenceService->calculate([
            'qr_validity' => $qrResult['valid'] ? 100 : 0,
            'gps_accuracy' => $gpsValidation['score'] ?? 0,
            'time_validity' => $timeValidation['score'] ?? 0,
            'device_consistency' => $deviceInfo ? 80 : 50,
        ]);

        $log = DB::transaction(function () use ($volunteer, $task, $qrToken, $gpsData, $gpsValidation, $timeValidation, $confidence, $deviceInfo) {
            $qrCode = \App\Models\QrCode::where('token', $qrToken)->first();
            if ($qrCode) {
                $qrCode->update(['is_active' => false]);
            }

            return ServiceLog::create([
                'volunteer_profile_id' => $volunteer->id,
                'task_id' => $task->id,
                'check_in_time' => now(),
                'participation_status' => 'active',
                'qr_token' => $qrToken,
                'qr_expires_at' => $qrCode?->expires_at,
                'verification_method' => 'qr_code',
                'check_in_latitude' => $gpsData['latitude'] ?? null,
                'check_in_longitude' => $gpsData['longitude'] ?? null,
                'check_in_gps_accuracy' => $gpsData['accuracy'] ?? null,
                'check_in_distance_from_task' => $gpsValidation['distance'] ?? null,
                'attendance_confidence_score' => $confidence['score'],
                'confidence_level' => $confidence['level'],
                'device_info' => $deviceInfo,
            ]);
        });

        $this->dispatchBackgroundJobs($log, 'check_in');

        return $log;
    }

    public function checkOut(
        ServiceLog $log,
        string $qrToken,
        array $gpsData,
        ?array $deviceInfo = null
    ): ServiceLog {
        $task = $log->task;

        $qrResult = $this->qrCodeService->validate($qrToken);
        if (!$qrResult['valid']) {
            abort(422, $qrResult['reason']);
        }

        if ($log->participation_status !== 'active') {
            abort(422, 'You are not currently checked in');
        }

        if ($log->check_out_time) {
            abort(422, 'Check-out already recorded');
        }

        $gpsValidation = $this->gpsService->validate(
            $gpsData['latitude'] ?? 0,
            $gpsData['longitude'] ?? 0,
            $gpsData['accuracy'] ?? 999,
            $task
        );

        $timeValidation = $this->timeService->validateCheckOut(
            $log->check_in_time,
            now()
        );

        $confidenceIn = $log->attendance_confidence_score ?? 50;
        $confidenceOut = $this->confidenceService->calculate([
            'qr_validity' => $qrResult['valid'] ? 100 : 0,
            'gps_accuracy' => $gpsValidation['score'] ?? 0,
            'time_validity' => $timeValidation['score'] ?? 0,
            'device_consistency' => $deviceInfo ? 80 : 50,
        ]);

        $overallConfidence = round(($confidenceIn + $confidenceOut['score']) / 2, 1);

        $log = DB::transaction(function () use ($log, $gpsData, $gpsValidation, $timeValidation, $overallConfidence, $deviceInfo) {
            $qrCode = \App\Models\QrCode::where('token', $log->qr_token)->first();

            $checkIn = \Carbon\Carbon::parse($log->check_in_time);
            $checkOut = now();
            $hours = round($checkIn->diffInMinutes($checkOut) / 60, 2);

            $log->update([
                'check_out_time' => $checkOut,
                'hours' => $hours,
                'participation_status' => 'completed',
                'check_out_latitude' => $gpsData['latitude'] ?? null,
                'check_out_longitude' => $gpsData['longitude'] ?? null,
                'check_out_gps_accuracy' => $gpsData['accuracy'] ?? null,
                'check_out_distance_from_task' => $gpsValidation['distance'] ?? null,
                'attendance_confidence_score' => $overallConfidence,
                'confidence_level' => $overallConfidence >= 85 ? 'high' : ($overallConfidence >= 65 ? 'medium' : ($overallConfidence >= 40 ? 'low' : 'manual_review')),
                'device_info' => $deviceInfo ? array_merge($log->device_info ?? [], $deviceInfo) : $log->device_info,
            ]);

            return $log->fresh();
        });

        $this->dispatchBackgroundJobs($log, 'check_out');

        return $log;
    }

    public function getStatus(ServiceLog $log): array
    {
        return [
            'id' => $log->id,
            'status' => $log->participation_status,
            'checked_in' => !is_null($log->check_in_time),
            'checked_out' => !is_null($log->check_out_time),
            'check_in_time' => $log->check_in_time,
            'check_out_time' => $log->check_out_time,
            'hours' => $log->hours,
            'confidence_score' => $log->attendance_confidence_score,
            'confidence_level' => $log->confidence_level,
            'verification_method' => $log->verification_method,
            'check_in_distance' => $log->check_in_distance_from_task,
            'check_out_distance' => $log->check_out_distance_from_task,
            'task' => $log->task ? [
                'id' => $log->task->id,
                'title' => $log->task->title,
            ] : null,
        ];
    }

    private function dispatchBackgroundJobs(ServiceLog $log, string $action): void
    {
        $config = config('attendance-verification.jobs', []);

        if ($config['audit_log'] ?? true) {
            AttendanceAuditLogJob::dispatch($log->id, $action);
        }

        if ($config['analytics_update'] ?? true) {
            UpdateAttendanceAnalyticsJob::dispatch($log->id, $action);
        }

        if ($config['trust_score_update'] ?? true) {
            UpdateAttendanceTrustScoreJob::dispatch($log->volunteer_profile_id, $action);
        }
    }
}
