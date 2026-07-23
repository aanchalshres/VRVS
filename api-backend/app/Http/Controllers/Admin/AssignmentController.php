<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function __construct(
        private AssignmentService $assignmentService
    ) {}

    public function batchAssign(Request $request): JsonResponse
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
            'message'     => 'Assignments computed and persisted successfully',
            'assignments' => $assignments,
        ]);
    }
}
