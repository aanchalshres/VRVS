<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with([
            'reporter:id,name,email',
            'againstUser:id,name,email',
            'resolver:id,name,email',
            'task:id,title',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $reports,
            'total' => $reports->count(),
        ]);
    }

    public function show($id)
    {
        $report = Report::with([
            'reporter:id,name,email',
            'againstUser:id,name,email',
            'resolver:id,name,email',
            'task:id,title',
        ])->findOrFail($id);

        return response()->json([
            'data' => $report,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,reviewed,resolved,rejected',
            'resolution_notes' => 'nullable|string|max:2000',
        ]);

        $report = Report::findOrFail($id);

        $data = [
            'status' => $validated['status'],
        ];

        if (in_array($validated['status'], ['resolved', 'rejected'])) {
            $data['resolved_by'] = Auth::id();
            $data['resolved_at'] = now();
            $data['resolution_notes'] = $validated['resolution_notes'] ?? null;
        }

        $report->update($data);

        $report->load([
            'reporter:id,name,email',
            'againstUser:id,name,email',
            'resolver:id,name,email',
            'task:id,title',
        ]);

        return response()->json([
            'message' => 'Report updated successfully',
            'data' => $report,
        ]);
    }
}
