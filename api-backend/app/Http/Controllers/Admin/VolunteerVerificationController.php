<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\User;
use App\Models\VerificationSession;
use App\Models\VolunteerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VolunteerVerificationController extends Controller
{
    public function index(Request $request)
    {
        $query = VolunteerProfile::with([
            'user:id,name,email,phone',
            'documents' => fn ($q) => $q->where('status', 'pending'),
        ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        $profiles = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        $profiles->getCollection()->transform(function ($profile) {
            $pendingDocs = $profile->documents->where('status', 'pending');
            return [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'name' => $profile->user?->name,
                'email' => $profile->user?->email,
                'phone' => $profile->user?->phone,
                'city' => $profile->city,
                'primary_location' => $profile->primary_location,
                'profile_photo' => $profile->profile_photo,
                'pending_documents_count' => $pendingDocs->count(),
                'total_documents' => $profile->documents->count(),
                'trust_score' => $profile->trust_score,
                'joined_at' => $profile->created_at,
            ];
        });

        return response()->json([
            'data' => $profiles->items(),
            'meta' => [
                'current_page' => $profiles->currentPage(),
                'last_page' => $profiles->lastPage(),
                'per_page' => $profiles->perPage(),
                'total' => $profiles->total(),
            ],
        ]);
    }

    public function pending()
    {
        $profiles = VolunteerProfile::whereHas('documents', fn ($q) => $q->where('status', 'pending'))
            ->with(['user:id,name,email,phone', 'documents' => fn ($q) => $q->where('status', 'pending')])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $profiles->map(fn ($p) => [
                'id' => $p->id,
                'user_id' => $p->user_id,
                'name' => $p->user?->name,
                'email' => $p->user?->email,
                'pending_documents' => $p->documents->map(fn ($d) => [
                    'id' => $d->id,
                    'document_type' => $d->document_type,
                    'original_name' => $d->original_name,
                    'file_path' => $d->file_path ? url('storage/' . $d->file_path) : null,
                    'created_at' => $d->created_at,
                ]),
                'joined_at' => $p->created_at,
            ]),
            'total' => $profiles->count(),
        ]);
    }

    public function reviewDocument(Request $request, $documentId)
    {
        $validated = $request->validate([
            'status' => 'required|in:verified,rejected',
            'remarks' => 'nullable|string|max:2000',
        ]);

        $document = Document::findOrFail($documentId);

        $document->update([
            'status' => $validated['status'],
            'remarks' => $validated['remarks'] ?? null,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Document ' . $validated['status'] . ' successfully',
            'data' => $document->fresh(),
        ]);
    }

    public function approveVolunteer($id)
    {
        $profile = VolunteerProfile::findOrFail($id);

        $profile->documents()->where('status', 'pending')->update([
            'status' => 'verified',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Volunteer approved successfully',
            'data' => $profile->fresh()->load('user', 'documents'),
        ]);
    }

    public function rejectVolunteer(Request $request, $id)
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string|max:2000',
        ]);

        $profile = VolunteerProfile::findOrFail($id);

        $profile->documents()->where('status', 'pending')->update([
            'status' => 'rejected',
            'remarks' => $validated['remarks'] ?? null,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Volunteer rejected',
            'data' => $profile->fresh()->load('user', 'documents'),
        ]);
    }

    public function verificationHistory($id)
    {
        $profile = VolunteerProfile::findOrFail($id);

        $history = $profile->documents()
            ->whereIn('status', ['verified', 'rejected'])
            ->with('reviewer:id,name')
            ->orderBy('reviewed_at', 'desc')
            ->get()
            ->map(fn ($d) => [
                'document_id' => $d->id,
                'document_type' => $d->document_type,
                'status' => $d->status,
                'remarks' => $d->remarks,
                'reviewed_by' => $d->reviewer?->name,
                'reviewed_at' => $d->reviewed_at,
            ]);

        return response()->json([
            'data' => $history,
        ]);
    }
}
