<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Services\WorkflowService;
use App\Services\Ranking\Ranker;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    public function __construct(
        private WorkflowService $workflowService,
        private Ranker $ranker
    ) {}

    public function recommendedNgos(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Volunteer profile not found'
            ], 404);
        }

        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:50',
            'strategy' => 'nullable|string|in:' . implode(',', array_keys(Ranker::getAvailableStrategies())),
        ]);

        $limit = $validated['limit'] ?? null;
        $strategy = $validated['strategy'] ?? null;

        $ngos = $this->workflowService->getRecommendedNgos($profile, $limit, $strategy);

        return response()->json([
            'strategy_used' => $strategy ?? config('workflow.default_strategy', 'recommendation'),
            'data' => $ngos->map(function ($ngo) {
                return [
                    'id' => $ngo->id,
                    'organization_name' => $ngo->organization_name,
                    'description' => $ngo->description,
                    'mission' => $ngo->mission,
                    'city' => $ngo->city,
                    'country' => $ngo->country,
                    'logo' => $ngo->logo,
                    'website' => $ngo->website,
                    'recommendation_score' => $ngo->recommendation_score,
                    'best_task_score' => $ngo->best_task_score,
                    'best_task_title' => $ngo->best_task_title,
                    'best_task_id' => $ngo->best_task_id,
                    'matching_opportunities_count' => $ngo->matching_opportunities_count,
                    'semantic_match_score' => $ngo->semantic_match_score ?? 0,
                    'distance_score' => $ngo->distance_score ?? 0,
                    'skill_overlap_score' => $ngo->skill_overlap_score ?? 0,
                    'availability_score' => $ngo->availability_score ?? 0,
                    'trust_score' => $ngo->trust_score ?? 0,
                ];
            }),
        ]);
    }

    public function strategies()
    {
        $strategies = collect(Ranker::getAvailableStrategies())->map(function ($label, $key) {
            return [
                'key' => $key,
                'label' => $label,
                'weights' => config("workflow.strategies.{$key}.weights", []),
            ];
        })->values();

        return response()->json([
            'data' => $strategies,
        ]);
    }
}
