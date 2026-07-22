<?php

namespace Database\Seeders;

use App\Models\WorkflowState;
use Illuminate\Database\Seeder;

class WorkflowStateSeeder extends Seeder
{
    public function run(): void
    {
        $states = [
            [
                'code' => 'pending',
                'name' => 'Pending',
                'description' => 'Initial state when verification is requested',
                'sequence' => 10,
                'is_final' => false,
            ],
            [
                'code' => 'document_uploaded',
                'name' => 'Document Uploaded',
                'description' => 'Documents have been uploaded by the user',
                'sequence' => 20,
                'is_final' => false,
            ],
            [
                'code' => 'under_review',
                'name' => 'Under Review',
                'description' => 'Verification is being reviewed by an admin',
                'sequence' => 30,
                'is_final' => false,
            ],
            [
                'code' => 'additional_info_requested',
                'name' => 'Additional Info Requested',
                'description' => 'Admin has requested additional information or documents',
                'sequence' => 35,
                'is_final' => false,
            ],
            [
                'code' => 'verified',
                'name' => 'Verified',
                'description' => 'Verification completed successfully',
                'sequence' => 40,
                'is_final' => true,
            ],
            [
                'code' => 'rejected',
                'name' => 'Rejected',
                'description' => 'Verification has been rejected',
                'sequence' => 50,
                'is_final' => true,
            ],
        ];

        foreach ($states as $state) {
            WorkflowState::firstOrCreate(
                ['code' => $state['code']],
                $state
            );
        }
    }
}
