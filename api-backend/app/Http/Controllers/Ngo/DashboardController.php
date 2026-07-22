<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Application;
use App\Models\ServiceLog;
use App\Models\Notification;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $ngo = $user->ngoProfile;

        $now = now();

        $totalTasks = Task::where('ngo_id', $ngo->id)->count();
        $activeTasks = Task::where('ngo_id', $ngo->id)
            ->whereIn('status', ['Open', 'Ongoing'])
            ->count();

        $taskIds = Task::where('ngo_id', $ngo->id)->pluck('id');
        $totalApplications = Application::whereIn('task_id', $taskIds)->count();
        $pendingApplications = Application::whereIn('task_id', $taskIds)
            ->where('status', 'Pending')
            ->count();
        $acceptedApplications = Application::whereIn('task_id', $taskIds)
            ->where('status', 'Accepted')
            ->count();

        $upcomingTasks = Task::where('ngo_id', $ngo->id)
            ->whereIn('status', ['Open', 'Ongoing'])
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', $now);
            })
            ->with(['skills', 'category'])
            ->orderBy('start_date', 'asc')
            ->take(5)
            ->get()
            ->map(fn ($task) => [
                'id' => $task->id,
                'title' => $task->title,
                'location' => $task->location ?? $task->city,
                'start_date' => $task->start_date,
                'required_volunteers' => $task->required_volunteers,
            ]);

        $totalHours = ServiceLog::whereIn('task_id', $taskIds)
            ->where('participation_status', 'completed')
            ->sum('hours');

        $recentNotifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'is_read' => $n->is_read,
                'created_at' => $n->created_at,
            ]);

        $profileCompletion = $this->calculateProfileCompletion($ngo);

        return response()->json([
            'data' => [
                'ngo' => [
                    'organization_name' => $ngo->organization_name,
                    'city' => $ngo->city,
                    'country' => $ngo->country,
                    'verification_status' => $ngo->verification_status,
                    'website' => $ngo->website,
                    'description' => $ngo->description,
                ],
                'stats' => [
                    'total_opportunities' => $totalTasks,
                    'active_opportunities' => $activeTasks,
                    'total_applications' => $totalApplications,
                    'pending_applications' => $pendingApplications,
                    'assigned_volunteers' => $acceptedApplications,
                    'total_hours' => round($totalHours, 1),
                ],
                'profile_completion' => $profileCompletion,
                'upcoming_activities' => $upcomingTasks,
                'recent_notifications' => $recentNotifications,
            ]
        ]);
    }

    private function calculateProfileCompletion($ngo): int
    {
        $fields = [
            'organization_name',
            'registration_number',
            'description',
            'mission',
            'vision',
            'logo',
            'website',
            'office_location',
            'city',
            'country',
            'org_category_id',
            'pan_number',
        ];

        $filled = 0;
        foreach ($fields as $field) {
            if (!empty($ngo->$field)) {
                $filled++;
            }
        }

        return (int) round(($filled / count($fields)) * 100);
    }
}
