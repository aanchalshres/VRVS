<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $query = Certificate::with([
            'ngo:id,organization_name',
            'volunteer.user:id,name,email',
            'task:id,title',
        ]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('certificate_number', 'like', "%{$s}%")
                  ->orWhereHas('volunteer.user', fn ($uq) => $uq->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('task', fn ($tq) => $tq->where('title', 'like', "%{$s}%"))
                  ->orWhereHas('ngo', fn ($nq) => $nq->where('organization_name', 'like', "%{$s}%"));
            });
        }

        $certs = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        $certs->getCollection()->transform(function ($c) {
            $content = $c->content ?? [];
            return [
                'id' => $c->id,
                'certificate_number' => $c->certificate_number,
                'ngo_name' => $c->ngo?->organization_name,
                'volunteer_name' => $content['volunteer_name'] ?? $c->volunteer?->user?->name ?? 'Unknown',
                'volunteer_email' => $c->volunteer?->user?->email,
                'task_title' => $content['task_title'] ?? $c->task?->title ?? 'Unknown',
                'hours_contributed' => (float) ($content['hours_contributed'] ?? 0),
                'issued_at' => $c->issued_at,
                'created_at' => $c->created_at,
            ];
        });

        return response()->json([
            'data' => $certs->items(),
            'meta' => [
                'current_page' => $certs->currentPage(),
                'last_page' => $certs->lastPage(),
                'per_page' => $certs->perPage(),
                'total' => $certs->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $cert = Certificate::with([
            'ngo:id,organization_name,user_id',
            'ngo.user:id,name,email',
            'volunteer.user:id,name,email,phone',
            'task:id,title,description,status',
        ])->findOrFail($id);

        $content = $cert->content ?? [];

        return response()->json([
            'data' => [
                'id' => $cert->id,
                'certificate_number' => $cert->certificate_number,
                'ngo' => $cert->ngo ? [
                    'id' => $cert->ngo->id,
                    'organization_name' => $cert->ngo->organization_name,
                    'email' => $cert->ngo->user?->email,
                ] : null,
                'volunteer' => $cert->volunteer ? [
                    'id' => $cert->volunteer->id,
                    'name' => $cert->volunteer->user?->name,
                    'email' => $cert->volunteer->user?->email,
                ] : null,
                'task' => $cert->task ? [
                    'id' => $cert->task->id,
                    'title' => $cert->task->title,
                    'description' => $cert->task->description,
                    'status' => $cert->task->status,
                ] : null,
                'content' => $content,
                'hours_contributed' => (float) ($content['hours_contributed'] ?? 0),
                'issued_at' => $cert->issued_at,
                'created_at' => $cert->created_at,
            ],
        ]);
    }

    public function stats()
    {
        return response()->json([
            'data' => [
                'total' => Certificate::count(),
                'total_hours' => Certificate::with('content')->get()->sum(fn ($c) => (float) (($c->content ?? [])['hours_contributed'] ?? 0)),
            ],
        ]);
    }
}
