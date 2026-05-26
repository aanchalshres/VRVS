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
    'availability_status',
    'reliability_score',
    'total_service_hours',
    'average_rating',
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
        )->withPivot('proficiency_level');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'volunteer_id');
    }

    public function serviceLogs()
    {
        return $this->hasMany(ServiceLog::class, 'volunteer_id');
    }

}
