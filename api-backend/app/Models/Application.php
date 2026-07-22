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

    protected static function boot()
    {
        parent::boot();

        static::created(function ($application) {
            $task = $application->task;
            $ngo = $task->ngo;
            $volunteer = $application->volunteer;

            if ($ngo && $volunteer && $ngo->user_id) {
                $volunteerName = $volunteer->user->name ?? 'A volunteer';
                app(\App\Services\NotificationService::class)->newApplication(
                    $ngo->user_id,
                    $volunteerName,
                    $task->title,
                    $application->id
                );
            }
        });
    }

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

    public function certificate()
    {
        return $this->hasOne(Certificate::class, 'task_id', 'task_id')
            ->whereColumn('volunteer_profile_id', 'volunteer_profile_id');
    }
}
