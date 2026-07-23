<?php

uses(Tests\TestCase::class);

use App\Services\AssignmentService;
use App\Algorithms\Assignment\HungarianMatcher;
use App\Models\Application;
use App\Models\Task;
use App\Models\VolunteerProfile;

it('batch assigns volunteers to tasks optimally', function () {
    $volunteer1 = VolunteerProfile::factory()->create(['tfidf_vector' => ['a' => 1.0]]);
    $volunteer2 = VolunteerProfile::factory()->create(['tfidf_vector' => ['b' => 1.0]]);

    $task1 = Task::factory()->create(['tfidf_vector' => ['a' => 1.0], 'status' => 'Open']);
    $task2 = Task::factory()->create(['tfidf_vector' => ['b' => 1.0], 'status' => 'Open']);

    $app1 = Application::factory()->create([
        'volunteer_profile_id' => $volunteer1->id,
        'task_id' => $task1->id,
        'status' => 'Pending',
    ]);

    $app2 = Application::factory()->create([
        'volunteer_profile_id' => $volunteer2->id,
        'task_id' => $task2->id,
        'status' => 'Pending',
    ]);

    $service = app(AssignmentService::class);
    $result = $service->batchAssign(
        [$app1->id, $app2->id],
        [$task1->id, $task2->id]
    );

    expect($result)->toHaveCount(2);
    expect($result[0]['status'])->toBe('Accepted');
    expect($result[1]['status'])->toBe('Accepted');
});

it('returns empty array for no applications', function () {
    $service = app(AssignmentService::class);
    $result = $service->batchAssign([], []);

    expect($result)->toBe([]);
});

it('handles mismatched volunteer-task assignments', function () {
    $volunteer = VolunteerProfile::factory()->create(['tfidf_vector' => ['a' => 1.0]]);
    $task = Task::factory()->create(['tfidf_vector' => ['b' => 1.0], 'status' => 'Open']);

    $app = Application::factory()->create([
        'volunteer_profile_id' => $volunteer->id,
        'task_id' => $task->id,
        'status' => 'Pending',
    ]);

    $service = app(AssignmentService::class);
    $result = $service->batchAssign([$app->id], [$task->id]);

    expect($result)->toHaveCount(1);
    expect($result[0]['match_score'])->toBeGreaterThanOrEqual(0);
});

it('uses hungarian solver for optimal assignment', function () {
    $solver = app(HungarianMatcher::class);

    $matrix = [
        [0.9, 0.1],
        [0.1, 0.9],
    ];

    $result = $solver->solve($matrix);

    expect($result[0])->toBe(1);
    expect($result[1])->toBe(0);
});

it('walks through assignment pipeline correctly', function () {
    $volunteer1 = VolunteerProfile::factory()->create(['tfidf_vector' => ['teaching' => 0.8, 'math' => 0.6], 'latitude' => 27.7, 'longitude' => 85.3, 'availability' => 'Available', 'trust_score' => 0.8, 'trust_updated_at' => now()]);
    $volunteer2 = VolunteerProfile::factory()->create(['tfidf_vector' => ['science' => 0.9], 'latitude' => 27.8, 'longitude' => 85.4, 'availability' => 'Available', 'trust_score' => 0.6, 'trust_updated_at' => now()]);

    $task1 = Task::factory()->create(['tfidf_vector' => ['teaching' => 0.7, 'math' => 0.5], 'latitude' => 27.7, 'longitude' => 85.3, 'status' => 'Open']);
    $task2 = Task::factory()->create(['tfidf_vector' => ['science' => 0.8], 'latitude' => 27.8, 'longitude' => 85.4, 'status' => 'Open']);

    $app1 = Application::factory()->create([
        'volunteer_profile_id' => $volunteer1->id,
        'task_id' => $task1->id,
        'status' => 'Pending',
    ]);
    $app2 = Application::factory()->create([
        'volunteer_profile_id' => $volunteer2->id,
        'task_id' => $task2->id,
        'status' => 'Pending',
    ]);

    $service = app(AssignmentService::class);
    $result = $service->batchAssign([$app1->id, $app2->id], [$task1->id, $task2->id]);

    expect($result)->toHaveCount(2);
    expect($result[0]['application_id'])->toBe($app1->id);
    expect($result[1]['application_id'])->toBe($app2->id);
});
