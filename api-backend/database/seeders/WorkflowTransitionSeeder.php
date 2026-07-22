<?php

namespace Database\Seeders;

use App\Models\WorkflowState;
use App\Models\WorkflowTransition;
use Illuminate\Database\Seeder;

class WorkflowTransitionSeeder extends Seeder
{
    public function run(): void
    {
        $states = WorkflowState::pluck('id', 'code');

        $transitions = [
            ['from' => 'document_uploaded', 'to' => 'under_review', 'action' => 'submit_for_review'],
            ['from' => 'pending', 'to' => 'under_review', 'action' => 'start_review'],
            ['from' => 'under_review', 'to' => 'verified', 'action' => 'approve'],
            ['from' => 'under_review', 'to' => 'rejected', 'action' => 'reject'],
            ['from' => 'under_review', 'to' => 'additional_info_requested', 'action' => 'request_info'],
            ['from' => 'additional_info_requested', 'to' => 'document_uploaded', 'action' => 'resubmit'],
            ['from' => 'additional_info_requested', 'to' => 'under_review', 'action' => 'submit_additional'],
            ['from' => 'rejected', 'to' => 'document_uploaded', 'action' => 'reapply'],
        ];

        foreach ($transitions as $t) {
            WorkflowTransition::firstOrCreate(
                [
                    'from_state_id' => $states[$t['from']],
                    'to_state_id' => $states[$t['to']],
                    'action' => $t['action'],
                ]
            );
        }
    }
}
