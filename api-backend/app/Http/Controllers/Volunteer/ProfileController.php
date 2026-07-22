<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get logged-in volunteer profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'success' => false,
                'message' => 'Only volunteers can access this profile.'
            ], 403);
        }

        $user->load([
            'volunteerProfile.skills',
            'volunteerProfile.documents'
        ]);

        $profile = $user->volunteerProfile;

        // Calculate profile completion
        $profileFields = [
            'name' => $user->name,
            'phone' => $user->phone,
            'bio' => $profile?->bio,
            'gender' => $profile?->gender,
            'date_of_birth' => $profile?->date_of_birth,
            'primary_location' => $profile?->primary_location,
            'city' => $profile?->city,
            'country' => $profile?->country,
            'emergency_contact_name' => $profile?->emergency_contact_name,
            'emergency_contact_phone' => $profile?->emergency_contact_phone,
            'availability' => $profile?->availability,
            'profile_photo' => $profile?->profile_photo,
        ];

        $filledFields = collect($profileFields)->filter(fn ($v) => !empty($v))->keys();
        $totalFields = count($profileFields);
        $filledCount = $filledFields->count();
        $hasSkills = $profile?->skills->count() > 0;
        $hasDocuments = $profile?->documents->count() > 0;

        $completionPercent = min(100, round(
            (($filledCount / $totalFields) * 80) +
            ((($hasSkills ? 1 : 0) + ($hasDocuments ? 1 : 0)) / 2 * 20)
        ));

        // Determine overall verification status
        $documentStatus = 'none';
        $documents = $profile?->documents;
        if ($documents && $documents->count() > 0) {
            if ($documents->where('status', 'verified')->count() > 0) {
                $documentStatus = 'verified';
            } elseif ($documents->where('status', 'pending')->count() > 0) {
                $documentStatus = 'pending';
            } else {
                $documentStatus = 'rejected';
            }
        }

        return response()->json([
            'success' => true,
            'data' => $user,
            'completion' => [
                'percent' => $completionPercent,
                'filled_fields' => $filledFields,
                'total_fields' => $totalFields,
                'filled_count' => $filledCount,
                'has_skills' => $hasSkills,
                'has_documents' => $hasDocuments,
            ],
            'document_status' => $documentStatus,
        ]);
    }

    /**
     * Update volunteer profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'success' => false,
                'message' => 'Only volunteers can update this profile.'
            ], 403);
        }

        $validated = $request->validate([

            /*
            |--------------------------------------------------------------------------
            | User Table
            |--------------------------------------------------------------------------
            */

            'name' => 'required|string|max:255',

            // Keep email read-only for now
            // Email changing requires verification
            'phone' => 'nullable|string|max:20|unique:users,phone,' . $user->id,

            /*
            |--------------------------------------------------------------------------
            | Volunteer Profile
            |--------------------------------------------------------------------------
            */

            'profile_photo' => 'nullable|string|max:255',

            'gender' => 'nullable|in:Male,Female,Other',

            'date_of_birth' => 'nullable|date',

            'bio' => 'nullable|string|max:1000',

            'primary_location' => 'nullable|string|max:255',

            'city' => 'nullable|string|max:100',

            'country' => 'nullable|string|max:100',

            'latitude' => 'nullable|numeric',

            'longitude' => 'nullable|numeric',

            'emergency_contact_name' => 'nullable|string|max:255',

            'emergency_contact_phone' => 'nullable|string|max:20',

            'availability' => 'nullable|in:Available,Unavailable,Busy',

        ]);

        DB::transaction(function () use ($user, $validated) {

            $user->update([
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? $user->phone,
            ]);

            $profile = $user->volunteerProfile;

            $profile->update([

                'profile_photo' => $validated['profile_photo'] ?? $profile->profile_photo,

                'gender' => $validated['gender'] ?? $profile->gender,

                'date_of_birth' => $validated['date_of_birth'] ?? $profile->date_of_birth,

                'bio' => $validated['bio'] ?? $profile->bio,

                'primary_location' => $validated['primary_location'] ?? $profile->primary_location,

                'city' => $validated['city'] ?? $profile->city,

                'country' => $validated['country'] ?? $profile->country,

                'latitude' => $validated['latitude'] ?? $profile->latitude,

                'longitude' => $validated['longitude'] ?? $profile->longitude,

                'emergency_contact_name' => $validated['emergency_contact_name'] ?? $profile->emergency_contact_name,

                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? $profile->emergency_contact_phone,

                'availability' => $validated['availability'] ?? $profile->availability,

            ]);

        });

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user->fresh()->load('volunteerProfile.skills')
        ]);
    }

    /**
     * Upload/change profile photo
     */
    public function uploadPhoto(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'success' => false,
                'message' => 'Only volunteers can update profile photo.'
            ], 403);
        }

        $validated = $request->validate([
            'profile_photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $profile = $user->volunteerProfile;

        // Delete old photo if it was stored locally
        if ($profile->profile_photo) {
            $oldRelativePath = null;
            $storedUrl = $profile->profile_photo;
            $storageUrlPrefix = asset('storage/');
            if (str_starts_with($storedUrl, $storageUrlPrefix)) {
                $oldRelativePath = substr($storedUrl, strlen($storageUrlPrefix));
            } elseif (str_starts_with($storedUrl, '/storage/')) {
                $oldRelativePath = substr($storedUrl, 9);
            }
            if ($oldRelativePath && Storage::disk('public')->exists($oldRelativePath)) {
                Storage::disk('public')->delete($oldRelativePath);
            }
        }

        $file = $request->file('profile_photo');
        $filePath = $file->store('profile-photos', 'public');
        $url = asset('storage/' . $filePath);

        $profile->update(['profile_photo' => $url]);

        return response()->json([
            'success' => true,
            'message' => 'Profile photo uploaded successfully.',
            'data' => [
                'profile_photo' => $url,
            ],
        ]);
    }

    /**
     * Remove profile photo
     */
    public function removePhoto(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'success' => false,
                'message' => 'Only volunteers can remove profile photo.'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        if ($profile->profile_photo) {
            $oldRelativePath = null;
            $storedUrl = $profile->profile_photo;
            $storageUrlPrefix = asset('storage/');
            if (str_starts_with($storedUrl, $storageUrlPrefix)) {
                $oldRelativePath = substr($storedUrl, strlen($storageUrlPrefix));
            } elseif (str_starts_with($storedUrl, '/storage/')) {
                $oldRelativePath = substr($storedUrl, 9);
            }
            if ($oldRelativePath && Storage::disk('public')->exists($oldRelativePath)) {
                Storage::disk('public')->delete($oldRelativePath);
            }
        }

        $profile->update(['profile_photo' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Profile photo removed successfully.',
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'success' => false,
                'message' => 'Only volunteers can change their password.'
            ], 403);
        }

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.'
            ], 422);
        }

        $user->update([
            'password' => $validated['new_password'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }
}
