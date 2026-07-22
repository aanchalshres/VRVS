<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        return response()->json([
            'data' => $profile->skills()->withPivot('proficiency_level')->get()
        ]);
    }

    public function sync(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        $validated = $request->validate([
            'skill_ids' => 'required|array',
            'skill_ids.*' => 'exists:skills,id',
        ]);

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found.'], 404);
        }

        $profile->skills()->sync($validated['skill_ids']);

        return response()->json([
            'success' => true,
            'message' => 'Skills updated successfully.',
            'data' => $profile->skills()->withPivot('proficiency_level')->get()
        ]);
    }
}
