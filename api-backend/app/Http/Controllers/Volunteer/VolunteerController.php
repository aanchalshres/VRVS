<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Application;
use App\Services\MatchingService;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    public function __construct(
        private MatchingService $matchingService
    ) {}

    public function getTasks(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        return response()->json([
            'data' => $this->matchingService
                ->rankTasksForVolunteer($user->volunteerProfile)
        ]);
    }

    public function getTaskDetail(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        return response()->json([
            'data' => $this->matchingService
                ->getTaskDetail($id)
        ]);
    }

    public function applyForTask(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can apply for tasks'], 403);
        }

        $task = Task::with('user.ngoProfile')->findOrFail($id);

        // FIX 3: same relation fix as above
        if (!$task->user?->ngoProfile || !$task->user->ngoProfile->is_verified) {
            return response()->json(['message' => 'Cannot apply to this task'], 403);
        }

        $volunteerProfileId = $user->volunteerProfile->id;

        $existingApplication = Application::where('task_id', $id)
            ->where('volunteer_id', $volunteerProfileId)
            ->first();

        if ($existingApplication) {
            return response()->json(['message' => 'You have already applied for this task'], 409);
        }

        $acceptedCount = Application::where('task_id', $id)
            ->where('status', 'Accepted')
            ->count();

        // FIX 4: was $task->required_volunteers — correct column name is 'quota'
        if ($acceptedCount >= $task->quota) {
            return response()->json(['message' => 'Task quota is full'], 400);
        }

        $application = Application::create([
            'task_id'      => $id,
            'volunteer_id' => $volunteerProfileId,
            'status'       => 'Pending',
            'remarks'      => $request->message,
        ]);

        return response()->json([
            'message' => 'Application submitted successfully',
            'data'    => $application,
        ], 201);
    }

    public function getApplications(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $applications = Application::where('volunteer_id', $user->volunteerProfile->id)
            ->with(['task', 'task.user.ngoProfile'])
            ->get();

        return response()->json(['data' => $applications]);
    }

    public function getProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        return response()->json([
            'data' => $user->load('volunteerProfile'),
        ]);
    }
}
