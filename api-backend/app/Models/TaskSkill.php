<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskSkill extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'skill_id',
    ];

    // Relationships
    public function task()
    {
        return $this->belongsTo(Task::class);
    }
    
    public function skill()
    {
        return $this->belongsTo(Skill::class);
    }
}
