<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TaskService;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService
    ) {}

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
}
