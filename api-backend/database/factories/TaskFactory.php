<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'ngo_id' => \App\Models\NgoProfile::factory(),
            'category_id' => Category::factory(),
            'title' => $title,
            'slug' => Str::slug($title) . '-' . fake()->unique()->randomNumber(5),
            'description' => fake()->paragraphs(3, true),
            'task_type' => fake()->randomElement(['Event', 'Emergency', 'Campaign', 'Task']),
            'selection_logic' => fake()->randomElement(['FCFS', 'Weighted', 'recommendation']),
            'location' => fake()->address(),
            'city' => fake()->city(),
            'country' => 'Nepal',
            'latitude' => fake()->latitude(26, 30),
            'longitude' => fake()->longitude(80, 88),
            'required_volunteers' => fake()->numberBetween(1, 20),
            'start_date' => fake()->dateTimeBetween('now', '+1 month'),
            'end_date' => fake()->dateTimeBetween('+1 month', '+2 months'),
            'urgency_level' => fake()->randomElement(['Low', 'Medium', 'High']),
            'status' => 'Draft',
            'created_by' => User::factory(),
        ];
    }
}
