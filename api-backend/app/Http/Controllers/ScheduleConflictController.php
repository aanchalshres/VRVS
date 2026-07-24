<?php

namespace App\Http\Controllers;

use App\Models\ScheduleConflict;
use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\ScheduleConflict\ConflictResolutionService;
use App\Services\ScheduleConflict\ScheduleConflictService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleConflictController extends Controller
{
    public function __construct(
        private ScheduleConflictService $conflictService,
        private ConflictResolutionService $resolutionService,
    ) {}

    public function checkTaskConflict(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'volunteer_profile_id' => 'required|exists:volunteer_profiles,id',
            'task_id' => 'required|exists:tasks,id',
        ]);

        $result = $this->conflictService->checkTask(
            $validated['volunteer_profile_id'],
            $validated['task_id']
        );

        return response()->json(['data' => $result]);
    }

    public function mySchedule(Request $request): JsonResponse
    {
        $profile = $request->user()->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $from = $request->input('from') ? new \DateTime($request->input('from')) : null;
        $to = $request->input('to') ? new \DateTime($request->input('to')) : null;

        $result = $this->conflictService->checkVolunteerSchedule($profile, $from, $to);

        return response()->json(['data' => $result]);
    }

    public function myCommitments(Request $request): JsonResponse
    {
        $profile = $request->user()->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $result = $this->conflictService->checkVolunteerSchedule($profile);

        return response()->json(['data' => [
            'commitments' => $result['schedule'],
            'total' => $result['total_commitments'],
        ]]);
    }

    public function checkBeforeApply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
        ]);

        $profile = $request->user()->volunteerProfile;
        if (!$profile) {
            return response()->json(['message' => 'Volunteer profile not found'], 404);
        }

        $result = $this->conflictService->checkTask($profile->id, $validated['task_id']);

        return response()->json([
            'data' => [
                'can_apply' => !$result['has_conflicts'],
                'has_conflicts' => $result['has_conflicts'],
                'conflict_count' => $result['conflict_count'],
                'conflicts' => $result['conflicts'],
                'message' => $result['has_conflicts']
                    ? 'This task conflicts with your existing commitments'
                    : 'No scheduling conflicts detected',
            ]
        ]);
    }

    public function ngoCheckConflict(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'volunteer_profile_id' => 'required|exists:volunteer_profiles,id',
            'task_id' => 'required|exists:tasks,id',
        ]);

        $ngo = $request->user()->ngoProfile;
        $task = Task::findOrFail($validated['task_id']);

        if ($task->ngo_id !== $ngo->id) {
            return response()->json(['message' => 'Task does not belong to your NGO'], 403);
        }

        $result = $this->conflictService->checkTask(
            $validated['volunteer_profile_id'],
            $validated['task_id']
        );

        return response()->json(['data' => $result]);
    }

    public function ngoVolunteerSchedule(Request $request, int $profileId): JsonResponse
    {
        $profile = VolunteerProfile::findOrFail($profileId);
        $result = $this->conflictService->checkVolunteerSchedule($profile);

        return response()->json(['data' => [
            'volunteer_id' => $profile->id,
            'commitments' => $result['schedule'],
            'total' => $result['total_commitments'],
        ]]);
    }

    public function adminAllConflicts(Request $request): JsonResponse
    {
        $query = ScheduleConflict::with([
            'volunteerProfile.user:id,name,email',
            'task:id,title,start_date,end_date',
            'conflictingTask:id,title,start_date,end_date',
        ])->orderBy('detected_at', 'desc');

        if ($request->filled('type')) {
            $query->where('conflict_type', $request->type);
        }

        if ($request->filled('resolved')) {
            if ($request->boolean('resolved')) {
                $query->whereNotNull('resolution');
            } else {
                $query->whereNull('resolution');
            }
        }

        $conflicts = $query->paginate($request->input('per_page', 20));

        return response()->json($conflicts);
    }

    public function adminResolveConflict(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'resolution' => 'required|in:warn_volunteer,warn_ngo,manual_override,suggest_alternative,reject',
            'notes' => 'nullable|string|max:500',
        ]);

        $result = $this->conflictService->resolve(
            $id,
            $validated['resolution'],
            $request->user()->id,
            $validated['notes'] ?? null,
        );

        return response()->json(['data' => $result]);
    }

    public function adminAnalytics(Request $request): JsonResponse
    {
        $data = $this->conflictService->getAnalytics();
        return response()->json(['data' => $data]);
    }

    public function adminValidateAssignment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'volunteer_profile_ids' => 'required|array',
            'volunteer_profile_ids.*' => 'exists:volunteer_profiles,id',
            'task_id' => 'required|exists:tasks,id',
        ]);

        $results = [];
        foreach ($validated['volunteer_profile_ids'] as $vpId) {
            $result = $this->conflictService->checkTask($vpId, $validated['task_id']);
            $profile = VolunteerProfile::find($vpId);
            $results[] = [
                'volunteer_profile_id' => $vpId,
                'volunteer_name' => $profile?->user?->name ?? 'Unknown',
                'has_conflicts' => $result['has_conflicts'],
                'conflict_count' => $result['conflict_count'],
                'conflicts' => $result['conflicts'],
            ];
        }

        return response()->json(['data' => [
            'task_id' => $validated['task_id'],
            'results' => $results,
            'total_checked' => count($results),
            'volunteers_with_conflicts' => count(array_filter($results, fn($r) => $r['has_conflicts'])),
        ]]);
    }
}
