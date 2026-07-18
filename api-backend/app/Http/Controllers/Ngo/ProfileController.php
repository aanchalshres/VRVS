<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NgoProfile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get all NGO profiles with optional status filter
     * GET /api/ngo-profiles?status=pending
     */
    public function index(Request $request)
    {
        $query = NgoProfile::with('user');

        // Filter by status if provided
        if ($request->has('status')) {
            $status = $request->query('status');
            if ($status === 'pending') {
                $query->where('is_verified', false);
            } elseif ($status === 'verified') {
                $query->where('is_verified', true);
            }
        }

        $ngos = $query->get();

        return response()->json([
            'data' => $ngos,
            'total' => $ngos->count(),
        ]);
    }

    /**
     * Get a single NGO profile by ID
     * GET /api/ngo-profiles/{id}
     */
    public function show($id)
    {
        $ngo = NgoProfile::with('user')->findOrFail($id);

        return response()->json([
            'data' => $ngo,
        ]);
    }

    /**
     * Approve an NGO profile
     * POST /api/ngo-profiles/{id}/approve
     */
    public function approve($id)
    {
        $ngo = NgoProfile::findOrFail($id);
        $ngo->update(['is_verified' => true, 'status' => 'verified']);

        return response()->json([
            'message' => 'NGO approved successfully',
            'data' => $ngo,
        ]);
    }

    /**
     * Reject an NGO profile
     * POST /api/ngo-profiles/{id}/reject
     */
    public function reject($id)
    {
        $ngo = NgoProfile::findOrFail($id);
        $ngo->update(['is_verified' => false, 'status' => 'rejected']);

        return response()->json([
            'message' => 'NGO rejected',
            'data' => $ngo,
        ]);
    }
}
