<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\QrCode;
use App\Models\ServiceLog;
use App\Services\AttendanceVerification\Contracts\QrCodeServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NgoAttendanceController extends Controller
{
    public function __construct(
        private QrCodeServiceInterface $qrCodeService
    ) {}

    public function generateQr(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
        ]);

        $task = \App\Models\Task::findOrFail($validated['task_id']);

        if ($task->ngo_id !== $user->ngoProfile?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($task->status !== 'Open') {
            return response()->json(['message' => 'Cannot generate QR for a non-active task'], 422);
        }

        $qr = $this->qrCodeService->generate($task, $user->id);

        $qrData = [
            'token' => $qr->token,
            'task_id' => $task->id,
            'task_title' => $task->title,
            'expires_at' => $qr->expires_at,
        ];

        return response()->json([
            'message' => 'QR code generated',
            'data' => $qrData,
        ], 201);
    }

    public function listQrCodes(Request $request): JsonResponse
    {
        $user = $request->user();

        $codes = QrCode::with('task')
            ->whereHas('task', fn($q) => $q->where('ngo_id', $user->ngoProfile?->id))
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $codes->map(fn($qr) => [
                'id' => $qr->id,
                'task_id' => $qr->task_id,
                'task_title' => $qr->task?->title,
                'expires_at' => $qr->expires_at,
                'is_active' => $qr->is_active,
                'is_expired' => $qr->expires_at->isPast(),
                'created_at' => $qr->created_at,
            ]),
        ]);
    }

    public function revokeQr(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $qr = QrCode::with('task')->findOrFail($id);

        if ($qr->task?->ngo_id !== $user->ngoProfile?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->qrCodeService->revoke($qr);

        return response()->json(['message' => 'QR code revoked']);
    }

    public function analytics(Request $request): JsonResponse
    {
        $user = $request->user();
        $ngoProfile = $user->ngoProfile;

        if (!$ngoProfile) {
            return response()->json(['message' => 'NGO profile not found'], 404);
        }

        $logs = ServiceLog::whereHas('task', fn($q) => $q->where('ngo_id', $ngoProfile->id));

        $totalSessions = $logs->count();
        $totalHours = $logs->where('participation_status', 'completed')->sum('hours');
        $completedSessions = $logs->where('participation_status', 'completed')->count();
        $activeSessions = $logs->where('participation_status', 'active')->count();
        $absentSessions = $logs->where('participation_status', 'absent')->count();
        $avgConfidence = $logs->whereNotNull('attendance_confidence_score')->avg('attendance_confidence_score');

        $confidenceDistribution = [
            'high' => ServiceLog::whereHas('task', fn($q) => $q->where('ngo_id', $ngoProfile->id))
                ->where('confidence_level', 'high')->count(),
            'medium' => ServiceLog::whereHas('task', fn($q) => $q->where('ngo_id', $ngoProfile->id))
                ->where('confidence_level', 'medium')->count(),
            'low' => ServiceLog::whereHas('task', fn($q) => $q->where('ngo_id', $ngoProfile->id))
                ->where('confidence_level', 'low')->count(),
            'manual_review' => ServiceLog::whereHas('task', fn($q) => $q->where('ngo_id', $ngoProfile->id))
                ->where('confidence_level', 'manual_review')->count(),
        ];

        return response()->json([
            'data' => [
                'total_sessions' => $totalSessions,
                'total_hours' => round($totalHours, 2),
                'completed_sessions' => $completedSessions,
                'active_sessions' => $activeSessions,
                'absent_sessions' => $absentSessions,
                'average_confidence' => $avgConfidence ? round($avgConfidence, 1) : null,
                'confidence_distribution' => $confidenceDistribution,
            ],
        ]);
    }
}
