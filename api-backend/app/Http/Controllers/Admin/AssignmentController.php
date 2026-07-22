<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AssignmentService;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function __construct(
        private AssignmentService $assignmentService
    ) {}

    public function batchAssign(Request $request)
    {
        $validated = $request->validate([
            'application_ids' => ['required', 'array'],
            'task_ids'        => ['required', 'array'],
        ]);

        $assignments = $this->assignmentService->batchAssign(
            $validated['application_ids'],
            $validated['task_ids']
        );

        return response()->json([
            'message' => 'Optimal assignments computed',
            'assignments' => $assignments,
        ]);
    }
}
