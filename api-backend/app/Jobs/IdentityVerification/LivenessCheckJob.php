<?php

namespace App\Jobs\IdentityVerification;

use App\Models\IdentityVerification\IdentitySelfie;
use App\Services\IdentityVerification\LivenessDetectionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class LivenessCheckJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public function __construct(
        private int $selfieId,
    ) {}

    public function handle(LivenessDetectionService $livenessService): void
    {
        $selfie = IdentitySelfie::find($this->selfieId);

        if (!$selfie) {
            return;
        }

        $result = $livenessService->analyze($selfie->file_path);

        $selfie->update([
            'liveness_result' => $result['raw_result'],
            'liveness_status' => $result['status'],
        ]);
    }
}
