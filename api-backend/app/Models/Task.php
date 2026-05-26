<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Application;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'district',
        'quota',
        'filled_quota',
        'start_date',
        'end_date',
        'status',
        'is_emergency',
        'skills',
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
