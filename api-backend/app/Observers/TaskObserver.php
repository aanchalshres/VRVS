<?php

namespace App\Observers;

use App\Models\Task;
use App\Services\TfIdfGenerationService;

class TaskObserver
{
    public function __construct(
        private TfIdfGenerationService $tfidf,
    ) {}

    public function saved(Task $task): void
    {
        if ($task->wasChanged(['title', 'description', 'category_id', 'location', 'city', 'country'])) {
            $task->loadMissing(['skills', 'category']);
            $this->tfidf->generateForTask($task);
        }
    }
}
