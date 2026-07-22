<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\MatchingService;
use Illuminate\Http\Request;

class TaskController extends Controller
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

        $filters = array_filter($request->only([
            'search', 'category_id', 'urgency_level', 'task_type',
            'location', 'skill', 'date_from', 'date_to',
        ]));

        return response()->json([
            'data' => $this->matchingService
                ->rankTasksForVolunteer($user->volunteerProfile, $filters)
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

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Volunteer profile not found.'
            ], 404);
        }

        $task = $this->matchingService->getTaskDetail($id);

        $app = Application::where('task_id', $id)
            ->where('volunteer_profile_id', $profile->id)
            ->first();

        $task->application_status = $app ? $app->status : 'Not Applied';

        $acceptedCount = Application::where('task_id', $id)
            ->where('status', 'Accepted')
            ->count();

        $task->filled_slots = $acceptedCount;
        $task->remaining_slots = max(0, ($task->required_volunteers ?? 0) - $acceptedCount);

        return response()->json([
            'data' => $task,
        ]);
    }
}
