<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifiedNgo
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is authenticated
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Check if user is an NGO
        if ($user->role !== 'ngo') {
            return response()->json([
                'message' => 'Only NGOs can access this resource',
            ], 403);
        }

        if (!$user->ngoProfile) {
            return response()->json([
                'message' => 'NGO profile not found',
            ], 404);
        }

        if ($user->ngoProfile->verification_status !== 'verified') {
            return response()->json([
                'message' => 'Your NGO must be verified by admin before accessing this resource',
            ], 403);
        }

        return $next($request);
    }
}
