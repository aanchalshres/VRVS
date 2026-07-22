<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Review;
use App\Models\ServiceLog;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $reviews = Review::where('reviewer_id', $user->id)
            ->with(['reviewee', 'task.ngo.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $reviews]);
    }

    public function received(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $reviews = Review::where('reviewee_id', $user->id)
            ->with(['reviewer', 'task.ngo.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $reviews]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $profile = $user->volunteerProfile;

        $application = Application::where('task_id', $validated['task_id'])
            ->where('volunteer_profile_id', $profile->id)
            ->where('status', 'Accepted')
            ->first();

        if (!$application) {
            return response()->json([
                'message' => 'You must have been accepted for this task to rate it.'
            ], 422);
        }

        $completedLog = ServiceLog::where('task_id', $validated['task_id'])
            ->where('volunteer_profile_id', $profile->id)
            ->where('participation_status', 'completed')
            ->first();

        if (!$completedLog) {
            return response()->json([
                'message' => 'You must complete the task before rating.'
            ], 422);
        }

        $task = $application->task;
        $ngoUserId = $task->ngo->user_id;

        $existing = Review::where('reviewer_id', $user->id)
            ->where('reviewee_id', $ngoUserId)
            ->where('task_id', $validated['task_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already reviewed this NGO for this task.'
            ], 422);
        }

        $review = Review::create([
            'reviewer_id' => $user->id,
            'reviewee_id' => $ngoUserId,
            'task_id' => $validated['task_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        return response()->json([
            'message' => 'Rating submitted successfully.',
            'data' => $review->load(['reviewee', 'task.ngo.user']),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $review = Review::where('id', $id)->where('reviewer_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Rating updated successfully.',
            'data' => $review->fresh()->load(['reviewee', 'task.ngo.user']),
        ]);
    }

    public function eligibleTasks(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $profile = $user->volunteerProfile;

        $completedTasks = Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Accepted')
            ->whereHas('task.serviceLogs', function ($q) use ($profile) {
                $q->where('volunteer_profile_id', $profile->id)
                  ->where('participation_status', 'completed');
            })
            ->whereDoesntHave('task.reviews', function ($q) use ($user) {
                $q->where('reviewer_id', $user->id);
            })
            ->with(['task.ngo.user', 'task.skills'])
            ->get()
            ->map(fn ($app) => [
                'task_id' => $app->task_id,
                'task_title' => $app->task->title,
                'ngo_name' => $app->task->ngo->user->name ?? $app->task->ngo->organization_name ?? 'NGO',
                'skills' => $app->task->skills->pluck('name'),
            ]);

        return response()->json(['data' => $completedTasks]);
    }
}
