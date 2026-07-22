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

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Volunteer profile not found.'
            ], 404);
        }

        $task = Task::with('ngo')->findOrFail($id);

        if (!$task->ngo || $task->ngo->verification_status !== 'verified') {
            return response()->json([
                'message' => 'Cannot apply to this task'
            ], 403);
        }

        if (!in_array($task->status, ['Open', 'Ongoing'])) {
            return response()->json([
                'message' => 'This task is no longer accepting applications'
            ], 400);
        }

        $existing = Application::where('task_id', $id)
            ->where('volunteer_profile_id', $profile->id)
            ->whereIn('status', ['Pending', 'Shortlisted', 'Accepted'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already applied to this task'
            ], 409);
        }

        $acceptedCount = Application::where('task_id', $id)
            ->where('status', 'Accepted')
            ->count();

        if ($task->required_volunteers && $acceptedCount >= $task->required_volunteers) {
            return response()->json([
                'message' => 'This task has reached its volunteer limit'
            ], 400);
        }

        $application = Application::create([
            'task_id' => (int) $id,
            'volunteer_profile_id' => $profile->id,
            'status' => 'Pending',
            'applied_at' => now(),
            'remarks' => $request->message,
        ]);

        $application->load('task.ngo.user');

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

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Volunteer profile not found.'
            ], 404);
        }

        return response()->json([
            'data' => Application::where(
                'volunteer_profile_id',
                $profile->id
            )
            ->with(['task', 'task.ngo.user'])
            ->orderBy('created_at', 'desc')
            ->get()
        ]);
    }

    public function withdraw(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can withdraw applications'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        $application = Application::where('id', $id)
            ->where('volunteer_profile_id', $profile->id)
            ->firstOrFail();

        if (!in_array($application->status, ['Pending', 'Shortlisted'])) {
            return response()->json([
                'message' => 'This application cannot be withdrawn'
            ], 400);
        }

        $application->update([
            'status' => 'Withdrawn',
            'remarks' => $request->remarks ?? $application->remarks,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Application withdrawn successfully',
            'data' => $application->fresh()->load('task.ngo.user'),
        ]);
    }
}
