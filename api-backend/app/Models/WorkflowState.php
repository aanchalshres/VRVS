<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowState extends Model
{
    protected $table = 'workflow_states';
   protected $fillable = [
    'code',
    'name',
    'description',
    'sequence',
    'is_final',
  ];

    // WorkflowState.php

    public function outgoingTransitions()
    {
        return $this->hasMany(
            WorkflowTransition::class,
            'from_state_id'
        );
    }

    public function incomingTransitions()
    {
        return $this->hasMany(
            WorkflowTransition::class,
            'to_state_id'
        );
    }

    public function workflows()
    {
        return $this->hasMany(
            VerificationWorkflow::class,
            'current_state_id'
        );
    }
}
