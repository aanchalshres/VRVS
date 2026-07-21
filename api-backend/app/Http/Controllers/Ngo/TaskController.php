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
                ->get()
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

            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'required_volunteers' => 'required|integer|min:1',
        ]);


        $task = Task::create([
            'ngo_id' => $ngo->id,

            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']),

            'description' => $validated['description'],

            'category_id' => $validated['category_id'],
            'task_type' => $validated['task_type'],

            'location' => $validated['location'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,

            'required_volunteers' => $validated['required_volunteers'],

            'status' => 'active',

            'tfidf_vector' => null,
        ]);


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

            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'required_volunteers' => 'sometimes|integer|min:1',
        ]);


        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }


        $task->update($validated);


        return response()->json([
            'message' => 'Task updated',
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
