<?php

namespace App\Models\IdentityVerification;

use Illuminate\Database\Eloquent\Model;

class IdentityVerificationLog extends Model
{
    protected $fillable = [
        'identity_verification_id',
        'step',
        'status',
        'message',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function verification()
    {
        return $this->belongsTo(IdentityVerification::class);
    }
}
