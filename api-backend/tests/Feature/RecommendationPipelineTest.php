<?php

uses(Tests\TestCase::class);

use App\Models\VolunteerProfile;
use App\Models\Task;
use App\Models\User;
use App\Models\NgoProfile;
use App\Models\Skill;
use App\Services\RecommendationService;
use App\Services\TrustScoreService;
use App\Services\TfIdfGenerationService;
use App\Algorithms\Matching\CosineSimilarity;
use App\Algorithms\Matching\HaversineDistance;
use App\Algorithms\Assignment\HungarianMatcher;
use App\Services\AssignmentService;

beforeEach(function () {
    $ngoUser = User::factory()->create(['role' => 'ngo', 'is_active' => true]);
    $this->ngo = NgoProfile::factory()->create([
        'user_id' => $ngoUser->id,
        'verification_status' => 'verified',
    ]);
});

it('runs the complete recommendation pipeline end-to-end', function () {
    $skill = Skill::factory()->create(['name' => 'Teaching']);

    $volUser = User::factory()->create(['role' => 'volunteer', 'is_active' => true]);
    $volunteer = VolunteerProfile::factory()->create([
        'user_id' => $volUser->id,
        'bio' => 'Experienced teacher passionate about education',
        'latitude' => 27.7172,
        'longitude' => 85.3240,
        'availability' => 'Available',
        'trust_score' => 0.8,
        'trust_score_components' => ['attendance' => 1, 'completion' => 1, 'ratings' => 0.7, 'verification' => 1, 'response' => 0.8, 'penalties' => 0],
        'trust_updated_at' => now(),
    ]);
    $volunteer->skills()->attach($skill->id);

    $task = Task::factory()->create([
        'ngo_id' => $this->ngo->id,
        'title' => 'Teaching volunteer needed',
        'description' => 'Looking for volunteers to teach children',
        'latitude' => 27.7172,
        'longitude' => 85.3240,
        'status' => 'Open',
        'selection_logic' => 'recommendation',
    ]);
    $task->skills()->attach($skill->id);

    $tfidfService = app(TfIdfGenerationService::class);
    $tfidfService->generateForVolunteer($volunteer);
    $tfidfService->generateForTask($task);

    $volunteer->refresh();
    $task->refresh();

    expect($volunteer->tfidf_vector)->not->toBeEmpty();
    expect($task->tfidf_vector)->not->toBeEmpty();

    $recommendationService = app(RecommendationService::class);
    $scores = $recommendationService->computeAllScores($volunteer, $task);

    expect($scores['recommendation_score'])->toBeGreaterThan(0);
    expect($scores['semantic_match_score'])->toBeGreaterThan(0);
    expect($scores['distance_score'])->toBe(1.0);
    expect($scores['skill_overlap_score'])->toBeGreaterThan(0);
    expect($scores['trust_score'])->toBe(0.8);

    $volunteerScore = $recommendationService->computeVolunteerTaskScore($volunteer, $task);
    expect($volunteerScore)->toBeGreaterThan(0);

    $matchScore = $recommendationService->computeVolunteerTaskMatchScore($volunteer, $task);
    expect($matchScore)->toBe($scores['recommendation_score']);
});

it('ranks volunteers for a task', function () {
    $skill = Skill::factory()->create(['name' => 'Teaching']);

    $volunteers = [];
    for ($i = 0; $i < 3; $i++) {
        $u = User::factory()->create(['role' => 'volunteer', 'is_active' => true]);
        $vp = VolunteerProfile::factory()->create([
            'user_id' => $u->id,
            'availability' => 'Available',
            'trust_score' => 0.5 + ($i * 0.2),
            'trust_updated_at' => now(),
            'tfidf_vector' => ['teaching' => 0.5 + ($i * 0.2)],
        ]);
        $vp->skills()->attach($skill->id);
        $volunteers[] = $vp;
    }

    $task = Task::factory()->create([
        'ngo_id' => $this->ngo->id,
        'status' => 'Open',
        'tfidf_vector' => ['teaching' => 0.8],
    ]);
    $task->skills()->attach($skill->id);

    $service = app(RecommendationService::class);
    $ranked = $service->rankVolunteersForTask($task);

    expect($ranked)->toHaveCount(3);

    $scores = $ranked->pluck('recommendation_score')->toArray();
    for ($i = 0; $i < count($scores) - 1; $i++) {
        expect($scores[$i])->toBeGreaterThanOrEqual($scores[$i + 1]);
    }
});

it('ranks tasks for a volunteer', function () {
    $skill = Skill::factory()->create(['name' => 'Teaching']);

    $volUser = User::factory()->create(['role' => 'volunteer', 'is_active' => true]);
    $volunteer = VolunteerProfile::factory()->create([
        'user_id' => $volUser->id,
        'availability' => 'Available',
        'trust_score' => 0.8,
        'trust_updated_at' => now(),
        'tfidf_vector' => ['teaching' => 0.8],
    ]);
    $volunteer->skills()->attach($skill->id);

    $tasks = [];
    for ($i = 0; $i < 3; $i++) {
        $t = Task::factory()->create([
            'ngo_id' => $this->ngo->id,
            'status' => 'Open',
            'tfidf_vector' => ['teaching' => 0.3 + ($i * 0.2)],
        ]);
        $t->skills()->attach($skill->id);
        $tasks[] = $t;
    }

    $service = app(RecommendationService::class);
    $ranked = $service->rankTasksForVolunteer($volunteer);

    expect($ranked)->toHaveCount(3);

    $scores = $ranked->pluck('recommendation_score')->toArray();
    for ($i = 0; $i < count($scores) - 1; $i++) {
        expect($scores[$i])->toBeGreaterThanOrEqual($scores[$i + 1]);
    }
});

it('persists trust score components through recalculate', function () {
    $volUser = User::factory()->create(['role' => 'volunteer', 'is_active' => true]);
    $volunteer = VolunteerProfile::factory()->create([
        'user_id' => $volUser->id,
    ]);

    $trustService = app(TrustScoreService::class);
    $refreshed = $trustService->recalculate($volunteer);

    expect($refreshed->trust_score)->toBeFloat();
    expect($refreshed->trust_score_components)->toBeArray();
    expect($refreshed->trust_score_components['final_score'] ?? null)->toBeNull();

    $dbProfile = VolunteerProfile::find($volunteer->id);
    expect($dbProfile->trust_score)->toBe($refreshed->trust_score);
    expect($dbProfile->trust_score_components)->toBe($refreshed->trust_score_components);
});

it('generates shortlist with correct scores', function () {
    $skill = Skill::factory()->create(['name' => 'Teaching']);

    $volUser = User::factory()->create(['role' => 'volunteer', 'is_active' => true]);
    $volunteer = VolunteerProfile::factory()->create([
        'user_id' => $volUser->id,
        'availability' => 'Available',
        'trust_score' => 0.8,
        'trust_updated_at' => now(),
        'tfidf_vector' => ['teaching' => 0.8],
    ]);
    $volunteer->skills()->attach($skill->id);

    $task = Task::factory()->create([
        'ngo_id' => $this->ngo->id,
        'status' => 'Open',
        'tfidf_vector' => ['teaching' => 0.8],
        'selection_logic' => 'recommendation',
    ]);
    $task->skills()->attach($skill->id);

    $workflowService = app(\App\Services\WorkflowService::class);
    $shortlist = $workflowService->generateShortlist($task, 5, 'recommendation');

    expect($shortlist)->toHaveCount(1);
    expect($shortlist[0]->shortlist_rank)->toBe(1);

    $shortlistEntry = \App\Models\Shortlist::where('task_id', $task->id)->first();
    expect($shortlistEntry)->not->toBeNull();
    expect($shortlistEntry->recommendation_score)->not->toBeNull();
    expect($shortlistEntry->semantic_match_score)->not->toBeNull();
});

it('performs optimal assignment via hungarian algorithm', function () {
    $skill = Skill::factory()->create(['name' => 'Coding']);

    $volUser = User::factory()->create(['role' => 'volunteer', 'is_active' => true]);
    $volunteer = VolunteerProfile::factory()->create([
        'user_id' => $volUser->id,
        'availability' => 'Available',
        'trust_score' => 0.8,
        'trust_updated_at' => now(),
        'tfidf_vector' => ['coding' => 0.9],
    ]);
    $volunteer->skills()->attach($skill->id);

    $task = Task::factory()->create([
        'ngo_id' => $this->ngo->id,
        'status' => 'Open',
        'tfidf_vector' => ['coding' => 0.9],
    ]);
    $task->skills()->attach($skill->id);

    $application = \App\Models\Application::factory()->create([
        'task_id' => $task->id,
        'volunteer_profile_id' => $volunteer->id,
        'status' => 'Pending',
    ]);

    $assignmentService = app(AssignmentService::class);
    $result = $assignmentService->batchAssign(
        [$application->id],
        [$task->id]
    );

    expect($result)->toHaveCount(1);
    expect($result[0]['status'])->toBe('Accepted');
    expect($result[0]['match_score'])->toBeGreaterThan(0);
});

it('verifies database consistency after pipeline execution', function () {
    $skill = Skill::factory()->create(['name' => 'Teaching']);

    $volUser = User::factory()->create(['role' => 'volunteer', 'is_active' => true]);
    $volunteer = VolunteerProfile::factory()->create([
        'user_id' => $volUser->id,
        'bio' => 'Experienced teacher',
        'availability' => 'Available',
    ]);

    $volunteer->skills()->attach($skill->id);
    $tfidfService = app(TfIdfGenerationService::class);
    $tfidfService->generateForVolunteer($volunteer);
    $volunteer->refresh();
    expect($volunteer->tfidf_vector)->not->toBeEmpty();

    $trustService = app(TrustScoreService::class);
    $trustService->recalculate($volunteer);
    $volunteer->refresh();

    expect($volunteer->trust_score)->not->toBeNull();
    expect($volunteer->trust_score_components)->not->toBeNull();
    expect($volunteer->trust_updated_at)->not->toBeNull();
});
