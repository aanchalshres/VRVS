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

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // NGO/User who created the task
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Alias for NGO
    public function ngo()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Volunteer applications
    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}