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
        Schema::create('applications', function (Blueprint $table) {
    $table->id();
    $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
    $table->foreignId('volunteer_profile_id')->constrained('volunteer_profiles')->onDelete('cascade');
    $table->decimal('recommendation_score', 5, 2)->nullable();
    $table->enum('status', ['Pending', 'Shortlisted', 'Accepted', 'Rejected', 'Withdrawn'])->default('Pending'); // pending, shortlisted, accepted, rejected, withdrawn
    $table->timestamp('applied_at')->useCurrent();
    $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('reviewed_at')->nullable();
    $table->text('remarks')->nullable();
    $table->timestamp('created_at')->useCurrent();
    $table->timestamp('updated_at')->useCurrent();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
