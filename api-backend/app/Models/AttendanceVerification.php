<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceVerification extends Model
{
    protected $table = 'service_logs';

    protected $fillable = [
        'qr_token', 'qr_expires_at', 'verification_method',
        'check_in_latitude', 'check_in_longitude', 'check_in_gps_accuracy',
        'check_in_distance_from_task',
        'check_out_latitude', 'check_out_longitude', 'check_out_gps_accuracy',
        'check_out_distance_from_task',
        'attendance_confidence_score', 'confidence_level', 'device_info',
    ];

    protected function casts(): array
    {
        return [
            'qr_expires_at' => 'datetime',
            'check_in_latitude' => 'decimal:7',
            'check_in_longitude' => 'decimal:7',
            'check_out_latitude' => 'decimal:7',
            'check_out_longitude' => 'decimal:7',
            'device_info' => 'array',
        ];
    }
}
