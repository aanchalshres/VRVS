<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowTransition extends Model
{
    protected $table = 'workflow_transitions';
    protected $fillable = [
    'from_state_id',
    'to_state_id',
    'action',
 ];


    // WorkflowTransition.php

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
}
