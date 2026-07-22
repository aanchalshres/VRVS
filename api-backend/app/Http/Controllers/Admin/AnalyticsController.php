<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Certificate;
use App\Models\NgoProfile;
use App\Models\Review;
use App\Models\ServiceLog;
use App\Models\Task;
use App\Models\User;
use App\Models\VolunteerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        $totalUsers = User::count();
        $totalVolunteers = User::where('role', 'volunteer')->count();
        $totalNgos = User::where('role', 'ngo')->count();
        $totalTasks = Task::count();
        $totalApplications = Application::count();
        $totalServiceHours = ServiceLog::where('participation_status', 'completed')->sum('hours');
        $totalCertificates = Certificate::count();
        $totalReviews = Review::count();

        return response()->json([
            'data' => [
                'users' => [
                    'total' => $totalUsers,
                    'volunteers' => $totalVolunteers,
                    'ngos' => $totalNgos,
                ],
                'tasks' => [
                    'total' => $totalTasks,
                    'open' => Task::where('status', 'Open')->count(),
                    'completed' => Task::where('status', 'Completed')->count(),
                    'cancelled' => Task::where('status', 'Cancelled')->count(),
                    'draft' => Task::where('status', 'Draft')->count(),
                ],
                'applications' => [
                    'total' => $totalApplications,
                    'pending' => Application::where('status', 'Pending')->count(),
                    'accepted' => Application::where('status', 'Accepted')->count(),
                    'rejected' => Application::where('status', 'Rejected')->count(),
                    'cancelled' => Application::where('status', 'Cancelled')->count(),
                ],
                'service' => [
                    'total_hours' => round($totalServiceHours, 2),
                    'completed_sessions' => ServiceLog::where('participation_status', 'completed')->count(),
                    'active_sessions' => ServiceLog::where('participation_status', 'active')->count(),
                ],
                'verification' => [
                    'pending_ngos' => NgoProfile::where('verification_status', 'pending')->count(),
                    'verified_ngos' => NgoProfile::where('verification_status', 'verified')->count(),
                    'rejected_ngos' => NgoProfile::where('verification_status', 'rejected')->count(),
                ],
                'certificates' => [
                    'total' => $totalCertificates,
                ],
                'reviews' => [
                    'total' => $totalReviews,
                    'average_rating' => round(Review::avg('rating') ?? 0, 2),
                ],
            ],
        ]);
    }

    public function monthly(Request $request)
    {
        $months = (int) $request->input('months', 12);

        $userGrowth = User::selectRaw("DATE_TRUNC('month', created_at) as month, COUNT(*) as count")
            ->groupBy('month')->orderBy('month')->limit($months)->get();

        $taskGrowth = Task::selectRaw("DATE_TRUNC('month', created_at) as month, COUNT(*) as count")
            ->groupBy('month')->orderBy('month')->limit($months)->get();

        $applicationGrowth = Application::selectRaw("DATE_TRUNC('month', created_at) as month, COUNT(*) as count")
            ->groupBy('month')->orderBy('month')->limit($months)->get();

        $serviceHoursMonthly = ServiceLog::selectRaw("DATE_TRUNC('month', created_at) as month, SUM(hours) as total_hours, COUNT(*) as sessions")
            ->where('participation_status', 'completed')
            ->groupBy('month')->orderBy('month')->limit($months)->get();

        return response()->json([
            'data' => [
                'users' => $userGrowth,
                'tasks' => $taskGrowth,
                'applications' => $applicationGrowth,
                'service_hours' => $serviceHoursMonthly,
            ],
        ]);
    }

    public function ngos()
    {
        $topNgos = NgoProfile::withCount(['tasks', 'tasks as active_tasks_count' => fn ($q) => $q->where('status', 'Open')])
            ->withCount(['tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'Completed')])
            ->orderByDesc('tasks_count')
            ->limit(10)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'organization_name' => $n->organization_name,
                'verification_status' => $n->verification_status,
                'total_tasks' => $n->tasks_count,
                'active_tasks' => $n->active_tasks_count,
                'completed_tasks' => $n->completed_tasks_count,
            ]);

        $verificationStats = [
            'pending' => NgoProfile::where('verification_status', 'pending')->count(),
            'verified' => NgoProfile::where('verification_status', 'verified')->count(),
            'rejected' => NgoProfile::where('verification_status', 'rejected')->count(),
        ];

        return response()->json([
            'data' => [
                'top_ngos' => $topNgos,
                'verification_stats' => $verificationStats,
                'total' => NgoProfile::count(),
            ],
        ]);
    }

    public function volunteers()
    {
        $total = VolunteerProfile::count();
        $verified = VolunteerProfile::whereHas('documents', fn ($q) => $q->where('status', 'verified'))->count();
        $pending = VolunteerProfile::whereHas('documents', fn ($q) => $q->where('status', 'pending'))->count();
        $withHours = VolunteerProfile::where('total_service_hours', '>', 0)->count();
        $totalHours = ServiceLog::where('participation_status', 'completed')->sum('hours');

        $topVolunteers = VolunteerProfile::with('user:id,name,email')
            ->orderByDesc('total_service_hours')
            ->limit(10)
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'name' => $v->user?->name,
                'email' => $v->user?->email,
                'total_service_hours' => round($v->total_service_hours ?? 0, 2),
                'trust_score' => $v->trust_score,
                'average_rating' => $v->average_rating,
            ]);

        $cityDistribution = VolunteerProfile::select('city', DB::raw('count(*) as count'))
            ->whereNotNull('city')->groupBy('city')->orderByDesc('count')->limit(10)->get();

        return response()->json([
            'data' => [
                'total' => $total,
                'document_verified' => $verified,
                'document_pending' => $pending,
                'with_service_hours' => $withHours,
                'total_service_hours' => round($totalHours, 2),
                'top_volunteers' => $topVolunteers,
                'city_distribution' => $cityDistribution,
            ],
        ]);
    }

    public function opportunities()
    {
        $total = Task::count();
        $byStatus = [
            'Open' => Task::where('status', 'Open')->count(),
            'Completed' => Task::where('status', 'Completed')->count(),
            'Cancelled' => Task::where('status', 'Cancelled')->count(),
            'Draft' => Task::where('status', 'Draft')->count(),
        ];

        $totalVolunteersNeeded = Task::sum('required_volunteers');
        $totalAccepted = Application::where('status', 'Accepted')->count();

        $byCategory = Task::select('category_id', DB::raw('count(*) as count'))
            ->whereNotNull('category_id')
            ->with('category:id,name')
            ->groupBy('category_id')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($t) => [
                'category_name' => $t->category?->name,
                'count' => $t->count,
            ]);

        $topNgos = NgoProfile::withCount('tasks')->orderByDesc('tasks_count')->limit(10)
            ->get()->map(fn ($n) => ['name' => $n->organization_name, 'count' => $n->tasks_count]);

        return response()->json([
            'data' => [
                'total' => $total,
                'by_status' => $byStatus,
                'total_volunteers_needed' => $totalVolunteersNeeded,
                'total_accepted' => $totalAccepted,
                'by_category' => $byCategory,
                'top_ngos' => $topNgos,
            ],
        ]);
    }
}
