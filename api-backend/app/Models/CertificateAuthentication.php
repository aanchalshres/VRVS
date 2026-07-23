<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CertificateAuthentication extends Model
{
    protected $table = 'certificate_authentications';

    protected $fillable = [
        'certificate_id',
        'certificate_hash',
        'verification_token',
        'verification_url',
        'qr_code_path',
        'status',
        'is_revoked',
        'revocation_reason',
        'revoked_at',
        'expires_at',
        'verification_count',
        'last_verified_at',
    ];

    protected function casts(): array
    {
        return [
            'is_revoked' => 'boolean',
            'revoked_at' => 'datetime',
            'expires_at' => 'datetime',
            'last_verified_at' => 'datetime',
            'verification_count' => 'integer',
        ];
    }

    public function certificate(): BelongsTo
    {
        return $this->belongsTo(Certificate::class);
    }
}
