<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NgoProfile;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NGOManagementController extends Controller
{
    public function __construct(
        private ActivityLogService $activityLog,
        private NotificationService $notificationService
    ) {}

    public function suspend($id)
    {
        $ngoUser = User::where('role', 'ngo')->findOrFail($id);
        $ngoUser->update(['is_active' => false]);

        $ngoProfile = NgoProfile::where('user_id', $id)->first();
        $ngoName = $ngoProfile?->organization_name ?? $ngoUser->name;

        $this->activityLog->ngoSuspended(
            request()->user()->id,
            $ngoName,
            request()->ip()
        );

        $this->notificationService->create(
            $id,
            'Account Suspended',
            "Your NGO account has been suspended. Please contact support.",
            'account_suspended'
        );

        return response()->json([
            'message' => 'NGO suspended successfully',
            'data' => $ngoUser->fresh(),
        ]);
    }

    public function activate($id)
    {
        $ngoUser = User::where('role', 'ngo')->findOrFail($id);
        $ngoUser->update(['is_active' => true]);

        $ngoProfile = NgoProfile::where('user_id', $id)->first();
        $ngoName = $ngoProfile?->organization_name ?? $ngoUser->name;

        $this->activityLog->ngoActivated(
            request()->user()->id,
            $ngoName,
            request()->ip()
        );

        $this->notificationService->create(
            $id,
            'Account Reactivated',
            "Your NGO account has been reactivated.",
            'account_reactivated'
        );

        return response()->json([
            'message' => 'NGO activated successfully',
            'data' => $ngoUser->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $ngoUser = User::where('role', 'ngo')->findOrFail($id);

        $ngoProfile = NgoProfile::where('user_id', $id)->first();
        $ngoName = $ngoProfile?->organization_name ?? $ngoUser->name;

        DB::transaction(function () use ($ngoUser) {
            NgoProfile::where('user_id', $ngoUser->id)->delete();
            $ngoUser->delete();
        });

        $this->activityLog->ngoDeleted(
            request()->user()->id,
            $ngoName,
            request()->ip()
        );

        return response()->json(['message' => 'NGO deleted successfully']);
    }
}
