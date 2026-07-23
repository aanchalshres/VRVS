<?php

namespace App\Services\IdentityVerification;

use App\Algorithms\IdentityVerification\Contracts\FaceMatchingProviderInterface;

class FaceMatchingService
{
    public function __construct(
        private FaceMatchingProviderInterface $faceMatcher,
    ) {}

    public function compare(string $documentImagePath, string $selfieImagePath): array
    {
        $detectResult = $this->faceMatcher->detect($selfieImagePath);

        if (($detectResult['faces_detected'] ?? 0) === 0) {
            return [
                'match_score' => 0,
                'match_confidence' => 0,
                'matched' => false,
                'face_detection_status' => 'no_face',
                'details' => $detectResult['message'] ?? 'No face detected in selfie',
                'detection' => $detectResult,
            ];
        }

        if (($detectResult['faces_detected'] ?? 0) > 1) {
            return [
                'match_score' => 0,
                'match_confidence' => 0,
                'matched' => false,
                'face_detection_status' => 'multiple_faces',
                'details' => 'Multiple faces detected in selfie',
                'detection' => $detectResult,
            ];
        }

        $isBlurry = $detectResult['is_blurry'] ?? false;
        if ($isBlurry) {
            return [
                'match_score' => 10,
                'match_confidence' => 10,
                'matched' => false,
                'face_detection_status' => 'blurry',
                'details' => 'Selfie image is blurry, quality too low for matching',
                'detection' => $detectResult,
            ];
        }

        $compareResult = $this->faceMatcher->compare($documentImagePath, $selfieImagePath);

        $similarityScore = $compareResult['similarity_score'] ?? 0;

        $minSimilarity = (float) config('identity-verification.face_matching.min_similarity', 70);

        return [
            'match_score' => $similarityScore,
            'match_confidence' => $compareResult['match_confidence'] ?? 0,
            'matched' => $similarityScore >= $minSimilarity,
            'face_detection_status' => 'single_face',
            'details' => $similarityScore >= $minSimilarity
                ? 'Face match successful'
                : 'Face match score below threshold',
            'detection' => $detectResult,
            'comparison' => $compareResult,
        ];
    }

    public function detect(string $imagePath): array
    {
        return $this->faceMatcher->detect($imagePath);
    }
}
