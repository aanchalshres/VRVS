<?php

namespace App\Models;

use App\Models\TaskSkill;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

   protected $fillable = [
        'ngo_id',
        'category_id',
        'title',
        'slug',
        'description',
        'task_type',
        'selection_logic',
        'location',
        'city',
        'country',
        'latitude',
        'longitude',
        'start_date',
        'end_date',
        'application_deadline',
        'required_volunteers',
        'status',
        'urgency_level',
        'cover_image',
        'created_by',
    ];

    protected $casts = [
        'skills' => 'array',
        'is_emergency' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

  // Task.php

    public function ngo()
    {
        return $this->belongsTo(
            NgoProfile::class,
            'ngo_id'
        );
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function skills()
    {
        return $this->belongsToMany(
            Skill::class,
            'task_skills'
        );
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function serviceLogs()
    {
        return $this->hasMany(ServiceLog::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
