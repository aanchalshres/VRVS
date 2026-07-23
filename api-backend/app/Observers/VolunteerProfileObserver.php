<?php

namespace App\Observers;

use App\Models\VolunteerProfile;
use App\Services\TfIdfGenerationService;

class VolunteerProfileObserver
{
    public function __construct(
        private TfIdfGenerationService $tfidf,
    ) {}

    public function saved(VolunteerProfile $profile): void
    {
        if ($profile->wasChanged(['bio', 'primary_location', 'city', 'country'])) {
            $profile->loadMissing('skills');
            $this->tfidf->generateForVolunteer($profile);
        }
    }
}
