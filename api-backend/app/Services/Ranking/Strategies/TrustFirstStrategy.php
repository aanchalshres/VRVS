<?php

namespace App\Services\Ranking\Strategies;

use App\Services\Ranking\RankingStrategyInterface;

class TrustFirstStrategy implements RankingStrategyInterface
{
    private array $weights = [
        'semantic' => 0.15,
        'distance' => 0.10,
        'skill' => 0.15,
        'availability' => 0.10,
        'trust' => 0.50,
    ];

    public function getWeights(): array
    {
        return $this->weights;
    }

    public function calculateScore(array $scores): float
    {
        return min(1.0, max(0.01,
            ($this->weights['semantic'] * ($scores['semantic_match_score'] ?? 0)) +
            ($this->weights['distance'] * ($scores['distance_score'] ?? 0)) +
            ($this->weights['skill'] * ($scores['skill_overlap_score'] ?? 0)) +
            ($this->weights['availability'] * ($scores['availability_score'] ?? 0)) +
            ($this->weights['trust'] * ($scores['trust_score'] ?? 0.5))
        ));
    }

    public function getStrategyName(): string
    {
        return 'trust_first';
    }
}
