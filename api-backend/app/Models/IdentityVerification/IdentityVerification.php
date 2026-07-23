<?php

namespace App\Models\IdentityVerification;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class IdentityVerification extends Model
{
    protected $fillable = [
        'verifiable_id',
        'verifiable_type',
        'status',
        'confidence_score',
        'ocr_score',
        'face_match_score',
        'liveness_score',
        'document_quality_score',
        'data_consistency_score',
        'decision',
        'decision_reason',
        'started_at',
        'completed_at',
        'reviewed_by',
        'reviewed_at',
        'admin_remarks',
    ];

    protected $casts = [
        'confidence_score' => 'float',
        'ocr_score' => 'float',
        'face_match_score' => 'float',
        'liveness_score' => 'float',
        'document_quality_score' => 'float',
        'data_consistency_score' => 'float',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function verifiable()
    {
        return $this->morphTo();
    }

    public function documents()
    {
        return $this->hasMany(IdentityDocument::class);
    }

    public function selfie()
    {
        return $this->hasOne(IdentitySelfie::class);
    }

    public function logs()
    {
        return $this->hasMany(IdentityVerificationLog::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
