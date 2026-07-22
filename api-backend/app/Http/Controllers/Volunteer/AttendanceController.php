<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ServiceLog;
use App\Models\Task;
use App\Services\AttendanceService;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(
        private AttendanceService $attendanceService
    ) {}

    public function checkIn(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can check in'], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $taskId = $request->input('task_id');

        if (!$taskId) {
            return response()->json(['message' => 'Task ID is required.'], 400);
        }

        $task = Task::find($taskId);

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        $isAssigned = Application::where('task_id', $taskId)
            ->where('volunteer_profile_id', $profile->id)
            ->where('status', 'Accepted')
            ->exists();

        if (!$isAssigned) {
            return response()->json([
                'message' => 'You are not assigned to this task.'
            ], 403);
        }

        $activeSession = ServiceLog::where('task_id', $taskId)
            ->where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'active')
            ->first();

        if ($activeSession) {
            return response()->json([
                'message' => 'You have already checked in to this task.'
            ], 409);
        }

        $serviceLog = $this->attendanceService->checkIn($profile, $task);

        return response()->json([
            'message' => 'Checked in successfully',
            'data' => $serviceLog->load('task.ngo.user'),
        ], 201);
    }

    public function checkOut(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can check out'], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $taskId = $request->input('task_id');

        if (!$taskId) {
            return response()->json(['message' => 'Task ID is required.'], 400);
        }

        $activeSession = ServiceLog::where('task_id', $taskId)
            ->where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'active')
            ->first();

        if (!$activeSession) {
            return response()->json([
                'message' => 'You have not checked in to this task.'
            ], 400);
        }

        $serviceLog = $this->attendanceService->checkOut($activeSession);

        return response()->json([
            'message' => 'Checked out successfully',
            'data' => $serviceLog->load('task.ngo.user'),
            'hours' => (float) $serviceLog->hours,
        ]);
    }

    public function history(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $logs = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->with(['task', 'task.ngo.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $logs]);
    }

    public function hours(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $totalHours = ServiceLog::where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'completed')
            ->sum('hours');

        return response()->json([
            'total_hours' => (float) $totalHours,
        ]);
    }
}
