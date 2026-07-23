<?php

namespace App\Events\TrustScore;

use Illuminate\Foundation\Events\Dispatchable;

class AbsenceRecorded
{
    use Dispatchable;

    public function __construct(
        public int $volunteerProfileId,
        public int $serviceLogId,
    ) {}
}
