<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NgoProfile extends Model
{
    use HasFactory;

    protected $fillable = [
    'user_id',
    'organization_name',
    'registration_number',
    'description',
    'logo',
    'website',
    'office_location',
    'city',
    'country',
    'latitude',
    'longitude',
    'pan_number',
    'verification_status',
    'verified_by',
    'verified_at',
    'rejection_reason',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function tasks()
    {
        return $this->hasMany(Task::class, 'ngo_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
