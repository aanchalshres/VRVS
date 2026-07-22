<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Services\ApplicationService;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(
        private ApplicationService $applicationService
    ) {}

    public function applyForTask(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can apply for tasks'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Volunteer profile not found.'
            ], 404);
        }

        try {
            $application = $this->applicationService->apply(
                (int) $id,
                $profile,
                $request->message
            );

            return response()->json([
                'message' => 'Application submitted successfully',
                'data' => $application,
            ], 201);
        } catch (\Exception $e) {
            $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 400;

            return response()->json([
                'message' => $e->getMessage()
            ], $statusCode);
        }
    }

    public function getApplications(Request $request)
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
                'message' => 'Volunteer profile not found.'
            ], 404);
        }

        return response()->json([
            'data' => $this->applicationService->getApplications($profile)
        ]);
    }

    public function getAssignedTasks(Request $request)
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
                'message' => 'Volunteer profile not found.'
            ], 404);
        }

        return response()->json([
            'data' => $this->applicationService->getAssignedTasks($profile)
        ]);
    }

    public function withdraw(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can withdraw applications'
            ], 403);
        }

        $profile = $user->volunteerProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Volunteer profile not found.'
            ], 404);
        }

        try {
            $application = $this->applicationService->withdraw(
                (int) $id,
                $profile
            );

            return response()->json([
                'success' => true,
                'message' => 'Application withdrawn successfully',
                'data' => $application,
            ]);
        } catch (\Exception $e) {
            $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 400;

            return response()->json([
                'message' => $e->getMessage()
            ], $statusCode);
        }
    }
}
