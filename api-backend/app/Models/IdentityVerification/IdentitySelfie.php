<?php

namespace App\Models\IdentityVerification;

use Illuminate\Database\Eloquent\Model;

class IdentitySelfie extends Model
{
    protected $fillable = [
        'identity_verification_id',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'face_detection_status',
        'faces_detected',
        'image_quality_score',
        'is_blurry',
        'liveness_result',
        'liveness_status',
    ];

    protected $casts = [
        'liveness_result' => 'array',
        'faces_detected' => 'integer',
        'image_quality_score' => 'float',
        'is_blurry' => 'boolean',
        'file_size' => 'integer',
    ];

    public function verification()
    {
        return $this->belongsTo(IdentityVerification::class);
    }
}
