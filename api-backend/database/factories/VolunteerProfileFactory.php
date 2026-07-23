<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VolunteerProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class VolunteerProfileFactory extends Factory
{
    protected $model = VolunteerProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'bio' => fake()->paragraph(),
            'primary_location' => fake()->city(),
            'city' => fake()->city(),
            'country' => 'Nepal',
            'latitude' => fake()->latitude(26, 30),
            'longitude' => fake()->longitude(80, 88),
            'availability' => 'Available',
            'trust_score' => 0.5,
            'trust_updated_at' => now(),
            'trust_score_components' => [
                'attendance' => 0.5,
                'completion' => 0.5,
                'ratings' => 0.5,
                'verification' => 0.5,
                'response' => 0.5,
                'penalties' => 0,
            ],
            'total_service_hours' => 0,
            'average_rating' => 0,
        ];
    }
}
