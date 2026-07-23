<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class VolunteerSkill extends Pivot
{
    protected $touches = ['volunteerProfile'];

    protected $fillable = [
    'volunteer_profile_id',
    'skill_id',
    'proficiency_level',
    ];
    public function volunteerProfile()
    {
        return $this->belongsTo(
            VolunteerProfile::class,
            'volunteer_profile_id'
        );
    }

    public function skill()
    {
        return $this->belongsTo(Skill::class);
    }
}
