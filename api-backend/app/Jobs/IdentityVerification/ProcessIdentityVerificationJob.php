<?php

namespace App\Jobs\IdentityVerification;

use App\Models\IdentityVerification\IdentityVerification;
use App\Services\IdentityVerification\VerificationPipelineService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessIdentityVerificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;

    public function __construct(
        private int $verificationId,
    ) {}

    public function handle(VerificationPipelineService $pipeline): void
    {
        $verification = IdentityVerification::find($this->verificationId);

        if (!$verification) {
            return;
        }

        $pipeline->process($verification);
    }
}
