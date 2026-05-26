<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('verification_state_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('verification_workflows')->onDelete('cascade');
            $table->foreignId('from_state_id')->nullable()->constrained('workflow_states')->onDelete('set null');
            $table->foreignId('to_state_id')->constrained('workflow_states')->onDelete('set null');
            $table->foreignId('changed_by')->constrained('users')->onDelete('set null');
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_state_logs');
    }
};
