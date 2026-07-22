<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $profile = $user->volunteerProfile;

        $certificates = Certificate::where('volunteer_profile_id', $profile->id)
            ->with(['ngo', 'task'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $certificates]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $profile = $user->volunteerProfile;

        $certificate = Certificate::where('id', $id)
            ->where('volunteer_profile_id', $profile->id)
            ->with(['ngo', 'task'])
            ->firstOrFail();

        return response()->json(['data' => $certificate]);
    }

    public function download(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Only volunteers can access this'], 403);
        }

        $profile = $user->volunteerProfile;

        $certificate = Certificate::where('id', $id)
            ->where('volunteer_profile_id', $profile->id)
            ->with(['ngo', 'task'])
            ->firstOrFail();

        $content = $certificate->content;
        $ngo = $certificate->ngo;

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
