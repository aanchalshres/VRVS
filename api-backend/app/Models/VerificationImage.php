<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationImage extends Model
{
    protected $table = 'verification_images';
    protected $fillable = [
    'verification_session_id',
    'image_type',
    'file_path',
    'captured_at',
   ];
    // VerificationImage.php

    public function verificationSession()
    {
        return $this->belongsTo(
            VerificationSession::class
        );
    }
}
