<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceLog extends Model
{
    protected $table = 'service_logs';
    protected $fillable = [
        'volunteer_id',
        'task_id',
        'check_in_time',
        'check_out_time',
        'hours',
        'participation_status',
        'feedback',
    ];

    // ServiceLog.php

    public function volunteer()
    {
        return $this->belongsTo(
            VolunteerProfile::class,
            'volunteer_id'
        );
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
