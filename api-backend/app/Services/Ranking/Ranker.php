<?php

namespace App\Services\Ranking;

use App\Services\Ranking\RankingStrategyInterface;
use InvalidArgumentException;

class Ranker
{
    private ?RankingStrategyInterface $strategy = null;

    private static array $strategyMap = [
        'recommendation' => Strategies\RecommendationScoreStrategy::class,
        'trust_first' => Strategies\TrustFirstStrategy::class,
        'skills_first' => Strategies\SkillsFirstStrategy::class,
        'distance_first' => Strategies\DistanceFirstStrategy::class,
        'availability_first' => Strategies\AvailabilityFirstStrategy::class,
    ];

    public function __construct(?RankingStrategyInterface $strategy = null)
    {
        $this->strategy = $strategy;
    }

    public function setStrategy(RankingStrategyInterface $strategy): void
    {
        $this->strategy = $strategy;
    }

    public function getStrategy(): ?RankingStrategyInterface
    {
        return $this->strategy;
    }

    public function resolveStrategy(?string $name = null): RankingStrategyInterface
    {
        $name = $name ?? config('workflow.default_strategy', 'recommendation');

        $class = self::$strategyMap[$name] ?? null;

        if (!$class) {
            throw new InvalidArgumentException("Unknown ranking strategy: {$name}");
        }

        return new $class();
    }

    public function score(array $scores, ?string $strategyName = null): float
    {
        $strategy = $strategyName
            ? $this->resolveStrategy($strategyName)
            : ($this->strategy ?? $this->resolveStrategy());

        return $strategy->calculateScore($scores);
    }

    public static function getAvailableStrategies(): array
    {
        $strategies = config('workflow.strategies', []);
        $result = [];

        foreach ($strategies as $key => $config) {
            $result[$key] = $config['label'] ?? $key;
        }

        return $result;
    }
}
