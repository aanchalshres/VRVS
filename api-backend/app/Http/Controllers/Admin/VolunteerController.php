<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceLog;
use App\Models\User;
use App\Models\VolunteerProfile;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    public function index(Request $request)
    {
        $query = VolunteerProfile::with([
            'user:id,name,email,phone,is_active,created_at',
            'skills:id,name',
            'documents',
        ])->withCount('applications');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            })->orWhere('city', 'like', "%{$search}%")
              ->orWhere('primary_location', 'like', "%{$search}%");
        }

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        if ($request->filled('availability')) {
            $query->where('availability', $request->availability);
        }

        if ($request->filled('document_status')) {
            $status = $request->document_status;
            if ($status === 'verified') {
                $query->whereHas('documents', fn ($q) => $q->where('status', 'verified'));
            } elseif ($status === 'pending') {
                $query->whereHas('documents', fn ($q) => $q->where('status', 'pending'));
            } elseif ($status === 'none') {
                $query->whereDoesntHave('documents');
            }
        }

        $volunteers = $query->orderBy('created_at', 'desc')->paginate(
            $request->input('per_page', 20)
        );

        $volunteers->getCollection()->transform(function ($profile) {
            $docStatus = 'none';
            $docs = $profile->documents;
            if ($docs->isNotEmpty()) {
                if ($docs->where('status', 'verified')->isNotEmpty()) {
                    $docStatus = 'verified';
                } elseif ($docs->where('status', 'pending')->isNotEmpty()) {
                    $docStatus = 'pending';
                } else {
                    $docStatus = 'rejected';
                }
            }

            return [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'name' => $profile->user?->name,
                'email' => $profile->user?->email,
                'phone' => $profile->user?->phone,
                'is_active' => $profile->user?->is_active,
                'gender' => $profile->gender,
                'date_of_birth' => $profile->date_of_birth?->format('Y-m-d'),
                'bio' => $profile->bio,
                'city' => $profile->city,
                'country' => $profile->country,
                'primary_location' => $profile->primary_location,
                'availability' => $profile->availability,
                'trust_score' => $profile->trust_score,
                'total_service_hours' => round($profile->total_service_hours ?? 0, 2),
                'average_rating' => $profile->average_rating,
                'document_status' => $docStatus,
                'applications_count' => $profile->applications_count,
                'skills' => $profile->skills->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                ]),
                'joined_at' => $profile->user?->created_at,
            ];
        });

        return response()->json([
            'data' => $volunteers->items(),
            'meta' => [
                'current_page' => $volunteers->currentPage(),
                'last_page' => $volunteers->lastPage(),
                'per_page' => $volunteers->perPage(),
                'total' => $volunteers->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $profile = VolunteerProfile::with([
            'user',
            'skills:id,name',
            'documents',
            'applications.task:id,title,status',
            'serviceLogs.task:id,title',
        ])->findOrFail($id);

        $docStatus = 'none';
        $docs = $profile->documents;
        if ($docs->isNotEmpty()) {
            if ($docs->where('status', 'verified')->isNotEmpty()) {
                $docStatus = 'verified';
            } elseif ($docs->where('status', 'pending')->isNotEmpty()) {
                $docStatus = 'pending';
            } else {
                $docStatus = 'rejected';
            }
        }

        $serviceSummary = [
            'total_hours' => round($profile->serviceLogs->sum('hours'), 2),
            'completed_activities' => $profile->serviceLogs->where('participation_status', 'completed')->count(),
            'total_activities' => $profile->serviceLogs->count(),
        ];

        return response()->json([
            'data' => [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'user' => $profile->user ? [
                    'id' => $profile->user->id,
                    'name' => $profile->user->name,
                    'email' => $profile->user->email,
                    'phone' => $profile->user->phone,
                    'role' => $profile->user->role,
                    'is_active' => $profile->user->is_active,
                    'created_at' => $profile->user->created_at,
                ] : null,
                'gender' => $profile->gender,
                'date_of_birth' => $profile->date_of_birth?->format('Y-m-d'),
                'bio' => $profile->bio,
                'city' => $profile->city,
                'country' => $profile->country,
                'primary_location' => $profile->primary_location,
                'latitude' => $profile->latitude,
                'longitude' => $profile->longitude,
                'emergency_contact_name' => $profile->emergency_contact_name,
                'emergency_contact_phone' => $profile->emergency_contact_phone,
                'availability' => $profile->availability,
                'trust_score' => $profile->trust_score,
                'total_service_hours' => round($profile->total_service_hours ?? 0, 2),
                'average_rating' => $profile->average_rating,
                'profile_photo' => $profile->profile_photo,
                'document_status' => $docStatus,
                'skills' => $profile->skills->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                ]),
                'documents' => $profile->documents->map(fn ($d) => [
                    'id' => $d->id,
                    'document_type' => $d->document_type,
                    'original_name' => $d->original_name,
                    'file_path' => $d->file_path ? url('storage/' . $d->file_path) : null,
                    'mime_type' => $d->mime_type,
                    'status' => $d->status,
                    'remarks' => $d->remarks,
                    'created_at' => $d->created_at,
                ]),
                'applications' => $profile->applications->map(fn ($a) => [
                    'id' => $a->id,
                    'task_id' => $a->task_id,
                    'task_title' => $a->task?->title,
                    'task_status' => $a->task?->status,
                    'status' => $a->status,
                    'applied_at' => $a->applied_at,
                ]),
                'service_summary' => $serviceSummary,
                'joined_at' => $profile->created_at,
            ],
        ]);
    }

    public function stats()
    {
        $total = VolunteerProfile::count();
        $verified = VolunteerProfile::whereHas('documents', fn ($q) => $q->where('status', 'verified'))->count();
        $pending = VolunteerProfile::whereHas('documents', fn ($q) => $q->where('status', 'pending'))->count();
        $totalHours = ServiceLog::sum('hours');

        $cityDistribution = VolunteerProfile::select('city', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->whereNotNull('city')
            ->groupBy('city')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'total_volunteers' => $total,
                'document_verified' => $verified,
                'document_pending' => $pending,
                'total_service_hours' => round($totalHours, 2),
                'city_distribution' => $cityDistribution,
            ],
        ]);
    }
}
