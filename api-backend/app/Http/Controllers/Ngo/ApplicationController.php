<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $applications = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })
        ->with([
            'volunteer.user',
            'task'
        ])
        ->get();

        return response()->json([
            'data' => $applications
        ]);
    }


    public function accept(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $application = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })
        ->findOrFail($id);


        if ($application->status !== 'Pending') {
            return response()->json([
                'message' => 'Application already processed'
            ], 422);
        }


        $application->update([
            'status' => 'Accepted',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);


        return response()->json([
            'message' => 'Application accepted',
            'data' => $application->load(['volunteer.user', 'task'])
        ]);
    }


    public function reject(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $application = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })
        ->findOrFail($id);


        if ($application->status !== 'Pending') {
            return response()->json([
                'message' => 'Application already processed'
            ], 422);
        }


        $application->update([
            'status' => 'Rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);


        return response()->json([
            'message' => 'Application rejected',
            'data' => $application->load(['volunteer.user', 'task'])
        ]);
    }
}
