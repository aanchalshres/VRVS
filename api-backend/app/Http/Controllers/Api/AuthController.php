<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // =========================
    // REGISTER (Volunteer + NGO)
    // =========================

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6',
            'role' => 'required|in:volunteer,ngo',

            // NGO fields
            'website' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'organizationName' => 'nullable|string|max:255',
            'registrationNumber' => 'nullable|string|max:255',
            'officeLocation' => 'nullable|string|max:255',
            'panNumber' => 'nullable|string|max:255',
            'registrationFile' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png',
            'panFile' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png',
            'letterhead' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png',

            // Volunteer field
            'location' => 'nullable|string|max:255',
        ]);

        $user = DB::transaction(function () use ($validated, $request) {

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);

            // Volunteer profile
            if ($validated['role'] === 'volunteer') {

                $user->volunteerProfile()->create([
                    'bio' => null,
                    'primary_location' => $validated['location'] ?? null,
                    'availability' => 'Available',
                    'trust_score' => 0.5,
                    'total_service_hours' => 0,
                    'average_rating' => 0,
                ]);
            }

            // NGO profile
            if ($validated['role'] === 'ngo') {

                // Store uploaded files (optional)
                if ($request->hasFile('registrationFile')) {
                    $request->file('registrationFile')
                            ->store('ngo-documents', 'public');
                }

                if ($request->hasFile('panFile')) {
                    $request->file('panFile')
                            ->store('ngo-documents', 'public');
                }

                if ($request->hasFile('letterhead')) {
                    $request->file('letterhead')
                            ->store('ngo-documents', 'public');
                }

                $user->ngoProfile()->create([
                    'organization_name' =>
                        $request->input('organizationName')
                        ?? $validated['name'],

                    'registration_number' =>
                        $request->input('registrationNumber'),

                    'office_location' =>
                        $request->input('officeLocation'),

                    'website' =>
                        $request->input('website'),

                    'description' =>
                        $request->input('description'),

                    'city' =>
                        $request->input('city'),

                    'country' =>
                        $request->input('country'),

                    'pan_number' =>
                        $request->input('panNumber'),

                    'verification_status' => 'pending',
                ]);
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'ngoProfile' => $user->ngoProfile,
                'volunteerProfile' => $user->volunteerProfile,
            ],
        ], 201);
    }


    // =========================
    // LOGIN
    // =========================
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'ngoProfile' => $user->ngoProfile,
                'volunteerProfile' => $user->volunteerProfile,
            ],
        ]);
    }

    // =========================
    // GET CURRENT USER
    // =========================
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'ngoProfile' => $user->ngoProfile,
                'volunteerProfile' => $user->volunteerProfile,
            ],
        ]);
    }

    // =========================
    // LOGOUT
    // =========================
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
