<?php

namespace App\Providers;

use App\Services\AttendanceVerification\AttendanceConfidenceService;
use App\Services\AttendanceVerification\AttendanceVerificationService;
use App\Services\AttendanceVerification\Contracts\AttendanceConfidenceServiceInterface;
use App\Services\AttendanceVerification\Contracts\AttendanceVerificationServiceInterface;
use App\Services\AttendanceVerification\Contracts\GpsValidationServiceInterface;
use App\Services\AttendanceVerification\Contracts\QrCodeServiceInterface;
use App\Services\AttendanceVerification\Contracts\TimeValidationServiceInterface;
use App\Services\AttendanceVerification\GpsValidationService;
use App\Services\AttendanceVerification\QrCodeService;
use App\Services\AttendanceVerification\TimeValidationService;
use Illuminate\Support\ServiceProvider;

class AttendanceVerificationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(QrCodeServiceInterface::class, QrCodeService::class);
        $this->app->bind(GpsValidationServiceInterface::class, GpsValidationService::class);
        $this->app->bind(TimeValidationServiceInterface::class, TimeValidationService::class);
        $this->app->bind(AttendanceConfidenceServiceInterface::class, AttendanceConfidenceService::class);
        $this->app->bind(AttendanceVerificationServiceInterface::class, AttendanceVerificationService::class);
    }

    public function boot(): void {}
}
