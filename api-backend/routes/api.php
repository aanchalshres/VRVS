<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NgoController;
use App\Http\Controllers\Api\NgoProfileController;
use App\Http\Controllers\Api\VolunteerController;
use App\Http\Controllers\Admin\AdminController;
use Illuminate\Support\Facades\Route;

// Health check (public - no auth required)
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'API is running']);
});

// Auth routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authenticated users)
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'me']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Admin routes (admin role only)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // NGO profile routes
    Route::get('/ngo-profiles', [NgoProfileController::class, 'index']);
    Route::get('/ngo-profiles/{id}', [NgoProfileController::class, 'show']);
    Route::post('/ngo-profiles/{id}/approve', [NgoProfileController::class, 'approve']);
    Route::post('/ngo-profiles/{id}/reject', [NgoProfileController::class, 'reject']);

    // Legacy NGO verification routes (kept for backward compatibility)
    Route::get('/admin/ngo-verification', [AdminController::class, 'getNgoVerification']);
    Route::post('/admin/ngo-verify/{id}', [AdminController::class, 'verifyNgo']);
    Route::post('/admin/ngo-reject/{id}', [AdminController::class, 'rejectNgo']);

    // Task moderation routes
    Route::get('/admin/task-moderation', [AdminController::class, 'getTaskModeration']);
    Route::delete('/admin/tasks/{id}', [AdminController::class, 'deleteTask']);

    // System stats
    Route::get('/admin/stats', [AdminController::class, 'getSystemStats']);

    // New NGO routes with formatted data
    Route::get('/ngos', [AdminController::class, 'ngos']);
    Route::get('/ngos/{id}', [AdminController::class, 'ngoDetails']);
});

// NGO routes (ngo role only)
Route::middleware(['auth:sanctum', 'role:ngo'])->group(function () {
    // View own tasks (verified or unverified NGOs)
    Route::get('/ngo/tasks', [NgoController::class, 'getTasks']);
    Route::get('/ngo/applications', [NgoController::class, 'getApplications']);
    Route::get('/ngo/profile', [NgoController::class, 'getProfile']);

    // Task creation/management routes (verified NGOs only)
    Route::middleware('verified_ngo')->group(function () {
        Route::post('/ngo/tasks', [NgoController::class, 'createTask']);
        Route::put('/ngo/tasks/{id}', [NgoController::class, 'updateTask']);
        Route::delete('/ngo/tasks/{id}', [NgoController::class, 'deleteTask']);
        Route::post('/ngo/tasks/{id}/complete', [NgoController::class, 'completeTask']);
        Route::post('/ngo/applications/{id}/accept', [NgoController::class, 'acceptApplication']);
        Route::post('/ngo/applications/{id}/reject', [NgoController::class, 'rejectApplication']);
    });
});

// Volunteer routes (volunteer role only)
Route::middleware(['auth:sanctum', 'role:volunteer'])->group(function () {
    // Browse tasks
    Route::get('/volunteer/tasks', [VolunteerController::class, 'getTasks']);
    Route::get('/volunteer/tasks/{id}', [VolunteerController::class, 'getTaskDetail']);

    // Apply for task
    Route::post('/volunteer/tasks/{id}/apply', [VolunteerController::class, 'applyForTask']);
    Route::get('/volunteer/applications', [VolunteerController::class, 'getApplications']);

    // Profile
    Route::get('/volunteer/profile', [VolunteerController::class, 'getProfile']);
});
