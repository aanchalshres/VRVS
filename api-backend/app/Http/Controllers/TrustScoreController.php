<?php

namespace App\Http\Controllers;

use App\Models\TrustScoreHistory;
use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrustScoreController extends Controller
{
    public function __construct(
        private TrustScoreService $trustService,
    ) {}

    public function myScore(Request $request): JsonResponse
    {
        $profile = $request->user()->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        return response()->json([
            'trust_score' => $profile->trust_score,
            'components' => $profile->trust_score_components,
            'updated_at' => $profile->trust_updated_at,
        ]);
    }

    public function myHistory(Request $request): JsonResponse
    {
        $profile = $request->user()->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $history = TrustScoreHistory::where('volunteer_profile_id', $profile->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($history);
    }

    public function breakdown(Request $request): JsonResponse
    {
        $profile = $request->user()->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $result = $this->trustService->calculateForVolunteer($profile);

        return response()->json([
            'current_score' => $profile->trust_score,
            'computed_score' => $result['final_score'],
            'components' => $result['components'],
            'weights' => config('trust-score.weights'),
            'updated_at' => $profile->trust_updated_at,
        ]);
    }

    public function recalculate(Request $request): JsonResponse
    {
        $profile = $request->user()->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $profile = $this->trustService->recalculate($profile, 'manual_request');

        return response()->json([
            'message' => 'Trust score recalculated',
            'trust_score' => $profile->trust_score,
            'components' => $profile->trust_score_components,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $profile = VolunteerProfile::findOrFail($id);

        return response()->json([
            'trust_score' => $profile->trust_score,
            'components' => $profile->trust_score_components,
            'updated_at' => $profile->trust_updated_at,
        ]);
    }

    public function adminRecalculate(Request $request, int $id): JsonResponse
    {
        $profile = VolunteerProfile::findOrFail($id);

        $profile = $this->trustService->recalculate($profile, 'admin_manual');

        return response()->json([
            'message' => 'Trust score recalculated',
            'trust_score' => $profile->trust_score,
            'components' => $profile->trust_score_components,
        ]);
    }

    public function adminRecalculateAll(Request $request): JsonResponse
    {
        $count = $this->trustService->recalculateAll('admin_bulk');

        return response()->json([
            'message' => "Trust scores recalculated for {$count} volunteers",
            'count' => $count,
        ]);
    }

    public function adminHistory(int $profileId): JsonResponse
    {
        $history = TrustScoreHistory::where('volunteer_profile_id', $profileId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($history);
    }
}
