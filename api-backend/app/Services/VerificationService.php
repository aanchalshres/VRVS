<?php

namespace App\Services;

use App\Models\NgoProfile;
use App\Models\User;
use App\Models\VerificationSession;

class VerificationService
{
    /**
     * Verify an NGO.
     */
    public function verifyNgo(NgoProfile $ngoProfile): NgoProfile
    {
        $ngoProfile->update([
            'verification_status' => 'verified',
        ]);

        return $ngoProfile->fresh();
    }

    /**
     * Reject an NGO.
     */
    public function rejectNgo(
        NgoProfile $ngoProfile,
        ?string $reason = null
    ): NgoProfile {
        $ngoProfile->update([
            'verification_status' => 'rejected',
        ]);

        // Save $reason later if you add a rejection_reason column.

        return $ngoProfile->fresh();
    }

    /**
     * Start a volunteer verification session.
     * Called when the volunteer begins the KYC process.
     */
    public function startVolunteerVerification(User $user): VerificationSession
    {
        return VerificationSession::create([
            'user_id' => $user->id,
            'status'  => 'pending',
        ]);
    }
}
