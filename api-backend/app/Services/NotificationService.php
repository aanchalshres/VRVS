<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function create(int $userId, string $title, string $message, string $type): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'is_read' => false,
        ]);
    }

    public function newApplication(int $ngoUserId, string $volunteerName, string $taskTitle, int $applicationId): void
    {
        $this->create(
            $ngoUserId,
            'New Application',
            "{$volunteerName} applied for {$taskTitle}",
            'volunteer_applied'
        );
    }

    public function applicationWithdrawn(int $ngoUserId, string $volunteerName, string $taskTitle): void
    {
        $this->create(
            $ngoUserId,
            'Application Withdrawn',
            "{$volunteerName} withdrew application for {$taskTitle}",
            'volunteer_withdrawn'
        );
    }

    public function volunteerAccepted(int $volunteerUserId, string $ngoName, string $taskTitle): void
    {
        $this->create(
            $volunteerUserId,
            'Application Accepted',
            "Your application for {$taskTitle} at {$ngoName} has been accepted",
            'application_accepted'
        );
    }

    public function volunteerRejected(int $volunteerUserId, string $ngoName, string $taskTitle): void
    {
        $this->create(
            $volunteerUserId,
            'Application Rejected',
            "Your application for {$taskTitle} at {$ngoName} has been rejected",
            'application_rejected'
        );
    }

    public function verificationApproved(int $ngoUserId): void
    {
        $this->create(
            $ngoUserId,
            'Verification Approved',
            'Your organization has been verified. You can now post opportunities.',
            'verification_approved'
        );
    }

    public function verificationRejected(int $ngoUserId, string $reason): void
    {
        $this->create(
            $ngoUserId,
            'Verification Rejected',
            "Your verification was rejected. Reason: {$reason}",
            'verification_rejected'
        );
    }

    public function upcomingReminder(int $ngoUserId, string $taskTitle, string $date): void
    {
        $this->create(
            $ngoUserId,
            'Upcoming Opportunity Reminder',
            "{$taskTitle} starts on {$date}",
            'upcoming_reminder'
        );
    }
}
