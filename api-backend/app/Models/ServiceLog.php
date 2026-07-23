<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceLog extends Model
{
    protected $table = 'service_logs';
    protected $fillable = [
        'volunteer_profile_id',
        'task_id',
        'check_in_time',
        'check_out_time',
        'hours',
        'participation_status',
        'feedback',
        'qr_token',
        'qr_expires_at',
        'verification_method',
        'check_in_latitude',
        'check_in_longitude',
        'check_in_gps_accuracy',
        'check_in_distance_from_task',
        'check_out_latitude',
        'check_out_longitude',
        'check_out_gps_accuracy',
        'check_out_distance_from_task',
        'attendance_confidence_score',
        'confidence_level',
        'device_info',
    ];

    protected function casts(): array
    {
        return [
            'check_in_time' => 'datetime',
            'check_out_time' => 'datetime',
            'qr_expires_at' => 'datetime',
            'check_in_latitude' => 'decimal:7',
            'check_in_longitude' => 'decimal:7',
            'check_out_latitude' => 'decimal:7',
            'check_out_longitude' => 'decimal:7',
            'device_info' => 'array',
        ];
    }

    public function volunteer()
    {
        return $this->belongsTo(
            VolunteerProfile::class,
            'volunteer_profile_id'
        );
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
