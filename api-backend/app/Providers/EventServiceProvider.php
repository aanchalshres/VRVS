<?php

namespace App\Providers;

use App\Events\TrustScore\AbsenceRecorded;
use App\Events\TrustScore\ApplicationStatusChanged;
use App\Events\TrustScore\AttendanceRecorded;
use App\Events\TrustScore\RatingSubmitted;
use App\Events\TrustScore\TaskCompleted;
use App\Events\TrustScore\VerificationStatusChanged;
use App\Listeners\TrustScore\RecalculateOnAbsence;
use App\Listeners\TrustScore\RecalculateOnApplicationStatus;
use App\Listeners\TrustScore\RecalculateOnAttendance;
use App\Listeners\TrustScore\RecalculateOnRating;
use App\Listeners\TrustScore\RecalculateOnTaskCompleted;
use App\Listeners\TrustScore\RecalculateOnVerification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        AttendanceRecorded::class => [RecalculateOnAttendance::class],
        TaskCompleted::class => [RecalculateOnTaskCompleted::class],
        RatingSubmitted::class => [RecalculateOnRating::class],
        VerificationStatusChanged::class => [RecalculateOnVerification::class],
        ApplicationStatusChanged::class => [RecalculateOnApplicationStatus::class],
        AbsenceRecorded::class => [RecalculateOnAbsence::class],
    ];

    public function boot(): void {}
}
