<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';
    protected $fillable = [
        'user_id',
        'action',
        'module',
        'description',
        'ip_address',
    ];


    // ActivityLog.php
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
