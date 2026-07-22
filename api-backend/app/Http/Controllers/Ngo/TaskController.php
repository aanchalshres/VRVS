<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Skill;
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
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    public function show(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $task = Task::where('ngo_id', $ngo->id)
            ->with(['skills', 'category', 'applications.volunteer.user'])
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
            'task_type' => 'required|string|in:Event,Emergency,Campaign,Task',
            'selection_logic' => 'sometimes|string|in:FCFS,Weighted',

            'location' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'required_volunteers' => 'required|integer|min:1',

            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'application_deadline' => 'nullable|date',

            'urgency_level' => 'sometimes|string|in:Low,Medium,High',
            'status' => 'sometimes|string|in:Draft,Open,Ongoing,Completed,Cancelled',

            'skill_ids' => 'sometimes|array',
            'skill_ids.*' => 'exists:skills,id',
        ]);

        $validated['ngo_id'] = $ngo->id;
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(4);
        $validated['created_by'] = $request->user()->id;

        if (!isset($validated['status'])) {
            $validated['status'] = 'Open';
        }

        $task = Task::create($validated);

        if (!empty($validated['skill_ids'])) {
            $task->skills()->sync($validated['skill_ids']);
        }

        $task->load(['skills', 'category']);

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
            'task_type' => 'sometimes|string|in:Event,Emergency,Campaign,Task',
            'selection_logic' => 'sometimes|string|in:FCFS,Weighted',

            'location' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'required_volunteers' => 'sometimes|integer|min:1',

            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'application_deadline' => 'nullable|date',

            'urgency_level' => 'sometimes|string|in:Low,Medium,High',
            'status' => 'sometimes|string|in:Draft,Open,Ongoing,Completed,Cancelled',

            'skill_ids' => 'sometimes|array',
            'skill_ids.*' => 'exists:skills,id',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . $task->id;
        }

        $validated['updated_by'] = $request->user()->id;

        $task->update($validated);

        if (isset($validated['skill_ids'])) {
            $task->skills()->sync($validated['skill_ids']);
        }

        $task->load(['skills', 'category']);

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
}
