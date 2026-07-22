<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogService
{
    public function log(
        int $userId,
        string $action,
        ?string $module = null,
        ?string $description = null,
        ?string $ipAddress = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }

    public function logFromRequest(
        Request $request,
        string $action,
        ?string $module = null,
        ?string $description = null
    ): ActivityLog {
        return $this->log(
            $request->user()->id,
            $action,
            $module,
            $description,
            $request->ip()
        );
    }

    public function ngoVerified(int $userId, string $ngoName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'verified_ngo', 'ngo_verification', "Verified NGO: {$ngoName}", $ip);
    }

    public function ngoRejected(int $userId, string $ngoName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'rejected_ngo', 'ngo_verification', "Rejected NGO: {$ngoName}", $ip);
    }

    public function ngoSuspended(int $userId, string $ngoName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'suspended_ngo', 'ngo_management', "Suspended NGO: {$ngoName}", $ip);
    }

    public function ngoActivated(int $userId, string $ngoName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'activated_ngo', 'ngo_management', "Reactivated NGO: {$ngoName}", $ip);
    }

    public function ngoDeleted(int $userId, string $ngoName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'deleted_ngo', 'ngo_management', "Deleted NGO: {$ngoName}", $ip);
    }

    public function volunteerVerified(int $userId, string $volunteerName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'verified_volunteer', 'volunteer_verification', "Verified volunteer: {$volunteerName}", $ip);
    }

    public function adminCreated(int $userId, string $adminName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'created_admin', 'user_management', "Created admin: {$adminName}", $ip);
    }

    public function adminUpdated(int $userId, string $adminName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'updated_admin', 'user_management', "Updated admin: {$adminName}", $ip);
    }

    public function adminSuspended(int $userId, string $adminName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'suspended_admin', 'user_management', "Suspended admin: {$adminName}", $ip);
    }

    public function adminActivated(int $userId, string $adminName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'activated_admin', 'user_management', "Activated admin: {$adminName}", $ip);
    }

    public function adminDeleted(int $userId, string $adminName, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'deleted_admin', 'user_management', "Deleted admin: {$adminName}", $ip);
    }

    public function reportResolved(int $userId, int $reportId, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'resolved_report', 'report_moderation', "Resolved report #{$reportId}", $ip);
    }

    public function taskModerated(int $userId, string $action, string $taskTitle, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, $action, 'task_moderation', "{$action} task: {$taskTitle}", $ip);
    }

    public function certificateAction(int $userId, string $action, string $certNumber, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, $action, 'certificate', "{$action} certificate: {$certNumber}", $ip);
    }

    public function certificateIssued(int $userId, string $certNumber, ?string $ip = null): ActivityLog
    {
        return $this->certificateAction($userId, 'issued', $certNumber, $ip);
    }

    public function reviewRemoved(int $userId, int $reviewId, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'removed_review', 'review_moderation', "Removed review #{$reviewId}", $ip);
    }

    public function settingsUpdated(int $userId, string $group, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'updated_settings', 'system', "Updated {$group} settings", $ip);
    }

    public function exportGenerated(int $userId, string $exportType, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'exported_data', 'export', "Exported {$exportType}", $ip);
    }

    public function passwordChanged(int $userId, ?string $ip = null): ActivityLog
    {
        return $this->log($userId, 'changed_password', 'account', 'Changed password', $ip);
    }
}
