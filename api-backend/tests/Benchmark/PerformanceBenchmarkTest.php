<?php

use App\Models\VolunteerProfile;
use App\Models\Task;
use App\Models\User;
use App\Models\NgoProfile;
use App\Models\Skill;
use App\Services\RecommendationService;
use App\Services\TrustScoreService;
use App\Algorithms\Matching\TfIdfVectorizer;
use App\Algorithms\Matching\CosineSimilarity;
use App\Algorithms\Assignment\HungarianMatcher;

uses(Tests\TestCase::class);

beforeEach(function () {
    $ngoUser = User::factory()->create(['role' => 'ngo', 'is_active' => true]);
    $this->ngo = NgoProfile::factory()->create([
        'user_id' => $ngoUser->id,
        'verification_status' => 'verified',
    ]);
});

function createDataset(int $volunteerCount, int $taskCount, $ngo): void
{
    $skillNames = ['Teaching', 'Healthcare', 'Environment', 'Technology', 'Education',
                   'Agriculture', 'Construction', 'Cooking', 'Driving', 'Counseling',
                   'Music', 'Art', 'Sports', 'Accounting', 'Management'];

    $skills = [];
    foreach ($skillNames as $name) {
        $skills[] = Skill::factory()->create(['name' => $name]);
    }

    for ($i = 0; $i < $volunteerCount; $i++) {
        $user = User::factory()->create(['role' => 'volunteer', 'is_active' => true]);
        $profile = VolunteerProfile::factory()->create([
            'user_id' => $user->id,
            'bio' => 'Volunteer with experience in ' . $skills[array_rand($skills)]->name,
            'latitude' => fake()->latitude(26, 30),
            'longitude' => fake()->longitude(80, 88),
            'availability' => 'Available',
            'trust_score' => fake()->randomFloat(2, 0.3, 1.0),
            'trust_updated_at' => now(),
            'tfidf_vector' => generateVector($skills),
        ]);
        $profile->skills()->attach($skills[array_rand($skills)]->id);
    }

    for ($i = 0; $i < $taskCount; $i++) {
        $task = Task::factory()->create([
            'ngo_id' => $ngo->id,
            'title' => 'Task requiring ' . $skills[array_rand($skills)]->name,
            'description' => 'We need volunteers for ' . $skills[array_rand($skills)]->name . ' related activities',
            'latitude' => fake()->latitude(26, 30),
            'longitude' => fake()->longitude(80, 88),
            'status' => 'Open',
            'tfidf_vector' => generateVector($skills),
        ]);
        $task->skills()->attach($skills[array_rand($skills)]->id);
    }
}

function generateVector(array $skills): array
{
    $vector = [];
    foreach ($skills as $skill) {
        if (rand(0, 1)) {
            $vector[strtolower($skill->name)] = round(rand(1, 100) / 100, 4);
        }
    }
    return $vector ?: ['general' => 0.5];
}

it('benchmarks 100 volunteers ranking', function () {
    createDataset(100, 10, $this->ngo);

    $task = Task::first();
    $service = app(RecommendationService::class);

    $start = microtime(true);
    $ranked = $service->rankVolunteersForTask($task);
    $duration = microtime(true) - $start;

    expect($ranked)->toHaveCount(100);
    expect($duration)->toBeLessThan(30);

    $this->addToAssertionCount(1);
})->group('benchmark');

it('benchmarks 500 volunteers ranking', function () {
    createDataset(500, 10, $this->ngo);

    $task = Task::first();
    $service = app(RecommendationService::class);

    $start = microtime(true);
    $ranked = $service->rankVolunteersForTask($task);
    $duration = microtime(true) - $start;

    expect($ranked)->toHaveCount(500);
    expect($duration)->toBeLessThan(120);

    $this->addToAssertionCount(1);
})->group('benchmark');

it('benchmarks 1000 volunteers ranking', function () {
    createDataset(1000, 10, $this->ngo);

    $task = Task::first();
    $service = app(RecommendationService::class);

    $start = microtime(true);
    $ranked = $service->rankVolunteersForTask($task);
    $duration = microtime(true) - $start;

    expect($ranked)->toHaveCount(1000);
    expect($duration)->toBeLessThan(300);

    $this->addToAssertionCount(1);
})->group('benchmark');

it('benchmarks hungarian matcher with increasing matrix sizes', function () {
    $matcher = new HungarianMatcher();

    $sizes = [10, 50, 100];

    foreach ($sizes as $n) {
        $matrix = [];
        for ($i = 0; $i < $n; $i++) {
            $row = [];
            for ($j = 0; $j < $n; $j++) {
                $row[] = round(fake()->randomFloat(4, 0, 1), 4);
            }
            $matrix[] = $row;
        }

        $start = microtime(true);
        $result = $matcher->solve($matrix);
        $duration = microtime(true) - $start;

        expect($result)->toHaveCount($n);
        expect($duration)->toBeLessThan(60);
    }

    $this->addToAssertionCount(1);
})->group('benchmark');

it('benchmarks tfidf vectorizer throughput', function () {
    $vectorizer = new TfIdfVectorizer();

    $docCounts = [10, 100, 500];

    foreach ($docCounts as $count) {
        $docs = [];
        for ($i = 0; $i < $count; $i++) {
            $words = [];
            $wordCount = rand(10, 50);
            for ($j = 0; $j < $wordCount; $j++) {
                $words[] = fake()->word();
            }
            $docs[] = ['id' => $i + 1, 'text' => implode(' ', $words)];
        }

        $start = microtime(true);
        $result = $vectorizer->compute($docs);
        $duration = microtime(true) - $start;

        expect($result)->toHaveCount($count);
        expect($duration)->toBeLessThan(30);
    }

    $this->addToAssertionCount(1);
})->group('benchmark');

it('benchmarks cosine similarity throughput', function () {
    $similarity = new CosineSimilarity();

    $vectorPairs = 10000;
    $start = microtime(true);

    for ($i = 0; $i < $vectorPairs; $i++) {
        $v1 = [];
        $v2 = [];
        $terms = rand(5, 20);
        for ($j = 0; $j < $terms; $j++) {
            $term = 'term' . $j;
            $v1[$term] = round(rand(1, 100) / 100, 4);
            $v2[$term] = round(rand(1, 100) / 100, 4);
        }
        $similarity->calculate($v1, $v2);
    }

    $duration = microtime(true) - $start;
    expect($duration)->toBeLessThan(10);

    $this->addToAssertionCount(1);
})->group('benchmark');

it('benchmarks trust score calculation', function () {
    $service = app(TrustScoreService::class);

    $profiles = VolunteerProfile::factory(50)->create();

    $start = microtime(true);
    $count = $service->recalculateAll();
    $duration = microtime(true) - $start;

    expect($count)->toBe(50);
    expect($duration)->toBeLessThan(30);

    $this->addToAssertionCount(1);
})->group('benchmark');

it('benchmarks recommendation cache', function () {
    $task = Task::factory()->create([
        'tfidf_vector' => ['teaching' => 0.5, 'science' => 0.3],
        'status' => 'Open',
    ]);

    $volunteer = VolunteerProfile::factory()->create([
        'tfidf_vector' => ['teaching' => 0.5, 'science' => 0.3],
        'trust_score' => 0.8,
        'trust_updated_at' => now(),
        'availability' => 'Available',
    ]);

    $service = app(RecommendationService::class);

    $service->computeAllScores($volunteer, $task);

    $start = microtime(true);
    for ($i = 0; $i < 1000; $i++) {
        $service->computeAllScores($volunteer, $task);
    }
    $duration = microtime(true) - $start;

    expect($duration)->toBeLessThan(5);

    $this->addToAssertionCount(1);
})->group('benchmark');
