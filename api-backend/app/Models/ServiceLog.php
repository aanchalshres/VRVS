<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceLog extends Model
{
    protected $table = 'service_logs';
    protected $fillable = [
        'service_name',
        'endpoint',
        'request_method',
        'request_payload',
        'response_status',
        'response_payload',
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
