<?php

namespace App\Algorithms\Contracts;

use App\Models\VolunteerProfile;

interface ConflictDetectionInterface
{
    public function checkTask(int $volunteerProfileId, int $taskId): array;
    public function checkVolunteerSchedule(VolunteerProfile $profile, ?\DateTime $from = null, ?\DateTime $to = null): array;
    public function resolve(int $conflictId, string $resolution, int $resolvedBy): array;
}
