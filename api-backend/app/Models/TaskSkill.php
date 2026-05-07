<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskSkill extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'skill_name',
    ];

    // Relationships
    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
