<?php

namespace App\Providers;

use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Observers\TaskObserver;
use App\Observers\VolunteerProfileObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        VolunteerProfile::observe(VolunteerProfileObserver::class);
        Task::observe(TaskObserver::class);
    }
}
