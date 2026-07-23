<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        // Drop the old check constraint if it exists
        DB::statement("
            ALTER TABLE applications
            DROP CONSTRAINT IF EXISTS applications_status_check;
        ");

        // Add the new constraint including Cancelled
        DB::statement("
            ALTER TABLE applications
            ADD CONSTRAINT applications_status_check
            CHECK (
                status IN (
                    'Pending',
                    'Shortlisted',
                    'Accepted',
                    'Rejected',
                    'Withdrawn',
                    'Cancelled'
                )
            );
        ");

        // Ensure default value
        DB::statement("
            ALTER TABLE applications
            ALTER COLUMN status SET DEFAULT 'Pending';
        ");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            ALTER TABLE applications
            DROP CONSTRAINT IF EXISTS applications_status_check;
        ");

        DB::statement("
            ALTER TABLE applications
            ADD CONSTRAINT applications_status_check
            CHECK (
                status IN (
                    'Pending',
                    'Shortlisted',
                    'Accepted',
                    'Rejected',
                    'Withdrawn'
                )
            );
        ");

        DB::statement("
            ALTER TABLE applications
            ALTER COLUMN status SET DEFAULT 'Pending';
        ");
    }
};
