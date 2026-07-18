<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\NgoProfile;
use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\HungarianMatcher;
use App\Services\TfIdfService;
use App\Services\VerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    private VerificationService $verificationService;
    public function __construct(VerificationService $verificationService)
    {
        $this->verificationService = $verificationService;
    }
    public function getNgoVerification()
    {
        $ngos = NgoProfile::where('verification_status', 'pending')
            ->with('user')
            ->get();

        return response()->json([
            'data'  => $ngos,
            'total' => $ngos->count(),
        ]);
    }

    public function verifyNgo($id)
    {
        $ngoProfile = NgoProfile::findOrFail($id);
        $this->verificationService->verifyNgo($ngoProfile);

        return response()->json([
            'message' => 'NGO verified successfully',
            'data'    => $ngoProfile,
        ]);
    }

    public function rejectNgo($id)
    {
        $ngoProfile = NgoProfile::findOrFail($id);
        $this->verificationService->rejectNgo($ngoProfile);

        return response()->json([
            'message' => 'NGO rejected',
            'data'    => $ngoProfile,
        ]);
    }

    public function getTaskModeration()
    {
        $tasks = Task::with(['ngoProfile', 'applications'])->get();

        return response()->json([
            'data'  => $tasks,
            'total' => $tasks->count(),
        ]);
    }

    public function deleteTask($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function getSystemStats()
    {
        $stats = [
            'total_users'         => DB::table('users')->count(),
            'total_volunteers'    => DB::table('users')->where('role', 'volunteer')->count(),
            'total_ngos'          => DB::table('users')->where('role', 'ngo')->count(),
            'verified_ngos'       => DB::table('ngo_profiles')->where('verification_status', 'verified')->count(),
            'pending_ngos'        => DB::table('ngo_profiles')->where('verification_status', 'pending')->count(),
            'total_tasks'         => DB::table('tasks')->count(),
            'active_tasks'        => DB::table('tasks')->where('status', 'active')->count(),
            'total_applications'  => DB::table('applications')->count(),
        ];

        return response()->json(['data' => $stats]);
    }

    public function ngos()
    {
        $ngos = NgoProfile::with('user')->latest()->get()->map(fn($ngo) => [
            'id'                  => $ngo->id,
            'organization_name'   => $ngo->organization_name,
            'registration_number' => $ngo->registration_number,
            'pan_number'          => $ngo->pan_number,
            'office_location'     => $ngo->office_location,
            'verification_status' => $ngo->verification_status,
            'created_at'          => $ngo->created_at,
            'user'                => [
                'id'    => $ngo->user?->id,
                'name'  => $ngo->user?->name,
                'email' => $ngo->user?->email,
                'phone' => $ngo->user?->phone,
            ],
        ]);

        return response()->json($ngos);
    }

    public function ngoDetails($id)
    {
        $ngo = NgoProfile::with('user')->findOrFail($id);

        return response()->json([
            'id'                    => $ngo->id,
            'organization_name'     => $ngo->organization_name,
            'registration_number'   => $ngo->registration_number,
            'pan_number'            => $ngo->pan_number,
            'office_location'       => $ngo->office_location,
            'verification_status'   => $ngo->verification_status,
            'created_at'            => $ngo->created_at,
            'registration_file_path'=> $ngo->registration_file_path ? url('storage/' . $ngo->registration_file_path) : null,
            'pan_file_path'         => $ngo->pan_file_path          ? url('storage/' . $ngo->pan_file_path)          : null,
            'letterhead_file_path'  => $ngo->letterhead_file_path   ? url('storage/' . $ngo->letterhead_file_path)   : null,
            'user'                  => [
                'id'    => $ngo->user?->id,
                'name'  => $ngo->user?->name,
                'email' => $ngo->user?->email,
                'phone' => $ngo->user?->phone,
            ],
        ]);
    }

    public function batchAssign(Request $request)
    {
        $validated = $request->validate([
            'application_ids' => 'required|array',
            'task_ids'        => 'required|array',
        ]);

        $applications = Application::whereIn('id', $validated['application_ids'])
            ->with('volunteer')
            ->get();

        $tasks = Task::whereIn('id', $validated['task_ids'])
            ->whereNotNull('tfidf_vector')
            ->get();

        $volunteers = $applications->map(fn($a) => $a->volunteer)->filter()->values();

        if ($volunteers->isEmpty() || $tasks->isEmpty()) {
            return response()->json(['message' => 'No valid volunteers or tasks'], 422);
        }

        $tfidf   = app(TfIdfService::class);
        $matcher = app(HungarianMatcher::class);

        $alpha = 0.5;
        $beta  = 0.3;
        $gamma = 0.2;

        $costMatrix = $matcher->buildCostMatrix(
            $volunteers->all(),
            $tasks->all(),
            function ($volunteer, $task) use ($tfidf, $alpha, $beta, $gamma) {
                $skillScore = $tfidf->cosineSimilarity(
                    $volunteer->tfidf_vector ?? [],
                    $task->tfidf_vector ?? []
                );

                $distScore = 0;
                if ($volunteer->latitude && $volunteer->longitude && $task->latitude && $task->longitude) {
                    $km        = $tfidf->haversine($volunteer->latitude, $volunteer->longitude, $task->latitude, $task->longitude);
                    $distScore = max(0, 1 - ($km / 500));
                }

                $trustScore = $volunteer->trust_score ?? 0.5;

                return ($alpha * $skillScore) + ($beta * $distScore) + ($gamma * $trustScore);
            }
        );

        // Pad to square matrix — Hungarian requires N×N
        $size = max($volunteers->count(), $tasks->count());
        for ($i = 0; $i < $size; $i++) {
            for ($j = 0; $j < $size; $j++) {
                $costMatrix[$i][$j] = $costMatrix[$i][$j] ?? 1;
            }
        }

        $assignments = $matcher->solve($costMatrix);

        $result = [];
        foreach ($assignments as $volunteerIdx => $taskIdx) {
            $volunteer = $volunteers[$volunteerIdx] ?? null;
            $task      = $tasks[$taskIdx] ?? null;

            if ($volunteer && $task) {
                $result[] = [
                    'volunteer_id'   => $volunteer->id,
                    'volunteer_name' => $volunteer->user->name ?? null,
                    'task_id'        => $task->id,
                    'task_title'     => $task->title,
                    'score'          => round(1 - $costMatrix[$volunteerIdx][$taskIdx], 3),
                ];
            }
        }

        return response()->json([
            'message'     => 'Optimal assignments computed',
            'assignments' => $result,
        ]);
    }
}
