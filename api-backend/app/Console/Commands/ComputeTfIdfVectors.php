<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\TfIdfGenerationService;
use Illuminate\Console\Command;

class ComputeTfIdfVectors extends Command
{
    protected $signature   = 'tfidf:compute {--type=all : volunteers|tasks|all}';
    protected $description = 'Pre-compute TF-IDF vectors for volunteer profiles and tasks';

    public function handle(TfIdfGenerationService $tfidf): int
    {
        $type = $this->option('type');

        if (in_array($type, ['volunteers', 'all'])) {
            $this->info('Computing TF-IDF for volunteer_profiles...');
            $count = 0;
            VolunteerProfile::with('skills')->chunk(100, function ($profiles) use ($tfidf, &$count) {
                foreach ($profiles as $profile) {
                    $profile->loadMissing('skills');
                    $tfidf->generateForVolunteer($profile);
                    $count++;
                }
            });
            $this->info("  ✓ Updated {$count} volunteer_profiles records.");
        }

        if (in_array($type, ['tasks', 'all'])) {
            $this->info('Computing TF-IDF for tasks...');
            $count = 0;
            Task::with(['skills', 'category'])->chunk(100, function ($tasks) use ($tfidf, &$count) {
                foreach ($tasks as $task) {
                    $task->loadMissing(['skills', 'category']);
                    $tfidf->generateForTask($task);
                    $count++;
                }
            });
            $this->info("  ✓ Updated {$count} tasks records.");
        }

        return Command::SUCCESS;
    }
}
