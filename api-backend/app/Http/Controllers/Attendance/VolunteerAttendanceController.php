<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\ServiceLog;
use App\Models\Task;
use App\Services\AttendanceVerification\Contracts\AttendanceVerificationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VolunteerAttendanceController extends Controller
{
    public function __construct(
        private AttendanceVerificationServiceInterface $verificationService
    ) {}

    public function validateQr(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $result = $this->verificationService->validateQr($validated['token']);

        if (!$result['valid']) {
            return response()->json([
                'message' => $result['reason'],
                'valid' => false,
            ], 422);
        }

        $task = $result['task'];

        return response()->json([
            'valid' => true,
            'message' => 'QR code is valid',
            'data' => [
                'task' => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'location' => $task->location,
                    'city' => $task->city,
                    'latitude' => $task->latitude,
                    'longitude' => $task->longitude,
                    'start_date' => $task->start_date,
                    'end_date' => $task->end_date,
                    'ngo' => $task->ngo?->organization_name,
                ],
            ],
        ]);
    }

    public function checkIn(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'qr_token' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'gps_accuracy' => 'required|numeric|min:0|max:9999',
            'device_info' => 'nullable|array',
            'device_info.user_agent' => 'nullable|string',
            'device_info.platform' => 'nullable|string',
        ]);

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can check in'], 403);
        }

        $profile = $user->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $qrResult = $this->verificationService->validateQr($validated['qr_token']);
        if (!$qrResult['valid']) {
            return response()->json(['message' => $qrResult['reason']], 422);
        }

        $task = $qrResult['task'];

        try {
            $log = $this->verificationService->checkIn(
                $profile,
                $task,
                $validated['qr_token'],
                [
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'accuracy' => $validated['gps_accuracy'],
                ],
                $validated['device_info'] ?? null
            );

            return response()->json([
                'message' => 'Check-in successful',
                'data' => $this->formatLog($log),
            ], 201);
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage() ?: 'Check-in failed'], 422);
        }
    }

    public function checkOut(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'qr_token' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'gps_accuracy' => 'required|numeric|min:0|max:9999',
            'device_info' => 'nullable|array',
            'device_info.user_agent' => 'nullable|string',
            'device_info.platform' => 'nullable|string',
        ]);

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can check out'], 403);
        }

        $profile = $user->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $activeLog = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'active')
            ->whereNotNull('check_in_time')
            ->whereNull('check_out_time')
            ->latest()
            ->first();

        if (!$activeLog) {
            return response()->json(['message' => 'No active check-in found'], 422);
        }

        try {
            $log = $this->verificationService->checkOut(
                $activeLog,
                $validated['qr_token'],
                [
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'accuracy' => $validated['gps_accuracy'],
                ],
                $validated['device_info'] ?? null
            );

            return response()->json([
                'message' => 'Check-out successful',
                'data' => $this->formatLog($log),
            ]);
        } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage() ?: 'Check-out failed'], 422);
        }
    }

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $activeLog = ServiceLog::with(['task'])
            ->where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'active')
            ->whereNotNull('check_in_time')
            ->whereNull('check_out_time')
            ->latest()
            ->first();

        if (!$activeLog) {
            return response()->json([
                'checked_in' => false,
                'message' => 'Not currently checked in',
            ]);
        }

        return response()->json([
            'checked_in' => true,
            'data' => [
                'id' => $activeLog->id,
                'task_id' => $activeLog->task_id,
                'task_title' => $activeLog->task?->title,
                'task_ngo' => $activeLog->task?->ngo?->organization_name,
                'check_in_time' => $activeLog->check_in_time,
                'elapsed_minutes' => $activeLog->check_in_time?->diffInMinutes(now()),
                'confidence_score' => $activeLog->attendance_confidence_score,
                'confidence_level' => $activeLog->confidence_level,
            ],
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $logs = ServiceLog::with(['task.ngo'])
            ->where('volunteer_profile_id', $profile->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $logs->map(fn($l) => $this->formatLog($l)),
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $logs = ServiceLog::where('volunteer_profile_id', $profile->id);

        $totalSessions = $logs->count();
        $totalHours = $logs->where('participation_status', 'completed')->sum('hours');
        $completedSessions = $logs->where('participation_status', 'completed')->count();
        $activeSessions = $logs->where('participation_status', 'active')->count();
        $absentSessions = $logs->where('participation_status', 'absent')->count();
        $avgConfidence = $logs->whereNotNull('attendance_confidence_score')->avg('attendance_confidence_score');
        $highConfidence = $logs->where('confidence_level', 'high')->count();

        return response()->json([
            'data' => [
                'total_sessions' => $totalSessions,
                'total_hours' => round($totalHours, 2),
                'completed_sessions' => $completedSessions,
                'active_sessions' => $activeSessions,
                'absent_sessions' => $absentSessions,
                'average_confidence' => $avgConfidence ? round($avgConfidence, 1) : null,
                'high_confidence_sessions' => $highConfidence,
            ],
        ]);
    }

    private function formatLog(ServiceLog $log): array
    {
        return [
            'id' => $log->id,
            'task_id' => $log->task_id,
            'task_title' => $log->task?->title,
            'task_ngo' => $log->task?->ngo?->organization_name,
            'status' => $log->participation_status,
            'check_in_time' => $log->check_in_time,
            'check_out_time' => $log->check_out_time,
            'hours' => $log->hours,
            'verification_method' => $log->verification_method,
            'confidence_score' => $log->attendance_confidence_score,
            'confidence_level' => $log->confidence_level,
            'check_in_distance' => $log->check_in_distance_from_task,
            'check_out_distance' => $log->check_out_distance_from_task,
            'created_at' => $log->created_at,
        ];
    }
}
