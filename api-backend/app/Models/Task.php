<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'ngo_id',
        'title',
        'slug',
        'description',
        'category_id',
        'task_type',
        'selection_logic',
        'location',
        'city',
        'country',
        'latitude',
        'longitude',
        'required_volunteers',
        'start_date',
        'end_date',
        'application_deadline',
        'urgency_level',
        'status',
        'cover_image',
        'created_by',
        'updated_by',
        'tfidf_vector',
    ];


    protected $casts = [
        'tfidf_vector' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'application_deadline' => 'datetime',
    ];


    public function ngo()
    {
        return $this->belongsTo(
            NgoProfile::class,
            'ngo_id'
        );
    }


    public function applications()
    {
        return $this->hasMany(Application::class);
    }


    public function skills()
    {
        return $this->belongsToMany(
            Skill::class,
            'task_skills'
        );
    }


    public function category()
    {
        return $this->belongsTo(
            Category::class,
            'category_id'
        );
    }
}
