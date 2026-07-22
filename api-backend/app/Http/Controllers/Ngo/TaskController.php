<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        return response()->json([
            'data' => Task::where('ngo_id', $ngo->id)
                ->with(['skills', 'category'])
                ->withCount(['applications as total_applications', 'applications as pending_applications' => function ($q) {
                    $q->where('status', 'Pending');
                }, 'applications as accepted_applications' => function ($q) {
                    $q->where('status', 'Accepted');
                }])
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    public function show(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->with(['skills', 'category', 'ngo'])
            ->withCount(['applications as total_applications', 'applications as pending_applications' => function ($q) {
                $q->where('status', 'Pending');
            }, 'applications as accepted_applications' => function ($q) {
                $q->where('status', 'Accepted');
            }])
            ->findOrFail($id);

        return response()->json([
            'data' => $task
        ]);
    }

    public function store(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',

            'category_id' => 'required|exists:categories,id',
            'task_type' => 'required|string',
            'selection_logic' => 'sometimes|string',

            'location' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'required_volunteers' => 'required|integer|min:1',

            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'application_deadline' => 'nullable|date',

            'urgency_level' => 'sometimes|string',
            'status' => 'sometimes|string',

            'skill_ids' => 'sometimes|array',
            'skill_ids.*' => 'exists:skills,id',
            'skills' => 'sometimes|array',
            'skills.*' => 'exists:skills,id',
        ]);

        $validated['ngo_id'] = $ngo->id;
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(4);
        $validated['created_by'] = $request->user()->id;

        $validated = $this->normalizeTaskFields($validated);

        $task = Task::create($validated);

        $skillIds = $validated['skill_ids'] ?? $validated['skills'] ?? [];
        if (!empty($skillIds)) {
            $task->skills()->sync($skillIds);
        }

        $task->load(['skills', 'category']);
        $task->touch();

        return response()->json([
            'message' => 'Task created',
            'data' => $task
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',

            'category_id' => 'sometimes|exists:categories,id',
            'task_type' => 'sometimes|string',
            'selection_logic' => 'sometimes|string',

            'location' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'required_volunteers' => 'sometimes|integer|min:1',

            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'application_deadline' => 'nullable|date',

            'urgency_level' => 'sometimes|string',
            'status' => 'sometimes|string',

            'skill_ids' => 'sometimes|array',
            'skill_ids.*' => 'exists:skills,id',
            'skills' => 'sometimes|array',
            'skills.*' => 'exists:skills,id',
        ]);

        $validated = $this->normalizeTaskFields($validated);
        $validated['updated_by'] = $request->user()->id;

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . $task->id;
        }

        $task->update($validated);

        $skillIds = $validated['skill_ids'] ?? $validated['skills'] ?? null;
        if ($skillIds !== null) {
            $task->skills()->sync($skillIds);
        }

        $task->load(['skills', 'category']);
        $task->touch();

        return response()->json([
            'message' => 'Task updated',
            'data' => $task
        ]);
    }

    public function complete(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        if ($task->status === 'Completed') {
            return response()->json([
                'message' => 'Task is already completed'
            ], 422);
        }

        $task->update([
            'status' => 'Completed',
            'updated_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Task completed',
            'data' => $task
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->findOrFail($id);

        $task->delete();

        return response()->json([
            'message' => 'Task deleted'
        ]);
    }

    private function normalizeTaskFields(array $data): array
    {
        $statusMap = [
            'draft' => 'Draft', 'open' => 'Open', 'ongoing' => 'Ongoing',
            'completed' => 'Completed', 'cancelled' => 'Cancelled',
        ];
        $urgencyMap = [
            'low' => 'Low', 'medium' => 'Medium', 'high' => 'High',
        ];
        $taskTypeMap = [
            'one_time' => 'Event', 'ongoing' => 'Ongoing', 'flexible' => 'Task',
            'event' => 'Event', 'emergency' => 'Emergency', 'campaign' => 'Campaign', 'task' => 'Task',
        ];

        if (isset($data['status']) && isset($statusMap[strtolower($data['status'])])) {
            $data['status'] = $statusMap[strtolower($data['status'])];
        }
        if (!isset($data['status'])) {
            $data['status'] = 'Open';
        }

        if (isset($data['urgency_level']) && isset($urgencyMap[strtolower($data['urgency_level'])])) {
            $data['urgency_level'] = $urgencyMap[strtolower($data['urgency_level'])];
        }

        if (isset($data['task_type']) && isset($taskTypeMap[strtolower($data['task_type'])])) {
            $data['task_type'] = $taskTypeMap[strtolower($data['task_type'])];
        }

        return $data;
    }
}
