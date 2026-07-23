<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\Task;
use App\Models\VolunteerProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'task_id' => Task::factory(),
            'volunteer_profile_id' => VolunteerProfile::factory(),
            'status' => 'Pending',
            'applied_at' => now(),
        ];
    }
}
