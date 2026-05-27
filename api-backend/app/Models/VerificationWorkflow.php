<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationWorkflow extends Model
{
    protected $table = 'verification_workflows';
    protected $fillable = [
    'user_id',
    'current_state_id',
    'started_at',
    'completed_at',
    ];

    // VerificationWorkflow.php

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function currentState()
    {
        return $this->belongsTo(
            WorkflowState::class,
            'current_state_id'
        );
    }

    public function logs()
    {
        return $this->hasMany(
            VerificationStateLog::class,
            'workflow_id'
        );
    }
}
