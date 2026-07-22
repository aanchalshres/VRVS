<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\VolunteerProfile;
use App\Services\TfIdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecomputeTfIdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(TfIdfService $tfidf): void
    {
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
            $tfidf
        );
        $this->computeFor(
            Task::with('skills')->get(),
            fn($t) => implode(' ', array_filter([
                $t->title ?? '',
                $t->description ?? '',
                $t->skills->pluck('name')->implode(' '),
            ])),
            $tfidf
        );
    }
    private function computeFor($records, callable $textExtractor, TfIdfService $tfidf): void
    {
        $docs = $records->map(fn($r) => [
            'id'   => $r->id,
            'text' => $textExtractor($r),
        ])->toArray();

        $vectors = $tfidf->compute($docs);

        foreach ($records as $record) {
            $record->update(['tfidf_vector' => $vectors[$record->id] ?? []]);
        }
    }
}
