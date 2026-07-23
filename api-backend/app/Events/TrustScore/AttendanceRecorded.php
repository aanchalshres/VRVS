<?php

namespace App\Events\TrustScore;

use Illuminate\Foundation\Events\Dispatchable;

class AttendanceRecorded
{
    use Dispatchable;

    public function __construct(
        public int $volunteerProfileId,
        public string $action,
        public ?float $confidenceScore = null,
    ) {}
}
