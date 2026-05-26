<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Application;
use Illuminate\Http\Request;

class NgoController extends Controller
{
    /**
     * Create a task (only verified NGOs via middleware)
     */
    public function createTask(Request $request)
    {
        $user = $request->user();

        // Validate input
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'district' => 'required|string',
            'quota' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'skills' => 'nullable|array',
            'is_emergency' => 'sometimes|boolean',
        ]);

        // Create task
        $task = Task::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'district' => $validated['district'],
            'quota' => $validated['quota'],
            'filled_quota' => 0,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'active',
            'is_emergency' => $validated['is_emergency'] ?? false,
        ]);

        if (!empty($validated['skills'])) {
            foreach ($validated['skills'] as $skillName) {
                $task->skills()->create([
                    'skill_name' => $skillName,
                ]);
            }
        }

        return response()->json([
            'message' => 'Task created successfully',
            'data' => $task,
        ], 201);
    }

    /**
     * Get NGO's tasks
     */
    public function getTasks(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'ngo') {
            return response()->json([
                'message' => 'Only NGOs can access this',
            ], 403);
        }

        $tasks = Task::where('user_id', $user->id)
            ->with(['applications', 'skills'])
            ->get();

        return response()->json(['data' => $tasks]);
    }

    /**
     * Get applications for NGO's tasks
     */
    public function getApplications(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'ngo') {
            return response()->json([
                'message' => 'Only NGOs can access this',
            ], 403);
        }

        $applications = Application::whereHas('task', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with(['volunteer', 'task'])->get();

        return response()->json(['data' => $applications]);
    }

    /**
     * Accept an application
     */
    public function acceptApplication(Request $request, $id)
    {
        $user = $request->user();
        $application = Application::findOrFail($id);

        // Verify ownership
        if ($application->task->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $application->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Application accepted',
            'data' => $application,
        ]);
    }

    /**
     * Reject an application
     */
    public function rejectApplication(Request $request, $id)
    {
        $user = $request->user();
        $application = Application::findOrFail($id);

        // Verify ownership
        if ($application->task->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $application->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Application rejected',
            'data' => $application,
        ]);
    }

    /**
     * Update a task (only task owner NGO)
     */
    public function updateTask(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);

        // Verify ownership
        if ($task->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized - only task owner can update',
            ], 403);
        }

        // Validate input
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'sometimes|string',
            'district' => 'sometimes|string',
            'quota' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'status' => 'sometimes|string|in:active,paused,completed,cancelled',
            'skills' => 'nullable|array',
        ]);

        // Update task fields
        $task->update($validated);

        // Update skills if provided
        if (array_key_exists('skills', $validated)) {
            // Delete existing skills
            $task->skills()->delete();

            // Add new skills
            if (!empty($validated['skills'])) {
                foreach ($validated['skills'] as $skillName) {
                    $task->skills()->create([
                        'skill_name' => $skillName,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Task updated successfully',
            'data' => $task->load(['applications', 'skills']),
        ]);
    }

    /**
     * Delete a task (only task owner NGO)
     */
    public function deleteTask(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);

        // Verify ownership
        if ($task->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized - only task owner can delete',
            ], 403);
        }

        // Check if task has accepted applications
        $acceptedApplications = $task->applications()
            ->where('status', 'accepted')
            ->count();

        if ($acceptedApplications > 0) {
            return response()->json([
                'message' => 'Cannot delete task with accepted applications',
            ], 422);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }

    /**
     * Mark task as completed
     */
    public function completeTask(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);

        // Verify ownership
        if ($task->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $task->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Task marked as completed',
            'data' => $task,
        ]);
    }

    /**
     * Get current NGO's profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'ngo') {
            return response()->json([
                'message' => 'Only NGOs can access this',
            ], 403);
        }

        $ngoProfile = $user->ngoProfile;

        if (!$ngoProfile) {
            return response()->json([
                'message' => 'NGO profile not found',
            ], 404);
        }

        // Generate full URLs for document files
        $registrationUrl = null;
        $panUrl = null;
        $letterheadUrl = null;

        if ($ngoProfile->registration_file_path) {
            $registrationUrl = url('storage/' . $ngoProfile->registration_file_path);
        }
        if ($ngoProfile->pan_file_path) {
            $panUrl = url('storage/' . $ngoProfile->pan_file_path);
        }
        if ($ngoProfile->letterhead_file_path) {
            $letterheadUrl = url('storage/' . $ngoProfile->letterhead_file_path);
        }

        return response()->json([
            'id' => $ngoProfile->id,
            'organization_name' => $ngoProfile->organization_name,
            'registration_number' => $ngoProfile->registration_number,
            'pan_number' => $ngoProfile->pan_number,
            'office_location' => $ngoProfile->office_location,
            'is_verified' => $ngoProfile->is_verified,
            'status' => $ngoProfile->status ?? 'pending',
            'created_at' => $ngoProfile->created_at,
            'registration_file_path' => $registrationUrl,
            'pan_file_path' => $panUrl,
            'letterhead_file_path' => $letterheadUrl,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }
}
