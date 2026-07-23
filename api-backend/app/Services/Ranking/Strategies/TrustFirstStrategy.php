<?php

namespace App\Services\Ranking\Strategies;

use App\Services\Ranking\RankingStrategyInterface;

class TrustFirstStrategy implements RankingStrategyInterface
{
    public function getWeights(): array
    {
        return config('workflow.strategies.trust_first.weights');
    }

    public function calculateScore(array $scores): float
    {
        $w = $this->getWeights();
        return min(1.0, max(0.01,
            ($w['semantic'] * ($scores['semantic_match_score'] ?? 0)) +
            ($w['distance'] * ($scores['distance_score'] ?? 0)) +
            ($w['skill'] * ($scores['skill_overlap_score'] ?? 0)) +
            ($w['availability'] * ($scores['availability_score'] ?? 0)) +
            ($w['trust'] * ($scores['trust_score'] ?? 0.5))
        ));
    }

    public function getStrategyName(): string
    {
        return 'trust_first';
    }
}
