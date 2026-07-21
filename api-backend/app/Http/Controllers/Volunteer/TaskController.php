<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Services\MatchingService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private MatchingService $matchingService
    ) {}

    public function getTasks(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        return response()->json([
            'data' => $this->matchingService
                ->rankTasksForVolunteer($user->volunteerProfile)
        ]);
    }

    public function getTaskDetail(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        return response()->json([
            'data' => $this->matchingService
                ->getTaskDetail($id)
        ]);
    }
}
