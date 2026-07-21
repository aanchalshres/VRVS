<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\Admin\VerificationController;
use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AssignmentController;
use App\Http\Controllers\Admin\TfIdfController;

use App\Http\Controllers\Ngo\TaskController as NgoTaskController;
use App\Http\Controllers\Ngo\ApplicationController as NgoApplicationController;

use App\Http\Controllers\Volunteer\TaskController as VolunteerTaskController;
use App\Http\Controllers\Volunteer\ApplicationController as VolunteerApplicationController;
use App\Http\Controllers\Volunteer\ProfileController as VolunteerProfileController;


/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is running'
    ]);
});


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', [AuthController::class, 'me']);

    Route::post('/logout', [AuthController::class, 'logout']);

});


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin'
])->group(function () {


    /*
    |--------------------------------------------------------------------------
    | NGO Verification
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/ngo-verification',
        [VerificationController::class, 'getNgoVerification']
    );

    Route::post(
        '/admin/ngo-verify/{id}',
        [VerificationController::class, 'verifyNgo']
    );

    Route::post(
        '/admin/ngo-reject/{id}',
        [VerificationController::class, 'rejectNgo']
    );


    /*
    |--------------------------------------------------------------------------
    | NGO Listing
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/ngos',
        [VerificationController::class, 'ngos']
    );

    Route::get(
        '/ngos/{id}',
        [VerificationController::class, 'ngoDetails']
    );


    /*
    |--------------------------------------------------------------------------
    | Task Moderation
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/task-moderation',
        [AdminTaskController::class, 'index']
    );

    Route::delete(
        '/admin/tasks/{id}',
        [AdminTaskController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/stats',
        [DashboardController::class, 'stats']
    );


    /*
    |--------------------------------------------------------------------------
    | Assignment
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/admin/batch-assign',
        [AssignmentController::class, 'batchAssign']
    );


    /*
    |--------------------------------------------------------------------------
    | TF-IDF
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/admin/tfidf/recompute',
        [TfIdfController::class, 'recompute']
    );

});


/*
|--------------------------------------------------------------------------
| NGO Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:ngo'
])->group(function () {


    /*
    |--------------------------------------------------------------------------
    | Tasks
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/ngo/tasks',
        [NgoTaskController::class, 'index']
    );

    Route::post(
        '/ngo/tasks',
        [NgoTaskController::class, 'store']
    );

    Route::put(
        '/ngo/tasks/{id}',
        [NgoTaskController::class, 'update']
    );

    Route::delete(
        '/ngo/tasks/{id}',
        [NgoTaskController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Applications
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/ngo/applications',
        [NgoApplicationController::class, 'index']
    );

    Route::post(
        '/ngo/applications/{id}/accept',
        [NgoApplicationController::class, 'accept']
    );

    Route::post(
        '/ngo/applications/{id}/reject',
        [NgoApplicationController::class, 'reject']
    );

});


/*
|--------------------------------------------------------------------------
| Volunteer Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:volunteer'
])->group(function () {


    /*
    |--------------------------------------------------------------------------
    | Task Discovery
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/tasks',
        [VolunteerTaskController::class, 'index']
    );

    Route::get(
        '/volunteer/tasks/{id}',
        [VolunteerTaskController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | Applications
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/volunteer/tasks/{id}/apply',
        [VolunteerApplicationController::class, 'store']
    );

    Route::get(
        '/volunteer/applications',
        [VolunteerApplicationController::class, 'index']
    );


    /*
    |--------------------------------------------------------------------------
    | Profile
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/profile',
        [VolunteerProfileController::class, 'show']
    );

});


/*
|--------------------------------------------------------------------------
| TF-IDF Public Debug Routes
|--------------------------------------------------------------------------
*/

Route::get(
    '/volunteers/{id}/tfidf',
    [TfIdfController::class, 'showVolunteer']
);

Route::get(
    '/tasks/{id}/tfidf',
    [TfIdfController::class, 'showTask']
);
