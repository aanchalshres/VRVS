<?php

namespace App\Console\Commands;

use App\Models\VolunteerProfile;
use App\Services\TrustScoreService;
use Illuminate\Console\Command;

class RecalculateTrustScores extends Command
{
    protected $signature = 'trust:recalculate {--volunteer= : Recalculate for a specific volunteer profile ID}';
    protected $description = 'Recalculate trust scores for all volunteer profiles';

    public function handle(TrustScoreService $trustService): int
    {
        if ($volunteerId = $this->option('volunteer')) {
            $profile = VolunteerProfile::findOrFail($volunteerId);
            $fresh = $trustService->recalculate($profile);

            $this->info("Trust score recalculated for volunteer #{$volunteerId}: {$fresh->trust_score}");
            $this->line(json_encode($fresh->trust_score_components, JSON_PRETTY_PRINT));

            return Command::SUCCESS;
        }

        $count = $trustService->recalculateAll();

        $this->info("Recalculated trust scores for {$count} volunteers.");

        return Command::SUCCESS;
    }
}
