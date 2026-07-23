<?php

namespace App\Events\TrustScore;

use Illuminate\Foundation\Events\Dispatchable;

class ApplicationStatusChanged
{
    use Dispatchable;

    public function __construct(
        public int $volunteerProfileId,
        public int $applicationId,
        public string $newStatus,
    ) {}
}
