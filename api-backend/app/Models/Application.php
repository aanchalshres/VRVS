<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Application extends Model
{
    use HasFactory;

  protected $fillable = [
    'task_id',
    'volunteer_id',
    'recommendation_score',
    'status',
    'applied_at',
    'reviewed_by',
    'reviewed_at',
    'remarks',
    ];

   // Application.php

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function volunteer()
    {
        return $this->belongsTo(
            VolunteerProfile::class,
            'volunteer_id'
        );
    }

    public function reviewer()
    {
        return $this->belongsTo(
            User::class,
            'reviewed_by'
        );
    }
}
