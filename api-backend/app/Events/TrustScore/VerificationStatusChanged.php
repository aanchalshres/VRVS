<?php

namespace App\Events\TrustScore;

use Illuminate\Foundation\Events\Dispatchable;

class VerificationStatusChanged
{
    use Dispatchable;

    public function __construct(
        public int $volunteerProfileId,
        public string $newStatus,
    ) {}
}
