<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Application;
use App\Models\ServiceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $ngo = $request->user()->ngoProfile;
        $taskIds = Task::where('ngo_id', $ngo->id)->pluck('id');

        $totalVolunteersServed = Application::whereIn('task_id', $taskIds)
            ->where('status', 'Accepted')
            ->distinct('volunteer_profile_id')
            ->count('volunteer_profile_id');

        $activeVolunteers = Application::whereIn('task_id', $taskIds)
            ->where('status', 'Accepted')
            ->whereHas('task', function ($q) {
                $q->whereIn('status', ['Open', 'Ongoing']);
            })
            ->distinct('volunteer_profile_id')
            ->count('volunteer_profile_id');

        $totalApplications = Application::whereIn('task_id', $taskIds)->count();
        $acceptedApplications = Application::whereIn('task_id', $taskIds)->where('status', 'Accepted')->count();
        $rejectedApplications = Application::whereIn('task_id', $taskIds)->where('status', 'Rejected')->count();
        $cancelledApplications = Application::whereIn('task_id', $taskIds)->where('status', 'Cancelled')->count();

        $activeOpportunities = Task::where('ngo_id', $ngo->id)->whereIn('status', ['Open', 'Ongoing'])->count();
        $completedOpportunities = Task::where('ngo_id', $ngo->id)->where('status', 'Completed')->count();

        $totalHours = ServiceLog::whereIn('task_id', $taskIds)
            ->where('participation_status', 'completed')
            ->sum('hours');

        $monthlyStats = Application::whereIn('task_id', $taskIds)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted"),
                DB::raw("SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected"),
                DB::raw("SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending")
            )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->take(12)
            ->get();

        $opportunityStats = Task::where('ngo_id', $ngo->id)
            ->withCount([
                'applications as total_applications',
                'applications as accepted_applications' => function ($q) {
                    $q->where('status', 'Accepted');
                },
                'applications as pending_applications' => function ($q) {
                    $q->where('status', 'Pending');
                },
            ])
            ->with(['category'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($task) => [
                'id' => $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'category' => $task->category?->name,
                'required_volunteers' => $task->required_volunteers,
                'total_applications' => $task->total_applications,
                'accepted_applications' => $task->accepted_applications,
                'pending_applications' => $task->pending_applications,
            ]);

        return response()->json([
            'data' => [
                'overview' => [
                    'total_volunteers_served' => $totalVolunteersServed,
                    'active_volunteers' => $activeVolunteers,
                    'total_applications' => $totalApplications,
                    'accepted_applications' => $acceptedApplications,
                    'rejected_applications' => $rejectedApplications,
                    'cancelled_applications' => $cancelledApplications,
                    'active_opportunities' => $activeOpportunities,
                    'completed_opportunities' => $completedOpportunities,
                    'total_hours' => round($totalHours, 1),
                ],
                'monthly_stats' => $monthlyStats,
                'opportunity_stats' => $opportunityStats,
            ]
        ]);
    }
}
