<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VolunteerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'profile_photo',
        'gender',
        'date_of_birth',
        'bio',
        'primary_location',
        'city',
        'country',
        'latitude',
        'longitude',
        'emergency_contact_name',
        'emergency_contact_phone',
        'availability',
        'tfidf_vector',
        'trust_score',
        'trust_updated_at',
        'trust_score_components',
        'total_service_hours',
        'average_rating',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'tfidf_vector' => 'array',
        'trust_updated_at' => 'datetime',
        'trust_score_components' => 'array',
        'trust_score' => 'float',
        'total_service_hours' => 'decimal:2',
        'average_rating' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function skills()
    {
        return $this->belongsToMany(
            Skill::class,
            'volunteer_skills'
        )->using(VolunteerSkill::class)
         ->withPivot('proficiency_level');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'volunteer_profile_id');
    }

    public function serviceLogs()
    {
        return $this->hasMany(ServiceLog::class, 'volunteer_profile_id');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
