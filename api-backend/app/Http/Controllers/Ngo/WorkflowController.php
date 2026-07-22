<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\WorkflowService;
use App\Services\Ranking\Ranker;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    public function __construct(
        private WorkflowService $workflowService,
        private Ranker $ranker
    ) {}

    public function shortlist(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $shortlist = $this->workflowService->getShortlist($task);

        return response()->json([
            'data' => $shortlist->map(function ($v) {
                return [
                    'id' => $v->id,
                    'user_id' => $v->user_id,
                    'name' => $v->user->name ?? 'Unknown',
                    'email' => $v->user->email ?? '',
                    'phone' => $v->user->phone ?? '',
                    'bio' => $v->bio ?? '',
                    'city' => $v->city ?? '',
                    'country' => $v->country ?? '',
                    'skills' => $v->skills->map(fn ($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'proficiency_level' => $s->pivot->proficiency_level ?? null,
                    ]),
                    'shortlist_rank' => $v->shortlist_rank,
                    'recommendation_score' => $v->recommendation_score,
                    'strategy_used' => $v->strategy_used ?? 'recommendation',
                ];
            }),
        ]);
    }

    public function generateShortlist(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:50',
            'strategy' => 'nullable|string|in:' . implode(',', array_keys(Ranker::getAvailableStrategies())),
        ]);

        $limit = $validated['limit'] ?? null;
        $strategy = $validated['strategy'] ?? null;

        $shortlist = $this->workflowService->generateShortlist($task, $limit, $strategy);

        return response()->json([
            'message' => 'Shortlist generated',
            'strategy_used' => $strategy ?? config('workflow.default_strategy', 'recommendation'),
            'data' => $shortlist->map(function ($v) {
                return [
                    'id' => $v->id,
                    'user_id' => $v->user_id,
                    'name' => $v->user->name ?? 'Unknown',
                    'email' => $v->user->email ?? '',
                    'phone' => $v->user->phone ?? '',
                    'bio' => $v->bio ?? '',
                    'city' => $v->city ?? '',
                    'country' => $v->country ?? '',
                    'skills' => $v->skills->map(fn ($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'proficiency_level' => $s->pivot->proficiency_level ?? null,
                    ]),
                    'shortlist_rank' => $v->shortlist_rank,
                    'recommendation_score' => $v->recommendation_score,
                    'strategy_score' => $v->strategy_score,
                    'strategy_used' => $v->strategy_used,
                ];
            }),
        ]);
    }

    public function prioritizedApplications(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'strategy' => 'nullable|string|in:' . implode(',', array_keys(Ranker::getAvailableStrategies())),
        ]);

        $strategy = $validated['strategy'] ?? null;

        $applications = $this->workflowService->getPrioritizedApplications($task, $strategy);

        return response()->json([
            'strategy_used' => $strategy ?? config('workflow.default_strategy', 'recommendation'),
            'data' => $applications->map(function ($app) {
                return [
                    'id' => $app->id,
                    'task_id' => $app->task_id,
                    'volunteer_profile_id' => $app->volunteer_profile_id,
                    'volunteer_name' => $app->volunteer->user->name ?? 'Unknown',
                    'volunteer_email' => $app->volunteer->user->email ?? '',
                    'status' => $app->status,
                    'applied_at' => $app->applied_at,
                    'remarks' => $app->remarks,
                    'priority_score' => $app->priority_score,
                    'recommendation_score' => $app->recommendation_score,
                    'semantic_match_score' => $app->semantic_match_score ?? 0,
                    'distance_score' => $app->distance_score ?? 0,
                    'skill_overlap_score' => $app->skill_overlap_score ?? 0,
                    'availability_score' => $app->availability_score ?? 0,
                    'trust_score' => $app->trust_score ?? 0,
                ];
            }),
        ]);
    }

    public function strategies()
    {
        return response()->json([
            'data' => collect(Ranker::getAvailableStrategies())->map(function ($label, $key) {
                return [
                    'key' => $key,
                    'label' => $label,
                    'weights' => config("workflow.strategies.{$key}.weights", []),
                ];
            })->values(),
        ]);
    }
}
