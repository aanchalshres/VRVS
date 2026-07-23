<?php

namespace App\Models\IdentityVerification;

use Illuminate\Database\Eloquent\Model;

class IdentityDocument extends Model
{
    protected $fillable = [
        'identity_verification_id',
        'document_type',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'ocr_extracted_data',
        'ocr_confidence',
        'ocr_status',
        'validation_results',
        'validation_status',
    ];

    protected $casts = [
        'ocr_extracted_data' => 'array',
        'validation_results' => 'array',
        'ocr_confidence' => 'float',
        'file_size' => 'integer',
    ];

    public function verification()
    {
        return $this->belongsTo(IdentityVerification::class);
    }
}
