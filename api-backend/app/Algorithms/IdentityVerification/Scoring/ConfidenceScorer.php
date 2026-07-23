<?php

namespace App\Algorithms\IdentityVerification\Scoring;

use App\Algorithms\IdentityVerification\Contracts\ConfidenceScorerInterface;

class ConfidenceScorer implements ConfidenceScorerInterface
{
    public function calculate(array $scores): array
    {
        $weights = config('identity-verification.weights', [
            'ocr_accuracy' => 0.30,
            'face_match' => 0.30,
            'liveness' => 0.20,
            'document_quality' => 0.10,
            'data_consistency' => 0.10,
        ]);

        $components = [
            'ocr_accuracy' => $this->normalize($scores['ocr_accuracy'] ?? 0),
            'face_match' => $this->normalize($scores['face_match'] ?? 0),
            'liveness' => $this->normalize($scores['liveness'] ?? 0),
            'document_quality' => $this->normalize($scores['document_quality'] ?? 0),
            'data_consistency' => $this->normalize($scores['data_consistency'] ?? 0),
        ];

        $finalScore = 0;
        foreach ($weights as $key => $weight) {
            $finalScore += $weight * ($components[$key] ?? 0);
        }

        $finalScore = round(max(0, min(100, $finalScore)), 2);

        return [
            'confidence_score' => $finalScore,
            'components' => $components,
            'weights_used' => $weights,
        ];
    }

    public function decide(float $confidenceScore): array
    {
        $autoVerify = (float) config('identity-verification.auto_verify_threshold', 95);
        $manualReview = (float) config('identity-verification.manual_review_threshold', 80);

        if ($confidenceScore >= $autoVerify) {
            return [
                'decision' => 'auto_verified',
                'reason' => "Confidence score {$confidenceScore}% meets auto-verify threshold of {$autoVerify}%",
                'requires_review' => false,
            ];
        }

        if ($confidenceScore >= $manualReview) {
            return [
                'decision' => 'manual_review',
                'reason' => "Confidence score {$confidenceScore}% is below auto-verify threshold ({$autoVerify}%) but meets manual review threshold",
                'requires_review' => true,
            ];
        }

        return [
            'decision' => 'rejected',
            'reason' => "Confidence score {$confidenceScore}% is below minimum threshold of {$manualReview}%",
            'requires_review' => false,
        ];
    }

    private function normalize(float $value): float
    {
        return round(max(0, min(100, $value)), 2);
    }
}
