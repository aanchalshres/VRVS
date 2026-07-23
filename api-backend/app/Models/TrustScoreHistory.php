<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrustScoreHistory extends Model
{
    protected $table = 'trust_score_histories';

    protected $fillable = [
        'volunteer_profile_id',
        'previous_score',
        'new_score',
        'score_change',
        'change_reason',
        'components_snapshot',
        'triggered_by',
    ];

    protected function casts(): array
    {
        return [
            'previous_score' => 'float',
            'new_score' => 'float',
            'score_change' => 'float',
            'components_snapshot' => 'array',
        ];
    }

    public function volunteerProfile(): BelongsTo
    {
        return $this->belongsTo(VolunteerProfile::class);
    }
}
