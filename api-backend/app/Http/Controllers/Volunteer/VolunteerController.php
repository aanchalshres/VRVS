<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Application;
use App\Services\TfIdfService;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    public function __construct(private TfIdfService $tfidf) {}

    public function getTasks(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $volunteerProfile = $user->volunteerProfile;
        $volunteerVector  = $volunteerProfile?->tfidf_vector ?? [];
        $volunteerLat     = $volunteerProfile?->latitude;
        $volunteerLng     = $volunteerProfile?->longitude;
        $tfidf            = $this->tfidf;

        $alpha = 0.5; // skill match
        $beta  = 0.3; // distance
        $gamma = 0.2; // trust

        // FIX 1a: was ->whereHas('ngoProfile') — tasks belong to a user who has an ngoProfile
        // FIX 1b: was checking 'verification_status' = 'verified' — correct column is 'is_verified' = true
        $tasks = Task::where('status', 'active')
            ->whereHas('user.ngoProfile', function ($query) {
                $query->where('is_verified', true);
            })
            ->whereNotNull('tfidf_vector')
            ->with(['user.ngoProfile', 'skills'])
            ->get();

        $tasks = $tasks->map(function ($task) use (
            $volunteerProfile, $volunteerVector, $volunteerLat, $volunteerLng, $tfidf, $alpha, $beta, $gamma
        ) {
            $skillScore = count($volunteerVector) > 0
                ? $tfidf->cosineSimilarity($volunteerVector, $task->tfidf_vector ?? [])
                : 0;

            $distScore = 0;
            if ($volunteerLat && $volunteerLng && $task->latitude && $task->longitude) {
                $km        = $tfidf->haversine($volunteerLat, $volunteerLng, $task->latitude, $task->longitude);
                $distScore = max(0, 1 - ($km / 500));
            }

            $trustScore = $volunteerProfile?->trust_score ?? 0.5;

            $finalScore = ($alpha * $skillScore) + ($beta * $distScore) + ($gamma * $trustScore);

            $task->match_score = round($finalScore * 100, 1);
            return $task;
        })
        ->sortByDesc('match_score')
        ->values();

        return response()->json(['data' => $tasks]);
    }

    public function getTaskDetail(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $task = Task::with(['user.ngoProfile', 'applications', 'skills'])->findOrFail($id);

    
        if (!$task->user?->ngoProfile || !$task->user->ngoProfile->is_verified) {
            return response()->json(['message' => 'Task not available'], 404);
        }

        return response()->json(['data' => $task]);
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
