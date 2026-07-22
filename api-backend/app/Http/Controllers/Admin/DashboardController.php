<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Application;
use App\Models\Certificate;
use App\Models\NgoProfile;
use App\Models\ServiceLog;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        return $this->getSystemStats();
    }

    public function getSystemStats()
    {
        $totalUsers = User::count();
        $totalVolunteers = User::where('role', 'volunteer')->count();
        $totalNgos = User::where('role', 'ngo')->count();
        $verifiedNgos = NgoProfile::where('verification_status', 'verified')->count();
        $pendingNgos = NgoProfile::where('verification_status', 'pending')->count();
        $totalTasks = Task::count();
        $activeTasks = Task::where('status', 'Open')->count();
        $completedTasks = Task::where('status', 'Completed')->count();
        $totalApplications = Application::count();
        $totalServiceHours = ServiceLog::sum('hours');

        return response()->json([
            'data' => [
                'total_users' => $totalUsers,
                'total_volunteers' => $totalVolunteers,
                'total_ngos' => $totalNgos,
                'verified_ngos' => $verifiedNgos,
                'pending_ngos' => $pendingNgos,
                'total_tasks' => $totalTasks,
                'active_tasks' => $activeTasks,
                'completed_tasks' => $completedTasks,
                'total_applications' => $totalApplications,
                'total_service_hours' => round($totalServiceHours, 2),
            ],
        ]);
    }

    public function activities(Request $request)
    {
        $limit = $request->input('limit', 20);

        $activities = ActivityLog::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'user_name' => $log->user?->name,
                'action' => $log->action,
                'module' => $log->module,
                'description' => $log->description,
                'created_at' => $log->created_at,
            ]);

        return response()->json([
            'data' => $activities,
        ]);
    }

    public function recentNgos()
    {
        $ngos = NgoProfile::with('user:id,name,email,phone')
            ->where('verification_status', 'pending')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($ngo) => [
                'id' => $ngo->id,
                'organization_name' => $ngo->organization_name,
                'registration_number' => $ngo->registration_number,
                'office_location' => $ngo->office_location,
                'verification_status' => $ngo->verification_status,
                'created_at' => $ngo->created_at,
                'user' => $ngo->user ? [
                    'id' => $ngo->user->id,
                    'name' => $ngo->user->name,
                    'email' => $ngo->user->email,
                    'phone' => $ngo->user->phone,
                ] : null,
            ]);

        return response()->json([
            'data' => $ngos,
        ]);
    }
}
