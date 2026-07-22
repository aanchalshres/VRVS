<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SkillController;

use App\Http\Controllers\Admin\VerificationController;
use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AssignmentController;
use App\Http\Controllers\Admin\TfIdfController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\VolunteerController;
use App\Http\Controllers\Admin\VolunteerVerificationController;
use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\ExportController;
use App\Http\Controllers\Admin\NGOManagementController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\SkillController as AdminSkillController;

use App\Http\Controllers\Ngo\TaskController as NgoTaskController;
use App\Http\Controllers\Ngo\ApplicationController as NgoApplicationController;
use App\Http\Controllers\Ngo\ProfileController as NgoProfileController;
use App\Http\Controllers\Ngo\DashboardController as NgoDashboardController;
use App\Http\Controllers\Ngo\NotificationController as NgoNotificationController;
use App\Http\Controllers\Ngo\DocumentController as NgoDocumentController;
use App\Http\Controllers\Ngo\AttendanceController as NgoAttendanceController;
use App\Http\Controllers\Ngo\ReportsController as NgoReportsController;
use App\Http\Controllers\Ngo\RatingController as NgoRatingController;
use App\Http\Controllers\Ngo\CertificateController as NgoCertificateController;
use App\Http\Controllers\Ngo\WorkflowController as NgoWorkflowController;

use App\Http\Controllers\Volunteer\TaskController as VolunteerTaskController;
use App\Http\Controllers\Volunteer\ApplicationController as VolunteerApplicationController;
use App\Http\Controllers\Volunteer\ProfileController as VolunteerProfileController;
use App\Http\Controllers\Volunteer\SkillController as VolunteerSkillController;
use App\Http\Controllers\Volunteer\DocumentController as VolunteerDocumentController;
use App\Http\Controllers\Volunteer\DashboardController as VolunteerDashboardController;
use App\Http\Controllers\Volunteer\NotificationController as VolunteerNotificationController;
use App\Http\Controllers\Volunteer\AttendanceController as VolunteerAttendanceController;
use App\Http\Controllers\Volunteer\RatingController as VolunteerRatingController;
use App\Http\Controllers\Volunteer\CertificateController as VolunteerCertificateController;
use App\Http\Controllers\Volunteer\WorkflowController as VolunteerWorkflowController;


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
Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);


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


    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/reports',
        [ReportController::class, 'index']
    );

    Route::get(
        '/admin/reports/{id}',
        [ReportController::class, 'show']
    );

    Route::put(
        '/admin/reports/{id}',
        [ReportController::class, 'update']
    );


    /*
    |--------------------------------------------------------------------------
    | Dashboard - Activities & Recent NGOs
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/activities',
        [DashboardController::class, 'activities']
    );

    Route::get(
        '/admin/recent-ngos',
        [DashboardController::class, 'recentNgos']
    );


    /*
    |--------------------------------------------------------------------------
    | Volunteer Management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/volunteers',
        [VolunteerController::class, 'index']
    );

    Route::get(
        '/admin/volunteers/stats',
        [VolunteerController::class, 'stats']
    );

    Route::get(
        '/admin/volunteers/{id}',
        [VolunteerController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | Volunteer Verification
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/volunteer-verification',
        [VolunteerVerificationController::class, 'index']
    );

    Route::get(
        '/admin/volunteer-verification/pending',
        [VolunteerVerificationController::class, 'pending']
    );

    Route::post(
        '/admin/volunteer-verification/{id}/approve',
        [VolunteerVerificationController::class, 'approveVolunteer']
    );

    Route::post(
        '/admin/volunteer-verification/{id}/reject',
        [VolunteerVerificationController::class, 'rejectVolunteer']
    );

    Route::get(
        '/admin/volunteer-verification/{id}/history',
        [VolunteerVerificationController::class, 'verificationHistory']
    );

    Route::post(
        '/admin/documents/{documentId}/review',
        [VolunteerVerificationController::class, 'reviewDocument']
    );


    /*
    |--------------------------------------------------------------------------
    | Application Management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/applications',
        [ApplicationController::class, 'index']
    );

    Route::get(
        '/admin/applications/stats',
        [ApplicationController::class, 'stats']
    );

    Route::get(
        '/admin/applications/{id}',
        [ApplicationController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | Attendance & Service Logs
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/attendance',
        [AttendanceController::class, 'index']
    );

    Route::get(
        '/admin/attendance/summary',
        [AttendanceController::class, 'summary']
    );

    Route::get(
        '/admin/attendance/{id}',
        [AttendanceController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | Opportunity Management (tasks)
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/tasks/{id}',
        [AdminTaskController::class, 'show']
    );

    Route::put(
        '/admin/tasks/{id}/status',
        [AdminTaskController::class, 'updateStatus']
    );


    /*
    |--------------------------------------------------------------------------
    | Certificate Management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/certificates',
        [CertificateController::class, 'index']
    );

    Route::get(
        '/admin/certificates/stats',
        [CertificateController::class, 'stats']
    );

    Route::get(
        '/admin/certificates/{id}',
        [CertificateController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | Ratings & Reviews Moderation
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/reviews',
        [ReviewController::class, 'index']
    );

    Route::get(
        '/admin/reviews/stats',
        [ReviewController::class, 'stats']
    );

    Route::get(
        '/admin/reviews/{id}',
        [ReviewController::class, 'show']
    );

    Route::delete(
        '/admin/reviews/{id}',
        [ReviewController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Reports & Analytics
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/analytics/dashboard',
        [AnalyticsController::class, 'dashboard']
    );

    Route::get(
        '/admin/analytics/monthly',
        [AnalyticsController::class, 'monthly']
    );

    Route::get(
        '/admin/analytics/ngos',
        [AnalyticsController::class, 'ngos']
    );

    Route::get(
        '/admin/analytics/volunteers',
        [AnalyticsController::class, 'volunteers']
    );

    Route::get(
        '/admin/analytics/opportunities',
        [AnalyticsController::class, 'opportunities']
    );


    /*
    |--------------------------------------------------------------------------
    | System Settings
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/settings/profile',
        [SettingsController::class, 'profile']
    );

    Route::put(
        '/admin/settings/profile',
        [SettingsController::class, 'updateProfile']
    );

    Route::post(
        '/admin/settings/change-password',
        [SettingsController::class, 'changePassword']
    );

    Route::get(
        '/admin/settings',
        [SettingsController::class, 'getSettings']
    );

    Route::put(
        '/admin/settings',
        [SettingsController::class, 'updateSettings']
    );

    Route::get(
        '/admin/settings/notification-preferences',
        [SettingsController::class, 'getNotificationPreferences']
    );

    Route::put(
        '/admin/settings/notification-preferences',
        [SettingsController::class, 'updateNotificationPreferences']
    );


    /*
    |--------------------------------------------------------------------------
    | Admin Notifications
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/notifications',
        [AdminNotificationController::class, 'index']
    );

    Route::get(
        '/admin/notifications/unread-count',
        [AdminNotificationController::class, 'unreadCount']
    );

    Route::post(
        '/admin/notifications/{id}/read',
        [AdminNotificationController::class, 'markAsRead']
    );

    Route::post(
        '/admin/notifications/read-all',
        [AdminNotificationController::class, 'markAllAsRead']
    );

    Route::delete(
        '/admin/notifications/{id}',
        [AdminNotificationController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Admin User Management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/admin-users',
        [UserManagementController::class, 'index']
    );

    Route::post(
        '/admin/admin-users',
        [UserManagementController::class, 'store']
    );

    Route::get(
        '/admin/admin-users/{id}',
        [UserManagementController::class, 'show']
    );

    Route::put(
        '/admin/admin-users/{id}',
        [UserManagementController::class, 'update']
    );

    Route::post(
        '/admin/admin-users/{id}/toggle-status',
        [UserManagementController::class, 'toggleStatus']
    );

    Route::delete(
        '/admin/admin-users/{id}',
        [UserManagementController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | CSV Export
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/export/volunteers',
        [ExportController::class, 'volunteers']
    );

    Route::get(
        '/admin/export/ngos',
        [ExportController::class, 'ngos']
    );

    Route::get(
        '/admin/export/applications',
        [ExportController::class, 'applications']
    );

    Route::get(
        '/admin/export/attendance',
        [ExportController::class, 'attendance']
    );

    Route::get(
        '/admin/export/tasks',
        [ExportController::class, 'tasks']
    );

    Route::get(
        '/admin/export/reports',
        [ExportController::class, 'reports']
    );

    Route::get(
        '/admin/export/service-logs',
        [ExportController::class, 'serviceLogs']
    );


    /*
    |--------------------------------------------------------------------------
    | NGO Management (Suspend / Activate / Delete)
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/admin/ngos/{id}/suspend',
        [NGOManagementController::class, 'suspend']
    );

    Route::post(
        '/admin/ngos/{id}/activate',
        [NGOManagementController::class, 'activate']
    );

    Route::delete(
        '/admin/ngos/{id}',
        [NGOManagementController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Categories Management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/categories',
        [AdminCategoryController::class, 'index']
    );

    Route::post(
        '/admin/categories',
        [AdminCategoryController::class, 'store']
    );

    Route::get(
        '/admin/categories/{id}',
        [AdminCategoryController::class, 'show']
    );

    Route::put(
        '/admin/categories/{id}',
        [AdminCategoryController::class, 'update']
    );

    Route::delete(
        '/admin/categories/{id}',
        [AdminCategoryController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Skills Management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/skills',
        [AdminSkillController::class, 'index']
    );

    Route::post(
        '/admin/skills',
        [AdminSkillController::class, 'store']
    );

    Route::get(
        '/admin/skills/{id}',
        [AdminSkillController::class, 'show']
    );

    Route::put(
        '/admin/skills/{id}',
        [AdminSkillController::class, 'update']
    );

    Route::delete(
        '/admin/skills/{id}',
        [AdminSkillController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Activity Log
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/activity-logs',
        [ActivityLogController::class, 'index']
    );

    Route::get(
        '/admin/activity-logs/modules',
        [ActivityLogController::class, 'modules']
    );

    Route::get(
        '/admin/activity-logs/actions',
        [ActivityLogController::class, 'actions']
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

    Route::get(
        '/ngo/tasks/{id}/recommended-volunteers',
        [NgoTaskController::class, 'recommendedVolunteers']
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

Route::post(
    '/ngo/applications/{id}/cancel',
    [NgoApplicationController::class, 'cancel']
);

Route::get(
    '/ngo/assignments',
    [NgoApplicationController::class, 'assignments']
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

Route::post(
    '/ngo/profile/logo',
    [NgoProfileController::class, 'uploadLogo']
);

Route::delete(
    '/ngo/profile/logo',
    [NgoProfileController::class, 'removeLogo']
);


/*
|--------------------------------------------------------------------------
| Documents (Verification)
|--------------------------------------------------------------------------
*/

Route::get(
    '/ngo/documents',
    [NgoDocumentController::class, 'index']
);

Route::post(
    '/ngo/documents',
    [NgoDocumentController::class, 'store']
);

Route::get(
    '/ngo/documents/{id}',
    [NgoDocumentController::class, 'show']
);

Route::delete(
    '/ngo/documents/{id}',
    [NgoDocumentController::class, 'destroy']
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


/*
|--------------------------------------------------------------------------
| Attendance
|--------------------------------------------------------------------------
*/

Route::get(
    '/ngo/attendance',
    [NgoAttendanceController::class, 'index']
);

Route::post(
    '/ngo/attendance/{id}/approve',
    [NgoAttendanceController::class, 'approve']
);

Route::post(
    '/ngo/attendance/{id}/absent',
    [NgoAttendanceController::class, 'markAbsent']
);

Route::get(
    '/ngo/attendance/summary',
    [NgoAttendanceController::class, 'summary']
);


/*
|--------------------------------------------------------------------------
| Reports & Analytics
|--------------------------------------------------------------------------
*/

Route::get(
    '/ngo/reports',
    [NgoReportsController::class, 'index']
);


/*
|--------------------------------------------------------------------------
| Ratings & Feedback
|--------------------------------------------------------------------------
*/

Route::get(
    '/ngo/ratings',
    [NgoRatingController::class, 'index']
);

Route::post(
    '/ngo/ratings',
    [NgoRatingController::class, 'store']
);

Route::get(
    '/ngo/ratings/eligible',
    [NgoRatingController::class, 'eligibleVolunteers']
);

Route::get(
    '/ngo/ratings/volunteer/{volunteerProfileId}',
    [NgoRatingController::class, 'volunteerHistory']
);


/*
|--------------------------------------------------------------------------
| Certificates
|--------------------------------------------------------------------------
*/

Route::get(
    '/ngo/certificates',
    [NgoCertificateController::class, 'index']
);


/*
|--------------------------------------------------------------------------
| Workflow Automation
|--------------------------------------------------------------------------
*/

Route::get(
    '/ngo/tasks/{id}/shortlist',
    [NgoWorkflowController::class, 'shortlist']
);

Route::post(
    '/ngo/tasks/{id}/generate-shortlist',
    [NgoWorkflowController::class, 'generateShortlist']
);

Route::get(
    '/ngo/tasks/{id}/prioritized-applications',
    [NgoWorkflowController::class, 'prioritizedApplications']
);

Route::get(
    '/ngo/strategies',
    [NgoWorkflowController::class, 'strategies']
);

Route::get(
    '/ngo/certificates/eligible',
    [NgoCertificateController::class, 'eligibleApplications']
);

Route::post(
    '/ngo/certificates',
    [NgoCertificateController::class, 'generate']
);

Route::get(
    '/ngo/certificates/{id}',
    [NgoCertificateController::class, 'show']
);

Route::get(
    '/ngo/certificates/{id}/download',
    [NgoCertificateController::class, 'download']
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
    | Assigned Tasks
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/assigned-tasks',
        [VolunteerApplicationController::class, 'getAssignedTasks']
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

    Route::delete(
        '/volunteer/profile-photo',
        [VolunteerProfileController::class, 'removePhoto']
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

    Route::get(
        '/volunteer/notifications/unread-count',
        [VolunteerNotificationController::class, 'unreadCount']
    );


    /*
    |--------------------------------------------------------------------------
    | Attendance
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/volunteer/attendance/check-in',
        [VolunteerAttendanceController::class, 'checkIn']
    );

    Route::post(
        '/volunteer/attendance/check-out',
        [VolunteerAttendanceController::class, 'checkOut']
    );

    Route::get(
        '/volunteer/attendance',
        [VolunteerAttendanceController::class, 'history']
    );

    Route::get(
        '/volunteer/attendance/hours',
        [VolunteerAttendanceController::class, 'hours']
    );


    /*
    |--------------------------------------------------------------------------
    | Ratings & Feedback
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/ratings',
        [VolunteerRatingController::class, 'index']
    );

    Route::get(
        '/volunteer/ratings/received',
        [VolunteerRatingController::class, 'received']
    );

    Route::get(
        '/volunteer/ratings/eligible',
        [VolunteerRatingController::class, 'eligibleTasks']
    );

    Route::post(
        '/volunteer/ratings',
        [VolunteerRatingController::class, 'store']
    );

    Route::put(
        '/volunteer/ratings/{id}',
        [VolunteerRatingController::class, 'update']
    );


    /*
    |--------------------------------------------------------------------------
    | Certificates
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/certificates',
        [VolunteerCertificateController::class, 'index']
    );

    Route::get(
        '/volunteer/certificates/{id}',
        [VolunteerCertificateController::class, 'show']
    );

    Route::get(
        '/volunteer/certificates/{id}/download',
        [VolunteerCertificateController::class, 'download']
    );


    /*
    |--------------------------------------------------------------------------
    | Password
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/volunteer/change-password',
        [VolunteerProfileController::class, 'changePassword']
    );


    /*
    |--------------------------------------------------------------------------
    | Workflow Automation
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/volunteer/recommended-ngos',
        [VolunteerWorkflowController::class, 'recommendedNgos']
    );

    Route::get(
        '/volunteer/strategies',
        [VolunteerWorkflowController::class, 'strategies']
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
