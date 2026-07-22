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
            $result = $trustService->calculateForVolunteer($profile);

            $profile->updateQuietly([
                'trust_score' => $result['final_score'],
                'trust_score_components' => $result['components'],
                'trust_updated_at' => now(),
            ]);

            $this->info("Trust score recalculated for volunteer #{$volunteerId}: {$result['final_score']}");
            $this->line(json_encode($result['components'], JSON_PRETTY_PRINT));

            return Command::SUCCESS;
        }

        $count = 0;
        VolunteerProfile::chunk(100, function ($profiles) use ($trustService, &$count) {
            foreach ($profiles as $profile) {
                $result = $trustService->calculateForVolunteer($profile);

                $profile->updateQuietly([
                    'trust_score' => $result['final_score'],
                    'trust_score_components' => $result['components'],
                    'trust_updated_at' => now(),
                ]);
                $count++;
            }
        });

        $this->info("Recalculated trust scores for {$count} volunteers.");

        return Command::SUCCESS;
    }
}
