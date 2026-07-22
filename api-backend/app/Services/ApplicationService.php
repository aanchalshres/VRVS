<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Task;
use App\Models\VolunteerProfile;
use Illuminate\Database\Eloquent\Collection;

class ApplicationService
{
    public function apply(int $taskId, VolunteerProfile $profile, ?string $message = null): Application
    {
        $task = Task::with('ngo')->findOrFail($taskId);

        if (!$task->ngo || $task->ngo->verification_status !== 'verified') {
            abort(403, 'Cannot apply to this task');
        }

        if (!in_array($task->status, ['Open', 'Ongoing'])) {
            abort(400, 'This task is no longer accepting applications');
        }

        $existing = Application::where('task_id', $taskId)
            ->where('volunteer_profile_id', $profile->id)
            ->whereIn('status', ['Pending', 'Shortlisted', 'Accepted'])
            ->first();

        if ($existing) {
            abort(409, 'You have already applied to this task');
        }

        $acceptedCount = Application::where('task_id', $taskId)
            ->where('status', 'Accepted')
            ->count();

        if ($task->required_volunteers && $acceptedCount >= $task->required_volunteers) {
            abort(400, 'This task has reached its volunteer limit');
        }

        $application = Application::create([
            'task_id' => (int) $taskId,
            'volunteer_profile_id' => $profile->id,
            'status' => 'Pending',
            'applied_at' => now(),
            'remarks' => $message,
        ]);

        return $application->fresh()->load('task.ngo.user');
    }

    public function withdraw(int $applicationId, VolunteerProfile $profile): Application
    {
        $application = Application::where('id', $applicationId)
            ->where('volunteer_profile_id', $profile->id)
            ->firstOrFail();

        if (!in_array($application->status, ['Pending', 'Shortlisted'])) {
            abort(400, 'This application cannot be withdrawn');
        }

        $application->update([
            'status' => 'Withdrawn',
        ]);

        return $application->fresh()->load('task.ngo.user');
    }

    public function getApplications(VolunteerProfile $profile): Collection
    {
        return Application::where('volunteer_profile_id', $profile->id)
            ->with(['task', 'task.ngo.user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAssignedTasks(VolunteerProfile $profile): Collection
    {
        return Application::where('volunteer_profile_id', $profile->id)
            ->where('status', 'Accepted')
            ->with([
                'task',
                'task.ngo.user',
                'task.skills',
                'task.category',
            ])
            ->orderBy('reviewed_at', 'desc')
            ->get();
    }
}
