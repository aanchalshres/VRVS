<?php

namespace App\Events\TrustScore;

use Illuminate\Foundation\Events\Dispatchable;

class RatingSubmitted
{
    use Dispatchable;

    public function __construct(
        public int $volunteerProfileId,
        public int $reviewId,
        public float $rating,
    ) {}
}
