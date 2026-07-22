<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with([
            'reviewer:id,name,email,role',
            'reviewee:id,name,email,role',
            'task:id,title,ngo_id',
            'task.ngo:id,organization_name',
        ]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->whereHas('reviewer', fn ($uq) => $uq->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('reviewee', fn ($uq) => $uq->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('task', fn ($tq) => $tq->where('title', 'like', "%{$s}%"));
            });
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('role')) {
            if ($request->role === 'ngo') {
                $query->whereHas('reviewer', fn ($q) => $q->where('role', 'ngo'));
            } elseif ($request->role === 'volunteer') {
                $query->whereHas('reviewer', fn ($q) => $q->where('role', 'volunteer'));
            }
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        $reviews->getCollection()->transform(function ($r) {
            return [
                'id' => $r->id,
                'reviewer' => $r->reviewer ? [
                    'id' => $r->reviewer->id,
                    'name' => $r->reviewer->name,
                    'email' => $r->reviewer->email,
                    'role' => $r->reviewer->role,
                ] : null,
                'reviewee' => $r->reviewee ? [
                    'id' => $r->reviewee->id,
                    'name' => $r->reviewee->name,
                    'email' => $r->reviewee->email,
                    'role' => $r->reviewee->role,
                ] : null,
                'task' => $r->task ? [
                    'id' => $r->task->id,
                    'title' => $r->task->title,
                    'ngo_name' => $r->task->ngo?->organization_name,
                ] : null,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at,
            ];
        });

        return response()->json([
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $review = Review::with([
            'reviewer:id,name,email,role',
            'reviewee:id,name,email,role',
            'task:id,title,description,ngo_id,status,created_at',
            'task.ngo:id,organization_name',
        ])->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $review->id,
                'reviewer' => $review->reviewer,
                'reviewee' => $review->reviewee,
                'task' => $review->task ? [
                    'id' => $review->task->id,
                    'title' => $review->task->title,
                    'description' => $review->task->description,
                    'status' => $review->task->status,
                    'ngo_name' => $review->task->ngo?->organization_name,
                ] : null,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at,
            ],
        ]);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json([
            'message' => 'Review removed successfully',
        ]);
    }

    public function stats()
    {
        return response()->json([
            'data' => [
                'total' => Review::count(),
                'average_rating' => round(Review::avg('rating') ?? 0, 2),
                'ratings_distribution' => [
                    1 => Review::where('rating', 1)->count(),
                    2 => Review::where('rating', 2)->count(),
                    3 => Review::where('rating', 3)->count(),
                    4 => Review::where('rating', 4)->count(),
                    5 => Review::where('rating', 5)->count(),
                ],
                'ngo_reviews' => Review::whereHas('reviewer', fn ($q) => $q->where('role', 'ngo'))->count(),
                'volunteer_reviews' => Review::whereHas('reviewer', fn ($q) => $q->where('role', 'volunteer'))->count(),
            ],
        ]);
    }
}
