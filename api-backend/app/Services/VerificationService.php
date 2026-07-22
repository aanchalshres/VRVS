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
        $data = ['verification_status' => 'rejected'];

        if ($reason !== null) {
            $data['rejection_reason'] = $reason;
        }

        $ngoProfile->update($data);

        return $ngoProfile->fresh();
    }

    /**
     * Get all pending NGOs.
     */
    public function getPendingNgos()
    {
        return NgoProfile::where('verification_status', 'pending')
            ->with('user')
            ->get();
    }

    public function verifyNgoById(int $id): NgoProfile
    {
        $ngo = NgoProfile::findOrFail($id);

        $this->verifyNgo($ngo);

        if ($ngo->user_id) {
            app(NotificationService::class)->verificationApproved($ngo->user_id);
        }

        return $ngo;
    }

    public function rejectNgoById(int $id, ?string $reason = null): NgoProfile
    {
        $ngo = NgoProfile::findOrFail($id);

        $this->rejectNgo($ngo, $reason);

        if ($ngo->user_id) {
            app(NotificationService::class)->verificationRejected(
                $ngo->user_id,
                $reason ?? 'No reason provided'
            );
        }

        return $ngo;
    }

    public function getAllNgos()
    {
        return NgoProfile::with('user')
            ->latest()
            ->get()
            ->map(fn ($ngo) => [
                'id' => $ngo->id,
                'organization_name' => $ngo->organization_name,
                'registration_number' => $ngo->registration_number,
                'pan_number' => $ngo->pan_number,
                'office_location' => $ngo->office_location,
                'verification_status' => $ngo->verification_status,
                'status' => $ngo->verification_status,
                'created_at' => $ngo->created_at,
                'user' => [
                    'id' => $ngo->user?->id,
                    'name' => $ngo->user?->name,
                    'email' => $ngo->user?->email,
                    'phone' => $ngo->user?->phone,
                ],
            ]);
    }

    public function getNgoDetails(int $id): array
    {
        $ngo = NgoProfile::with(['user', 'documents'])->findOrFail($id);

        $registrationDoc = $ngo->documents->firstWhere('document_type', 'registration_certificate');
        $panDoc = $ngo->documents->firstWhere('document_type', 'pan_document');
        $letterheadDoc = $ngo->documents->firstWhere('document_type', 'letterhead');

        return [
            'id' => $ngo->id,
            'organization_name' => $ngo->organization_name,
            'registration_number' => $ngo->registration_number,
            'pan_number' => $ngo->pan_number,
            'office_location' => $ngo->office_location,
            'verification_status' => $ngo->verification_status,
            'status' => $ngo->verification_status,
            'created_at' => $ngo->created_at,
            'registration_file_path' => $registrationDoc
                ? url('storage/' . $registrationDoc->file_path)
                : null,
            'pan_file_path' => $panDoc
                ? url('storage/' . $panDoc->file_path)
                : null,
            'letterhead_file_path' => $letterheadDoc
                ? url('storage/' . $letterheadDoc->file_path)
                : null,
            'user' => [
                'id' => $ngo->user?->id,
                'name' => $ngo->user?->name,
                'email' => $ngo->user?->email,
                'phone' => $ngo->user?->phone,
            ],
        ];
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
