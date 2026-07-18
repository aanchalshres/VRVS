<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getSystemStats()
    {
        $stats = [
            'total_users'        => DB::table('users')->count(),
            'total_volunteers'   => DB::table('users')
                ->where('role', 'volunteer')
                ->count(),

            'total_ngos'         => DB::table('users')
                ->where('role', 'ngo')
                ->count(),

            'verified_ngos'      => DB::table('ngo_profiles')
                ->where('verification_status', 'verified')
                ->count(),

            'pending_ngos'       => DB::table('ngo_profiles')
                ->where('verification_status', 'pending')
                ->count(),

            'total_tasks'        => DB::table('tasks')->count(),

            'active_tasks'       => DB::table('tasks')
                ->where('status', 'active')
                ->count(),

            'total_applications' => DB::table('applications')->count(),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}
