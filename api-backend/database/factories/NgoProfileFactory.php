<?php

namespace Database\Factories;

use App\Models\NgoProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NgoProfileFactory extends Factory
{
    protected $model = NgoProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'organization_name' => fake()->company(),
            'registration_number' => fake()->unique()->numerify('REG-####'),
            'description' => fake()->paragraph(),
            'office_location' => fake()->address(),
            'city' => fake()->city(),
            'country' => 'Nepal',
            'latitude' => fake()->latitude(26, 30),
            'longitude' => fake()->longitude(80, 88),
            'verification_status' => 'pending',
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'verified',
        ]);
    }
}
