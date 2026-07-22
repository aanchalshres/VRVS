<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    public function __construct(
        private ActivityLogService $activityLog
    ) {}

    public function index(Request $request)
    {
        $query = User::where('role', 'admin');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $admins = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($admins);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ])->validate();

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'admin';
        $validated['is_active'] = true;

        $admin = User::create($validated);

        $this->activityLog->adminCreated(
            $request->user()->id,
            $admin->name,
            $request->ip()
        );

        return response()->json([
            'message' => 'Admin created successfully',
            'data' => $admin,
        ], 201);
    }

    public function show($id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        return response()->json(['data' => $admin]);
    }

    public function update(Request $request, $id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        $validated = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $id,
            'phone' => 'sometimes|string|max:20|unique:users,phone,' . $id,
            'password' => 'sometimes|string|min:8|confirmed',
        ])->validate();

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $admin->update($validated);

        $this->activityLog->adminUpdated(
            $request->user()->id,
            $admin->name,
            $request->ip()
        );

        return response()->json([
            'message' => 'Admin updated successfully',
            'data' => $admin->fresh(),
        ]);
    }

    public function toggleStatus(Request $request, $id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        if ($admin->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot suspend your own account'], 422);
        }

        $admin->update(['is_active' => !$admin->is_active]);

        if ($admin->is_active) {
            $this->activityLog->adminActivated($request->user()->id, $admin->name, $request->ip());
        } else {
            $this->activityLog->adminSuspended($request->user()->id, $admin->name, $request->ip());
        }

        $status = $admin->is_active ? 'activated' : 'suspended';

        return response()->json([
            'message' => "Admin {$status} successfully",
            'data' => $admin->fresh(),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        if ($admin->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 422);
        }

        $adminName = $admin->name;
        $admin->delete();

        $this->activityLog->adminDeleted($request->user()->id, $adminName, $request->ip());

        return response()->json(['message' => 'Admin deleted successfully']);
    }
}
