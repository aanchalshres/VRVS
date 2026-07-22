<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = Application::with([
            'task:id,title,ngo_id,status,created_at',
            'task.ngo:id,organization_name,user_id',
            'volunteer.user:id,name,email,phone',
            'reviewer:id,name',
        ]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->whereHas('volunteer.user', fn ($uq) => $uq->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%"))
                  ->orWhereHas('task', fn ($tq) => $tq->where('title', 'like', "%{$s}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        $apps = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        $apps->getCollection()->transform(function ($a) {
            return [
                'id' => $a->id,
                'task_id' => $a->task_id,
                'task_title' => $a->task?->title,
                'task_status' => $a->task?->status,
                'ngo_name' => $a->task?->ngo?->organization_name,
                'volunteer_profile_id' => $a->volunteer_profile_id,
                'volunteer_name' => $a->volunteer?->user?->name,
                'volunteer_email' => $a->volunteer?->user?->email,
                'volunteer_phone' => $a->volunteer?->user?->phone,
                'status' => $a->status,
                'recommendation_score' => $a->recommendation_score,
                'applied_at' => $a->applied_at,
                'reviewed_by' => $a->reviewer?->name,
                'reviewed_at' => $a->reviewed_at,
                'remarks' => $a->remarks,
                'created_at' => $a->created_at,
            ];
        });

        return response()->json([
            'data' => $apps->items(),
            'meta' => [
                'current_page' => $apps->currentPage(),
                'last_page' => $apps->lastPage(),
                'per_page' => $apps->perPage(),
                'total' => $apps->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $app = Application::with([
            'task:id,title,description,ngo_id,status,required_volunteers,start_date,end_date,created_at',
            'task.ngo:id,organization_name,user_id',
            'task.ngo.user:id,name,email',
            'volunteer.user:id,name,email,phone',
            'volunteer.skills:id,name',
            'reviewer:id,name',
        ])->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $app->id,
                'task_id' => $app->task_id,
                'task' => $app->task ? [
                    'id' => $app->task->id,
                    'title' => $app->task->title,
                    'description' => $app->task->description,
                    'status' => $app->task->status,
                    'required_volunteers' => $app->task->required_volunteers,
                    'start_date' => $app->task->start_date,
                    'end_date' => $app->task->end_date,
                    'ngo' => $app->task->ngo ? [
                        'id' => $app->task->ngo->id,
                        'organization_name' => $app->task->ngo->organization_name,
                        'contact_email' => $app->task->ngo->user?->email,
                    ] : null,
                ] : null,
                'volunteer_profile_id' => $app->volunteer_profile_id,
                'volunteer' => $app->volunteer ? [
                    'id' => $app->volunteer->id,
                    'name' => $app->volunteer->user?->name,
                    'email' => $app->volunteer->user?->email,
                    'phone' => $app->volunteer->user?->phone,
                    'skills' => $app->volunteer->skills->map(fn ($s) => ['id' => $s->id, 'name' => $s->name]),
                ] : null,
                'status' => $app->status,
                'recommendation_score' => $app->recommendation_score,
                'applied_at' => $app->applied_at,
                'reviewed_by' => $app->reviewer?->name,
                'reviewed_at' => $app->reviewed_at,
                'remarks' => $app->remarks,
                'created_at' => $app->created_at,
            ],
        ]);
    }

    public function stats()
    {
        return response()->json([
            'data' => [
                'total' => Application::count(),
                'pending' => Application::where('status', 'Pending')->count(),
                'accepted' => Application::where('status', 'Accepted')->count(),
                'rejected' => Application::where('status', 'Rejected')->count(),
                'cancelled' => Application::where('status', 'Cancelled')->count(),
            ],
        ]);
    }
}
