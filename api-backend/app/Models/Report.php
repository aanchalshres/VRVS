<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table = 'reports';
    protected $fillable = [
        'reporter_id',
        'reported_user_id',
        'reason',
        'status',
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
