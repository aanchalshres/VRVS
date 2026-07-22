<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shortlist extends Model
{
    protected $fillable = [
        'task_id',
        'volunteer_profile_id',
        'recommendation_score',
        'semantic_match_score',
        'distance_score',
        'skill_overlap_score',
        'availability_score',
        'trust_score',
        'strategy_used',
        'rank',
    ];

    protected $casts = [
        'recommendation_score' => 'float',
        'semantic_match_score' => 'float',
        'distance_score' => 'float',
        'skill_overlap_score' => 'float',
        'availability_score' => 'float',
        'trust_score' => 'float',
        'rank' => 'integer',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function volunteer()
    {
        return $this->belongsTo(VolunteerProfile::class, 'volunteer_profile_id');
    }
}
