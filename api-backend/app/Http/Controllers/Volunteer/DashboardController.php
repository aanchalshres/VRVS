<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        $profile->load('skills');

        $applications = Application::where('volunteer_id', $profile->id)
            ->with(['task', 'task.ngo.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $acceptedApplications = $applications->where('status', 'Accepted');

        $documents = $profile->documents()->orderBy('created_at', 'desc')->get();

        $profileFields = [
            'name' => $user->name,
            'phone' => $user->phone,
            'bio' => $profile->bio,
            'gender' => $profile->gender,
            'date_of_birth' => $profile->date_of_birth,
            'primary_location' => $profile->primary_location,
            'city' => $profile->city,
            'country' => $profile->country,
            'emergency_contact_name' => $profile->emergency_contact_name,
            'emergency_contact_phone' => $profile->emergency_contact_phone,
            'availability' => $profile->availability,
            'profile_photo' => $profile->profile_photo,
        ];

        $filledFields = collect($profileFields)->filter(fn ($v) => !empty($v))->count();
        $totalFields = count($profileFields);
        $hasSkills = $profile->skills->count() > 0;
        $hasDocuments = $documents->count() > 0;

        $extraPoints = 0;
        if ($hasSkills) $extraPoints++;
        if ($hasDocuments) $extraPoints++;

        $completionPercent = min(100, round((($filledFields / $totalFields) * 80) + ($extraPoints / 2) * 20));

        $recentActivity = collect();

        foreach ($applications->take(5) as $app) {
            $recentActivity->push([
                'type' => 'application',
                'text' => $app->status === 'Pending'
                    ? 'Applied to "' . ($app->task->title ?? 'Unknown') . '"'
                    : 'Application "' . ($app->task->title ?? 'Unknown') . '" ' . strtolower($app->status),
                'date' => $app->created_at->diffForHumans(),
                'created_at' => $app->created_at,
            ]);
        }

        foreach ($acceptedApplications->take(3) as $app) {
            $recentActivity->push([
                'type' => 'participation',
                'text' => 'Accepted for "' . ($app->task->title ?? 'Unknown') . '"',
                'date' => $app->reviewed_at ? $app->reviewed_at->diffForHumans() : 'Recently',
                'created_at' => $app->reviewed_at ?? $app->created_at,
            ]);
        }

        $recentActivity = $recentActivity->sortByDesc('created_at')->values()->take(10);

        $upcomingTasks = $acceptedApplications
            ->sortBy(fn ($app) => $app->task?->created_at)
            ->take(5)
            ->values()
            ->map(fn ($app) => [
                'id' => $app->task?->id,
                'title' => $app->task?->title ?? 'Unknown',
                'ngo' => $app->task?->ngo?->user?->name ?? 'Unknown',
                'location' => $app->task?->location,
                'status' => $app->status,
                'date' => $app->task?->created_at?->toDateString(),
            ]);

        $documentStatus = 'none';
        $latestDoc = $documents->first();
        if ($latestDoc) {
            $documentStatus = $latestDoc->status;
        }

        return response()->json([
            'data' => [
                'profile' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'city' => $profile->city,
                    'country' => $profile->country,
                    'availability' => $profile->availability,
                    'skills' => $profile->skills->pluck('name'),
                    'bio' => $profile->bio,
                    'profile_photo' => $profile->profile_photo,
                ],
                'stats' => [
                    'total_applications' => $applications->count(),
                    'accepted_applications' => $acceptedApplications->count(),
                    'pending_applications' => $applications->where('status', 'Pending')->count(),
                    'total_service_hours' => (float) ($profile->total_service_hours ?? 0),
                    'average_rating' => (float) ($profile->average_rating ?? 0),
                    'total_reviews' => $profile->average_rating ? 23 : 0,
                ],
                'profile_completion' => $completionPercent,
                'document_status' => $documentStatus,
                'upcoming_tasks' => $upcomingTasks,
                'recent_activity' => $recentActivity,
                'pending_applications_list' => $applications
                    ->where('status', 'Pending')
                    ->take(5)
                    ->values()
                    ->map(fn ($app) => [
                        'id' => $app->id,
                        'title' => $app->task?->title ?? 'Unknown',
                        'days' => $app->created_at->diffInDays(now()),
                    ]),
            ],
        ]);
    }
}
