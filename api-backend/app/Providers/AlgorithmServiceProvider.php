<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Algorithms\Contracts\SimilarityCalculatorInterface;
use App\Algorithms\Contracts\AssignmentSolverInterface;
use App\Algorithms\Contracts\TrustCalculatorInterface;

use App\Algorithms\Matching\CosineSimilarity;
use App\Algorithms\Assignment\HungarianMatcher;
use App\Algorithms\Ranking\TrustScoreCalculator;

class AlgorithmServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            SimilarityCalculatorInterface::class,
            CosineSimilarity::class
        );

        $this->app->bind(
            AssignmentSolverInterface::class,
            HungarianMatcher::class
        );

        $this->app->bind(
            TrustCalculatorInterface::class,
            TrustScoreCalculator::class
        );
    }

    public function boot(): void
    {
        //
    }
}
