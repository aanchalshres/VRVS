<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load('ngoProfile.orgCategory');

        return response()->json([
            'data' => [
                'id' => $user->ngoProfile->id,
                'organization_name' => $user->ngoProfile->organization_name,
                'registration_number' => $user->ngoProfile->registration_number,
                'description' => $user->ngoProfile->description,
                'mission' => $user->ngoProfile->mission,
                'vision' => $user->ngoProfile->vision,
                'logo' => $user->ngoProfile->logo,
                'logo_url' => $user->ngoProfile->logo
                    ? url('storage/' . $user->ngoProfile->logo)
                    : null,
                'website' => $user->ngoProfile->website,
                'social_links' => $user->ngoProfile->social_links,
                'office_location' => $user->ngoProfile->office_location,
                'city' => $user->ngoProfile->city,
                'country' => $user->ngoProfile->country,
                'org_category_id' => $user->ngoProfile->org_category_id,
                'org_category' => $user->ngoProfile->orgCategory,
                'latitude' => $user->ngoProfile->latitude,
                'longitude' => $user->ngoProfile->longitude,
                'pan_number' => $user->ngoProfile->pan_number,
                'verification_status' => $user->ngoProfile->verification_status,
                'verified_by' => $user->ngoProfile->verified_by,
                'verified_at' => $user->ngoProfile->verified_at,
                'rejection_reason' => $user->ngoProfile->rejection_reason,
                'created_at' => $user->ngoProfile->created_at,
                'updated_at' => $user->ngoProfile->updated_at,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
            ]
        ]);
    }

    public function update(Request $request)
    {
        $profile = $request->user()->ngoProfile;

        $validated = $request->validate([
            'organization_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'mission' => 'nullable|string',
            'vision' => 'nullable|string',
            'website' => 'nullable|string|max:255',
            'social_links' => 'nullable|json',
            'office_location' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'org_category_id' => 'nullable|exists:categories,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'pan_number' => 'nullable|string|max:255',
        ]);

        if (isset($validated['social_links'])) {
            $validated['social_links'] = json_decode($validated['social_links'], true);
        }

        $profile->update($validated);

        return response()->json([
            'message' => 'Profile updated',
            'data' => $profile->fresh()->load('orgCategory')
        ]);
    }

    public function uploadLogo(Request $request)
    {
        $profile = $request->user()->ngoProfile;

        $validated = $request->validate([
            'logo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($profile->logo) {
            Storage::disk('public')->delete($profile->logo);
        }

        $path = $request->file('logo')->store('ngo-logos', 'public');

        $profile->update(['logo' => $path]);

        return response()->json([
            'message' => 'Logo uploaded',
            'data' => [
                'logo' => $path,
                'logo_url' => url('storage/' . $path),
            ]
        ], 201);
    }

    public function removeLogo(Request $request)
    {
        $profile = $request->user()->ngoProfile;

        if ($profile->logo) {
            Storage::disk('public')->delete($profile->logo);
            $profile->update(['logo' => null]);
        }

        return response()->json([
            'message' => 'Logo removed'
        ]);
    }
}
