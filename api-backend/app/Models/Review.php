<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'reviews';
    protected $fillable = [
        'reviewer_id',
        'reviewee_id',
        'task_id',
        'rating',
        'comment',
    ];

        // Review.php

    public function reviewer()
    {
        return $this->belongsTo(
            User::class,
            'reviewer_id'
        );
    }

    public function reviewee()
    {
        return $this->belongsTo(
            User::class,
            'reviewee_id'
        );
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
