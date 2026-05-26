<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationSession extends Model
{
    protected $table = 'verification_sessions';
    protected $fillable = [
        'ngo_profile_id',
        'started_by',
        'started_at',
        'ended_at',
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
