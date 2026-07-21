<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Task;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function applyForTask(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can apply for tasks'
            ], 403);
        }

        $task = Task::with('user.ngoProfile')->findOrFail($id);

        if (!$task->user?->ngoProfile || !$task->user->ngoProfile->is_verified) {
            return response()->json([
                'message' => 'Cannot apply to this task'
            ], 403);
        }

        $volunteerId = $user->volunteerProfile->id;

        $existing = Application::where('task_id', $id)
            ->where('volunteer_id', $volunteerId)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already applied'
            ], 409);
        }

        $accepted = Application::where('task_id', $id)
            ->where('status', 'Accepted')
            ->count();

        if ($accepted >= $task->quota) {
            return response()->json([
                'message' => 'Task quota is full'
            ], 400);
        }

        $application = Application::create([
            'task_id' => $id,
            'volunteer_id' => $volunteerId,
            'status' => 'Pending',
            'remarks' => $request->message,
        ]);

        return response()->json([
            'message' => 'Application submitted successfully',
            'data' => $application,
        ], 201);
    }


    public function getApplications(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        return response()->json([
            'data' => Application::where(
                'volunteer_id',
                $user->volunteerProfile->id
            )
            ->with(['task', 'task.user.ngoProfile'])
            ->get()
        ]);
    }
}
