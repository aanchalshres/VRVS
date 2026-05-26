<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $table = 'skills';
    protected $fillable = [
        'name',
        'description',
    ];

    // Skill.php

    // Skill.php

    public function volunteers()
    {
        return $this->belongsToMany(
            VolunteerProfile::class,
            'volunteer_skills'
        )->withPivot('proficiency_level');
    }

    public function tasks()
    {
        return $this->belongsToMany(
            Task::class,
            'task_skills'
        );
    }
}
