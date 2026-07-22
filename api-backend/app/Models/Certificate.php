<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $table = 'certificates';
    protected $fillable = [
        'ngo_id',
        'volunteer_profile_id',
        'task_id',
        'certificate_number',
        'issued_at',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
        'issued_at' => 'date',
    ];

    public function ngo()
    {
        return $this->belongsTo(NgoProfile::class, 'ngo_id');
    }

    public function volunteer()
    {
        return $this->belongsTo(VolunteerProfile::class, 'volunteer_profile_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
