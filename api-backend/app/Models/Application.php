<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'volunteer_profile_id',
        'recommendation_score',
        'status',
        'applied_at',
        'reviewed_by',
        'reviewed_at',
        'remarks',
    ];


    protected $casts = [
        'applied_at'  => 'datetime',
        'reviewed_at' => 'datetime',
        'recommendation_score' => 'float',
    ];


    public function task()
    {
        return $this->belongsTo(Task::class);
    }


    public function volunteer()
    {
        return $this->belongsTo(
            VolunteerProfile::class,
            'volunteer_profile_id'
        );
    }


    public function reviewer()
    {
        return $this->belongsTo(
            User::class,
            'reviewed_by'
        );
    }
}
