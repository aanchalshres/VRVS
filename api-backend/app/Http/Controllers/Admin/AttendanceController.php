<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceLog;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceLog::with([
            'volunteer.user:id,name,email',
            'task:id,title,ngo_id',
            'task.ngo:id,organization_name',
        ]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->whereHas('volunteer.user', fn ($uq) => $uq->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('task', fn ($tq) => $tq->where('title', 'like', "%{$s}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('participation_status', $request->status);
        }

        if ($request->filled('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        $logs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'volunteer_profile_id' => $log->volunteer_profile_id,
                'volunteer_name' => $log->volunteer?->user?->name,
                'volunteer_email' => $log->volunteer?->user?->email,
                'task_id' => $log->task_id,
                'task_title' => $log->task?->title,
                'ngo_name' => $log->task?->ngo?->organization_name,
                'check_in_time' => $log->check_in_time,
                'check_out_time' => $log->check_out_time,
                'hours' => (float) ($log->hours ?? 0),
                'participation_status' => $log->participation_status,
                'feedback' => $log->feedback,
                'created_at' => $log->created_at,
            ];
        });

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $log = ServiceLog::with([
            'volunteer.user:id,name,email,phone',
            'task:id,title,description,ngo_id,status',
            'task.ngo:id,organization_name',
        ])->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $log->id,
                'volunteer' => $log->volunteer ? [
                    'id' => $log->volunteer->id,
                    'name' => $log->volunteer->user?->name,
                    'email' => $log->volunteer->user?->email,
                    'phone' => $log->volunteer->user?->phone,
                ] : null,
                'task' => $log->task ? [
                    'id' => $log->task->id,
                    'title' => $log->task->title,
                    'description' => $log->task->description,
                    'status' => $log->task->status,
                    'ngo_name' => $log->task->ngo?->organization_name,
                ] : null,
                'check_in_time' => $log->check_in_time,
                'check_out_time' => $log->check_out_time,
                'hours' => (float) ($log->hours ?? 0),
                'participation_status' => $log->participation_status,
                'feedback' => $log->feedback,
                'created_at' => $log->created_at,
            ],
        ]);
    }

    public function summary()
    {
        $totalHours = ServiceLog::where('participation_status', 'completed')->sum('hours');
        $totalCompleted = ServiceLog::where('participation_status', 'completed')->count();
        $totalActive = ServiceLog::where('participation_status', 'active')->count();
        $totalAbsent = ServiceLog::where('participation_status', 'absent')->count();
        $totalAssigned = ServiceLog::where('participation_status', 'assigned')->count();

        $monthly = ServiceLog::selectRaw("DATE_TRUNC('month', created_at) as month, SUM(hours) as total_hours, COUNT(*) as total_logs")
            ->where('participation_status', 'completed')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'data' => [
                'total_hours' => round($totalHours, 2),
                'total_records' => ServiceLog::count(),
                'completed' => $totalCompleted,
                'active' => $totalActive,
                'absent' => $totalAbsent,
                'assigned' => $totalAssigned,
                'monthly' => $monthly,
            ],
        ]);
    }
}
