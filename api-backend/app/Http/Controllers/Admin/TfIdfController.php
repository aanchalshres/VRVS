<?php
namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Jobs\RecomputeTfIdfJob;
use Illuminate\Http\JsonResponse;

class TfIdfController extends Controller
{
    public function recompute(): JsonResponse
    {
        RecomputeTfIdfJob::dispatch();

        return response()->json(['message' => 'Recomputation queued']);
    }
    public function showVolunteer(int $id): JsonResponse
    {
        $profile = VolunteerProfile::findOrFail($id);
        return response()->json(['tfidf_vector' => $profile->tfidf_vector]);
    }

    public function showTask(int $id): JsonResponse
    {
        $task = Task::findOrFail($id);
        return response()->json(['tfidf_vector' => $task->tfidf_vector]);
    }



}
