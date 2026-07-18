<?php

namespace App\Services;

use App\Models\Task;

class TaskService
{
    /**
     * Get all tasks for admin moderation.
     */
    public function getAllTasks()
    {
        return Task::with([
            'ngoProfile',
            'applications'
        ])->get();
    }

    /**
     * Delete a task.
     */
    public function deleteTask(int $id): void
    {
        $task = Task::findOrFail($id);

        $task->delete();
    }
}
