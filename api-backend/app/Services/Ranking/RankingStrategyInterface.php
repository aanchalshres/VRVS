<?php

namespace App\Services\Ranking;

interface RankingStrategyInterface
{
    public function getWeights(): array;

    public function calculateScore(array $scores): float;

    public function getStrategyName(): string;
}
