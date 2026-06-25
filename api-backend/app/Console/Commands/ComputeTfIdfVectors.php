<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\TfIdfService;
use Illuminate\Console\Command;

class ComputeTfIdfVectors extends Command
{
    protected $signature   = 'tfidf:compute {--type=all : volunteers|tasks|all}';
    protected $description = 'Pre-compute TF-IDF vectors for volunteer profiles and tasks';

    public function handle(TfIdfService $tfidf): int
    {
        $type = $this->option('type');

        if (in_array($type, ['volunteers', 'all'])) {
          $this->computeFor(
            VolunteerProfile::with('skills', 'serviceLogs.task')->get(),
            fn($v) => implode(' ', array_filter([
                $v->bio ?? '',
                $v->skills->pluck('name')->implode(' '),
                $v->serviceLogs
                    ->where('participation_status', 'completed')
                    ->map(fn($log) => $log->task->title . ' ' . $log->task->description)
                    ->implode(' '),
            ])),
            'volunteer_profiles',
            $tfidf
          );
        }

        if (in_array($type, ['tasks', 'all'])) {
            $this->computeFor(
                Task::with('skills')->get(),
                fn($t) => implode(' ', array_filter([
                    $t->title ?? '',
                    $t->description ?? '',
                    $t->skills->pluck('name')->implode(' '),
                ])),
                'tasks',
                $tfidf
            );
        }

        return Command::SUCCESS;
    }

    private function computeFor($records, callable $textExtractor, string $label, TfIdfService $tfidf): void
    {
        $this->info("Computing TF-IDF for {$label}...");

        $docs = $records->map(fn($r) => [
            'id'   => $r->id,
            'text' => $textExtractor($r),
        ])->toArray();

        $vectors = $tfidf->compute($docs);

        foreach ($records as $record) {
            $record->update(['tfidf_vector' => $vectors[$record->id] ?? []]);
        }

        $this->info("  ✓ Updated " . count($vectors) . " {$label} records.");
    }
}
