<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table = 'reports';
    protected $fillable = [
        'reported_by',
        'against_user_id',
        'task_id',
        'reason',
        'status',
        'resolved_by',
        'resolved_at',
        'resolution_notes',
    ];

   // Report.php

    public function reporter()
    {
        return $this->belongsTo(
            User::class,
            'reported_by'
        );
    }

    public function againstUser()
    {
        return $this->belongsTo(
            User::class,
            'against_user_id'
        );
    }

    public function resolver()
    {
        return $this->belongsTo(
            User::class,
            'resolved_by'
        );
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
