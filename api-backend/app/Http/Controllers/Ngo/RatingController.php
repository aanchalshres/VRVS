<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Application;
use App\Models\ServiceLog;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function index(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $reviews = Review::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->where('reviewer_id', $request->user()->id)
            ->with(['reviewee.volunteerProfile', 'task'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'review_text' => $review->comment,
                'created_at' => $review->created_at,
                'volunteer_profile' => $review->reviewee?->volunteerProfile ? [
                    'id' => $review->reviewee->volunteerProfile->id,
                    'user' => ['name' => $review->reviewee->name],
                ] : null,
                'task' => ['title' => $review->task->title ?? ''],
            ]);

        return response()->json(['data' => $reviews]);
    }

    public function store(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $validated = $request->validate([
            'application_id' => 'required|exists:applications,id',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:1000',
        ]);

        $application = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->whereIn('status', ['Accepted', 'Cancelled'])
            ->findOrFail($validated['application_id']);

        $existing = Review::where('reviewer_id', $request->user()->id)
            ->where('reviewee_id', $application->volunteer->user_id)
            ->where('task_id', $application->task_id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already reviewed this volunteer for this task'
            ], 422);
        }

        $review = Review::create([
            'reviewer_id' => $request->user()->id,
            'reviewee_id' => $application->volunteer->user_id,
            'task_id' => $application->task_id,
            'rating' => $validated['rating'],
            'comment' => $validated['review_text'],
        ]);

        $review->load(['reviewee.volunteerProfile', 'task']);

        return response()->json([
            'message' => 'Rating submitted',
            'data' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'review_text' => $review->comment,
                'created_at' => $review->created_at,
                'volunteer_profile' => $review->reviewee?->volunteerProfile ? [
                    'id' => $review->reviewee->volunteerProfile->id,
                    'user' => ['name' => $review->reviewee->name],
                ] : null,
                'task' => ['title' => $review->task->title ?? ''],
            ],
        ], 201);
    }

    public function volunteerHistory(Request $request, $volunteerProfileId)
    {
        $ngo = $request->user()->ngoProfile;

        $reviews = Review::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->whereHas('reviewee', function ($q) use ($volunteerProfileId) {
            $q->whereHas('volunteerProfile', function ($q2) use ($volunteerProfileId) {
                $q2->where('id', $volunteerProfileId);
            });
        })->with(['reviewee.volunteerProfile', 'reviewer', 'task'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'review_text' => $review->comment,
                'created_at' => $review->created_at,
                'volunteer_profile' => $review->reviewee?->volunteerProfile ? [
                    'id' => $review->reviewee->volunteerProfile->id,
                    'user' => ['name' => $review->reviewee->name],
                ] : null,
                'task' => ['title' => $review->task->title ?? ''],
            ]);

        return response()->json(['data' => $reviews]);
    }

    public function eligibleVolunteers(Request $request)
    {
        $ngo = $request->user()->ngoProfile;
        $userId = $request->user()->id;

        $eligible = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->whereIn('status', ['Accepted', 'Cancelled'])
            ->with(['volunteer.user', 'task'])
            ->whereRaw('NOT EXISTS (
                SELECT 1 FROM reviews
                WHERE reviews.task_id = applications.task_id
                AND reviews.reviewer_id = ?
                AND reviews.reviewee_id = (
                    SELECT user_id FROM volunteer_profiles
                    WHERE volunteer_profiles.id = applications.volunteer_profile_id
                )
            )', [$userId])
            ->get()
            ->map(fn ($app) => [
                'id' => $app->id,
                'application_id' => $app->id,
                'volunteer_profile_id' => $app->volunteer_profile_id,
                'volunteer_name' => $app->volunteer?->user?->name,
                'task_id' => $app->task_id,
                'task_title' => $app->task->title,
                'hours_contributed' => (float) ServiceLog::where('volunteer_profile_id', $app->volunteer_profile_id)
                    ->where('task_id', $app->task_id)
                    ->sum('hours'),
            ]);

        return response()->json(['data' => $eligible]);
    }
}
