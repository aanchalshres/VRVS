<?php

namespace App\Algorithms\Matching;

use App\Algorithms\Contracts\SimilarityCalculatorInterface;

class CosineSimilarity implements SimilarityCalculatorInterface
{
    public function calculate(array $vectorA, array $vectorB): float
    {
        $dotProduct = 0;

        $magnitudeA = 0;

        $magnitudeB = 0;

        foreach ($vectorA as $term => $weight) {

            $dotProduct +=
                $weight * ($vectorB[$term] ?? 0);

            $magnitudeA +=
                $weight ** 2;
        }

        foreach ($vectorB as $weight) {

            $magnitudeB +=
                $weight ** 2;
        }

        $denominator =
            sqrt($magnitudeA)
            *
            sqrt($magnitudeB);

        return $denominator > 0
            ? $dotProduct / $denominator
            : 0;
    }
}
