<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationStateLog extends Model
{
    protected $table = 'verification_state_logs';
    protected $fillable = [
        'workflow_id',
        'from_state_id',
        'to_state_id',
        'changed_by',
    ];

    // VerificationStateLog.php

    public function workflow()
    {
        return $this->belongsTo(
            VerificationWorkflow::class,
            'workflow_id'
        );
    }

    public function fromState()
    {
        return $this->belongsTo(
            WorkflowState::class,
            'from_state_id'
        );
    }

    public function toState()
    {
        return $this->belongsTo(
            WorkflowState::class,
            'to_state_id'
        );
    }

    public function changedBy()
    {
        return $this->belongsTo(
            User::class,
            'changed_by'
        );
    }
}
