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
        'mission',
        'vision',
        'logo',
        'website',
        'social_links',
        'office_location',
        'city',
        'country',
        'org_category_id',
        'latitude',
        'longitude',
        'pan_number',
        'verification_status',
        'verified_by',
        'verified_at',
        'rejection_reason',
    ];

    protected $casts = [
        'social_links' => 'array',
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

    public function orgCategory()
    {
        return $this->belongsTo(Category::class, 'org_category_id');
    }
}
