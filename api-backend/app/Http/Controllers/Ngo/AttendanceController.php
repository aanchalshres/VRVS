<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\ServiceLog;
use App\Models\Task;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $query = ServiceLog::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->with([
            'volunteer.user',
            'task',
        ]);

        if ($request->filled('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        if ($request->filled('status')) {
            $query->where('participation_status', $request->status);
        }

        $perPage = min((int) $request->input('per_page', 20), 50);
        $records = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $records->items(),
            'meta' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'per_page' => $records->perPage(),
                'total' => $records->total(),
            ],
        ]);
    }

    public function approve(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $log = ServiceLog::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->findOrFail($id);

        if ($log->participation_status === 'completed' || $log->participation_status === 'absent') {
            return response()->json([
                'message' => 'Attendance already finalised'
            ], 422);
        }

        $hours = 0;
        if ($log->check_in_time && $log->check_out_time) {
            $hours = round(
                $log->check_in_time->diffInMinutes($log->check_out_time) / 60,
                2
            );
        }

        $log->update([
            'hours' => $hours,
            'participation_status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Attendance approved',
            'data' => $log->fresh()->load(['volunteer.user', 'task'])
        ]);
    }

    public function markAbsent(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $log = ServiceLog::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })->findOrFail($id);

        if ($log->participation_status === 'completed' || $log->participation_status === 'absent') {
            return response()->json([
                'message' => 'Attendance already finalised'
            ], 422);
        }

        $log->update([
            'hours' => 0,
            'participation_status' => 'absent',
        ]);

        return response()->json([
            'message' => 'Marked as absent',
            'data' => $log->fresh()->load(['volunteer.user', 'task'])
        ]);
    }

    public function summary(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $taskIds = Task::where('ngo_id', $ngo->id)->pluck('id');

        $summary = [
            'total_records' => ServiceLog::whereIn('task_id', $taskIds)->count(),
            'completed' => ServiceLog::whereIn('task_id', $taskIds)->where('participation_status', 'completed')->count(),
            'active' => ServiceLog::whereIn('task_id', $taskIds)->where('participation_status', 'active')->count(),
            'absent' => ServiceLog::whereIn('task_id', $taskIds)->where('participation_status', 'absent')->count(),
            'assigned' => ServiceLog::whereIn('task_id', $taskIds)->where('participation_status', 'assigned')->count(),
            'total_hours' => round(
                ServiceLog::whereIn('task_id', $taskIds)->where('participation_status', 'completed')->sum('hours'),
                1
            ),
        ];

        return response()->json(['data' => $summary]);
    }
}
