<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\TfIdfGenerationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecomputeTfIdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(TfIdfGenerationService $tfidf): void
    {
        VolunteerProfile::with('skills')->chunk(100, function ($profiles) use ($tfidf) {
            foreach ($profiles as $profile) {
                $tfidf->generateForVolunteer($profile);
            }
        });

        Task::with(['skills', 'category'])->chunk(100, function ($tasks) use ($tfidf) {
            foreach ($tasks as $task) {
                $tfidf->generateForTask($task);
            }
        });
    }
}
