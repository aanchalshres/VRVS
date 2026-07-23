<?php

namespace App\Providers;

use App\Algorithms\IdentityVerification\Contracts\ConfidenceScorerInterface;
use App\Algorithms\IdentityVerification\Contracts\DocumentValidatorInterface;
use App\Algorithms\IdentityVerification\Contracts\FaceMatchingProviderInterface;
use App\Algorithms\IdentityVerification\Contracts\LivenessDetectionProviderInterface;
use App\Algorithms\IdentityVerification\Contracts\OcrProviderInterface;
use App\Algorithms\IdentityVerification\DocumentValidation\DocumentValidator;
use App\Algorithms\IdentityVerification\FaceMatching\DummyFaceMatchingProvider;
use App\Algorithms\IdentityVerification\Liveness\DummyLivenessDetectionProvider;
use App\Algorithms\IdentityVerification\Ocr\StructuredOcrParser;
use App\Algorithms\IdentityVerification\Ocr\TesseractOcrProvider;
use App\Algorithms\IdentityVerification\Scoring\ConfidenceScorer;
use App\Services\IdentityVerification\VerificationPipelineService;
use Illuminate\Support\ServiceProvider;

class IdentityVerificationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(OcrProviderInterface::class, function () {
            $provider = config('identity-verification.ocr.provider', 'tesseract');

            return match ($provider) {
                'tesseract' => new TesseractOcrProvider(),
                default => new TesseractOcrProvider(),
            };
        });

        $this->app->bind(FaceMatchingProviderInterface::class, function () {
            $provider = config('identity-verification.face_matching.provider', 'dummy');

            return match ($provider) {
                'dummy' => new DummyFaceMatchingProvider(),
                default => new DummyFaceMatchingProvider(),
            };
        });

        $this->app->bind(LivenessDetectionProviderInterface::class, function () {
            $provider = config('identity-verification.liveness.provider', 'dummy');

            return match ($provider) {
                'dummy' => new DummyLivenessDetectionProvider(),
                default => new DummyLivenessDetectionProvider(),
            };
        });

        $this->app->bind(DocumentValidatorInterface::class, DocumentValidator::class);

        $this->app->bind(ConfidenceScorerInterface::class, ConfidenceScorer::class);

        $this->app->singleton(StructuredOcrParser::class);
        $this->app->singleton(VerificationPipelineService::class);
    }

    public function boot(): void
    {
        //
    }
}
