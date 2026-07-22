<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    public function __construct(
        private ActivityLogService $activityLog
    ) {}

    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at,
                'last_login_at' => $user->last_login_at,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $request->user()->id,
            'phone' => 'sometimes|string|max:20|unique:users,phone,' . $request->user()->id,
        ])->validate();

        $request->user()->update($validated);

        $this->activityLog->settingsUpdated($request->user()->id, 'profile', $request->ip());

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $request->user()->fresh(),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ])->validate();

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($validated['new_password'])]);

        $this->activityLog->passwordChanged($user->id, $request->ip());

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function getSettings(Request $request)
    {
        $group = $request->input('group', 'general');

        $settings = SystemSetting::where('group', $group)->get()
            ->pluck('value', 'key')
            ->map(fn ($v) => is_numeric($v) ? ($v + 0) : $v);

        return response()->json(['data' => $settings]);
    }

    public function updateSettings(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'group' => 'required|string|max:50',
            'settings' => 'required|array',
            'settings.*' => 'nullable|string',
        ])->validate();

        foreach ($validated['settings'] as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => $key, 'group' => $validated['group']],
                ['value' => (string) $value, 'description' => $key]
            );
        }

        $this->activityLog->settingsUpdated(
            $request->user()->id,
            $validated['group'],
            $request->ip()
        );

        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function getNotificationPreferences(Request $request)
    {
        $prefs = SystemSetting::where('group', 'notification_preferences')
            ->where('key', 'like', "user_{$request->user()->id}_%")
            ->get()
            ->pluck('value', 'key')
            ->map(fn ($v) => filter_var($v, FILTER_VALIDATE_BOOLEAN));

        return response()->json(['data' => $prefs]);
    }

    public function updateNotificationPreferences(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'preferences' => 'required|array',
            'preferences.*' => 'boolean',
        ])->validate();

        $userId = $request->user()->id;

        foreach ($validated['preferences'] as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => "user_{$userId}_{$key}", 'group' => 'notification_preferences'],
                ['value' => $value ? 'true' : 'false']
            );
        }

        return response()->json(['message' => 'Notification preferences updated']);
    }
}
