<?php

namespace App\Events\TrustScore;

use Illuminate\Foundation\Events\Dispatchable;

class TaskCompleted
{
    use Dispatchable;

    public function __construct(
        public int $volunteerProfileId,
        public int $taskId,
    ) {}
}
