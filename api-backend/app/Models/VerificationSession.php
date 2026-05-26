<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationSession extends Model
{
    protected $table = 'verification_sessions';
    protected $fillable = [
        'user_id',
        'started_at',
        'completed_at',
        'status',
        'ip_address',
        'device_info',
    ];

   // VerificationSession.php

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(
            VerificationImage::class
        );
    }
}
