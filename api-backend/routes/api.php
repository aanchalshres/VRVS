<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SkillController;

use App\Http\Controllers\Admin\VerificationController;
use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AssignmentController;
use App\Http\Controllers\Admin\TfIdfController;

use App\Http\Controllers\Ngo\TaskController as NgoTaskController;
use App\Http\Controllers\Ngo\ApplicationController as NgoApplicationController;
use App\Http\Controllers\Ngo\ProfileController as NgoProfileController;
use App\Http\Controllers\Ngo\DashboardController as NgoDashboardController;
use App\Http\Controllers\Ngo\NotificationController as NgoNotificationController;

use App\Http\Controllers\Volunteer\TaskController as VolunteerTaskController;
use App\Http\Controllers\Volunteer\ApplicationController as VolunteerApplicationController;
use App\Http\Controllers\Volunteer\ProfileController as VolunteerProfileController;
use App\Http\Controllers\Volunteer\SkillController as VolunteerSkillController;
use App\Http\Controllers\Volunteer\DocumentController as VolunteerDocumentController;
use App\Http\Controllers\Volunteer\DashboardController as VolunteerDashboardController;
use App\Http\Controllers\Volunteer\NotificationController as VolunteerNotificationController;


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

Route::get('/skills', [SkillController::class, 'index']);


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

    Route::get(
        '/ngo/tasks/{id}',
        [NgoTaskController::class, 'show']
    );

    Route::post(
        '/ngo/tasks',
        [NgoTaskController::class, 'store']
    );

    Route::post(
        '/ngo/tasks/{id}/complete',
        [NgoTaskController::class, 'complete']
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


/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

Route::get(
    '/ngo/profile',
    [NgoProfileController::class, 'show']
);

Route::put(
    '/ngo/profile',
    [NgoProfileController::class, 'update']
);


/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

Route::get(
    '/ngo/dashboard',
    [NgoDashboardController::class, 'index']
);


/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

Route::get(
    '/ngo/notifications',
    [NgoNotificationController::class, 'index']
);

Route::post(
    '/ngo/notifications/{id}/read',
    [NgoNotificationController::class, 'markAsRead']
);

Route::post(
    '/ngo/notifications/read-all',
    [NgoNotificationController::class, 'markAllAsRead']
);

Route::get(
    '/ngo/notifications/unread-count',
    [NgoNotificationController::class, 'unreadCount']
);

Route::delete(
    '/ngo/notifications/{id}',
    [NgoNotificationController::class, 'destroy']
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
        [VolunteerTaskController::class, 'getTasks']
    );

    Route::get(
        '/volunteer/tasks/{id}',
        [VolunteerTaskController::class, 'getTaskDetail']
    );


    /*
    |--------------------------------------------------------------------------
    | Applications
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/volunteer/tasks/{id}/apply',
        [VolunteerApplicationController::class, 'applyForTask']
    );

    Route::get(
        '/volunteer/applications',
        [VolunteerApplicationController::class, 'getApplications']
    );

    Route::post(
        '/volunteer/applications/{id}/withdraw',
        [VolunteerApplicationController::class, 'withdraw']
    );


    /*
    |--------------------------------------------------------------------------
    | Profile
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/profile',
        [VolunteerProfileController::class, 'getProfile']
    );

    Route::put(
        '/volunteer/profile',
        [VolunteerProfileController::class, 'updateProfile']
    );

    Route::post(
        '/volunteer/profile-photo',
        [VolunteerProfileController::class, 'uploadPhoto']
    );


    /*
    |--------------------------------------------------------------------------
    | Skills
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/skills',
        [VolunteerSkillController::class, 'index']
    );

    Route::post(
        '/volunteer/skills',
        [VolunteerSkillController::class, 'sync']
    );


    /*
    |--------------------------------------------------------------------------
    | Documents
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/documents',
        [VolunteerDocumentController::class, 'index']
    );

    Route::post(
        '/volunteer/documents',
        [VolunteerDocumentController::class, 'store']
    );

    Route::get(
        '/volunteer/documents/{id}',
        [VolunteerDocumentController::class, 'show']
    );

    Route::delete(
        '/volunteer/documents/{id}',
        [VolunteerDocumentController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/dashboard',
        [VolunteerDashboardController::class, 'index']
    );


    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/notifications',
        [VolunteerNotificationController::class, 'index']
    );

    Route::post(
        '/volunteer/notifications/{id}/read',
        [VolunteerNotificationController::class, 'markAsRead']
    );

    Route::post(
        '/volunteer/notifications/read-all',
        [VolunteerNotificationController::class, 'markAllAsRead']
    );

    Route::delete(
        '/volunteer/notifications/{id}',
        [VolunteerNotificationController::class, 'destroy']
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
