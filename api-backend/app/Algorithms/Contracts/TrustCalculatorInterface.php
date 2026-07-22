<?php

namespace App\Algorithms\Contracts;

use App\Models\VolunteerProfile;

interface TrustCalculatorInterface
{
    public function calculateForVolunteer(VolunteerProfile $profile): array;

    public function recalculate(VolunteerProfile $profile): VolunteerProfile;

    public function recalculateAll(): int;
}
