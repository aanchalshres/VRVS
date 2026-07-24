<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleConflict extends Model
{
    protected $table = 'schedule_conflicts';

    protected $fillable = [
        'volunteer_profile_id',
        'task_id',
        'conflicting_task_id',
        'conflict_type',
        'conflict_score',
        'overlap_minutes',
        'travel_time_minutes',
        'travel_distance_km',
        'buffer_violation',
        'detected_at',
        'resolution',
        'resolved_at',
        'resolved_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'conflict_score' => 'float',
            'overlap_minutes' => 'integer',
            'travel_time_minutes' => 'integer',
            'travel_distance_km' => 'float',
            'buffer_violation' => 'boolean',
            'detected_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function volunteerProfile(): BelongsTo
    {
        return $this->belongsTo(VolunteerProfile::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function conflictingTask(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'conflicting_task_id');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
