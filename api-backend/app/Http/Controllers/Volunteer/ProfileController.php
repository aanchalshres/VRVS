<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'volunteer') {
            return response()->json([
                'message' => 'Only volunteers can access this'
            ], 403);
        }

        return response()->json([
            'data' => $user->load('volunteerProfile'),
        ]);
    }
}
