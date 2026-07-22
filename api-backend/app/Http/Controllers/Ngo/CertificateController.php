<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Application;
use App\Models\ServiceLog;
use App\Models\Task;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $certificates = Certificate::where('ngo_id', $ngo->id)
            ->with(['volunteer.user', 'task'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($cert) => [
                'id' => $cert->id,
                'certificate_number' => $cert->certificate_number,
                'volunteer_name' => $cert->content['volunteer_name'] ?? ($cert->volunteer?->user?->name ?? 'Volunteer'),
                'task_title' => $cert->content['task_title'] ?? ($cert->task->title ?? ''),
                'hours_contributed' => (float) ($cert->content['hours_contributed'] ?? 0),
                'issued_at' => $cert->issued_at,
                'created_at' => $cert->created_at,
            ]);

        return response()->json(['data' => $certificates]);
    }

    public function eligibleApplications(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $applications = Application::whereHas('task', function ($q) use ($ngo) {
            $q->where('ngo_id', $ngo->id);
        })
            ->where('status', 'Accepted')
            ->whereDoesntHave('certificate')
            ->with(['volunteer.user', 'task'])
            ->get()
            ->map(function ($app) {
                $hours = ServiceLog::where('task_id', $app->task_id)
                    ->where('volunteer_profile_id', $app->volunteer_profile_id)
                    ->where('participation_status', 'completed')
                    ->value('hours') ?? 0;

                return [
                    'id' => $app->id,
                    'volunteer_profile_id' => $app->volunteer_profile_id,
                    'volunteer_name' => $app->volunteer->user->name ?? 'Volunteer',
                    'task_id' => $app->task_id,
                    'task' => $app->task,
                    'total_hours' => $hours,
                ];
            });

        return response()->json(['data' => $applications]);
    }

    public function generate(Request $request)
    {
        $ngo = $request->user()->ngoProfile;

        $rules = $request->has('application_id')
            ? ['application_id' => 'required|exists:applications,id']
            : [
                'volunteer_profile_id' => 'required|exists:volunteer_profiles,id',
                'task_id' => 'required|exists:tasks,id',
            ];

        $validated = $request->validate($rules);

        if ($request->has('application_id')) {
            $application = Application::whereHas('task', function ($q) use ($ngo) {
                $q->where('ngo_id', $ngo->id);
            })->findOrFail($validated['application_id']);

            $validated['volunteer_profile_id'] = $application->volunteer_profile_id;
            $validated['task_id'] = $application->task_id;
        }

        $task = Task::where('ngo_id', $ngo->id)->findOrFail($validated['task_id']);

        $application = Application::where('task_id', $validated['task_id'])
            ->where('volunteer_profile_id', $validated['volunteer_profile_id'])
            ->where('status', 'Accepted')
            ->first();

        if (!$application) {
            return response()->json([
                'message' => 'Volunteer must have been accepted for this task'
            ], 422);
        }

        $existing = Certificate::where('ngo_id', $ngo->id)
            ->where('volunteer_profile_id', $validated['volunteer_profile_id'])
            ->where('task_id', $validated['task_id'])
            ->first();

        if ($existing) {
            $existing->load(['volunteer.user', 'task']);

            return response()->json([
                'message' => 'Certificate already issued',
                'data' => [
                    'id' => $existing->id,
                    'certificate_number' => $existing->certificate_number,
                    'volunteer_name' => $existing->content['volunteer_name'] ?? ($existing->volunteer?->user?->name ?? 'Volunteer'),
                    'task_title' => $existing->content['task_title'] ?? ($existing->task->title ?? ''),
                    'hours_contributed' => (float) ($existing->content['hours_contributed'] ?? 0),
                    'issued_at' => $existing->issued_at,
                    'created_at' => $existing->created_at,
                ],
            ]);
        }

        $volunteer = $application->volunteer;
        $certNumber = 'CERT-' . strtoupper(substr(md5(uniqid()), 0, 10));

        $serviceLog = ServiceLog::where('task_id', $validated['task_id'])
            ->where('volunteer_profile_id', $validated['volunteer_profile_id'])
            ->where('participation_status', 'completed')
            ->first();

        $hours = $serviceLog?->hours ?? 0;

        $certificate = Certificate::create([
            'ngo_id' => $ngo->id,
            'volunteer_profile_id' => $validated['volunteer_profile_id'],
            'task_id' => $validated['task_id'],
            'certificate_number' => $certNumber,
            'issued_at' => now(),
            'content' => [
                'volunteer_name' => $volunteer->user->name ?? 'Volunteer',
                'organization_name' => $ngo->organization_name,
                'task_title' => $task->title,
                'task_description' => $task->description,
                'hours_contributed' => $hours,
                'issued_date' => now()->format('Y-m-d'),
            ],
        ]);

        $certificate->load(['volunteer.user', 'task']);

        return response()->json([
            'message' => 'Certificate issued',
            'data' => [
                'id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
                'volunteer_name' => $certificate->content['volunteer_name'] ?? ($certificate->volunteer?->user?->name ?? 'Volunteer'),
                'task_title' => $certificate->content['task_title'] ?? ($certificate->task->title ?? ''),
                'hours_contributed' => (float) ($certificate->content['hours_contributed'] ?? 0),
                'issued_at' => $certificate->issued_at,
                'created_at' => $certificate->created_at,
            ],
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $certificate = Certificate::where('ngo_id', $ngo->id)
            ->with(['volunteer.user', 'task.ngo'])
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
                'volunteer_name' => $certificate->content['volunteer_name'] ?? ($certificate->volunteer?->user?->name ?? 'Volunteer'),
                'task_title' => $certificate->content['task_title'] ?? ($certificate->task->title ?? ''),
                'hours_contributed' => (float) ($certificate->content['hours_contributed'] ?? 0),
                'issued_at' => $certificate->issued_at,
                'created_at' => $certificate->created_at,
            ],
        ]);
    }

    public function download(Request $request, $id)
    {
        $ngo = $request->user()->ngoProfile;

        $certificate = Certificate::where('ngo_id', $ngo->id)
            ->with(['volunteer.user', 'task.ngo'])
            ->findOrFail($id);

        $content = $certificate->content;

        $html = view('certificates.ngo', [
            'certificate' => $certificate,
            'content' => $content,
            'ngo' => $ngo,
        ])->render();

        return response()->json([
            'data' => [
                'html' => $html,
                'certificate_number' => $certificate->certificate_number,
                'volunteer_name' => $content['volunteer_name'] ?? 'Volunteer',
            ]
        ]);
    }
}
