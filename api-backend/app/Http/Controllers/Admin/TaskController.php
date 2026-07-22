<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService
    ) {}

    public function index()
    {
        return $this->getTaskModeration();
    }

    public function destroy($id)
    {
        return $this->deleteTask($id);
    }

    public function getTaskModeration()
    {
        $tasks = $this->taskService->getAllTasks();

        return response()->json([
            'data'  => $tasks,
            'total' => $tasks->count(),
        ]);
    }

    public function deleteTask($id)
    {
        $this->taskService->deleteTask($id);

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    public function show($id)
    {
        $task = Task::with([
            'ngo:id,organization_name,user_id',
            'ngo.user:id,name,email',
            'category:id,name',
            'skills:id,name',
            'applications.volunteer.user:id,name,email',
        ])->withCount('applications')->findOrFail($id);

        return response()->json([
            'data' => $task,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Open,Closed,Completed,Cancelled,Draft',
        ]);

        $task = Task::findOrFail($id);
        $task->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Task status updated to ' . $validated['status'],
            'data' => $task->fresh()->load('ngo', 'category'),
        ]);
    }
}
