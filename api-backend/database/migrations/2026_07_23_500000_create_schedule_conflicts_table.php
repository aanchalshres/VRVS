<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_conflicts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('volunteer_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('conflicting_task_id')->constrained('tasks')->cascadeOnDelete();
            $table->string('conflict_type', 32)->default('no_conflict');
            $table->decimal('conflict_score', 5, 2)->default(0.00);
            $table->unsignedInteger('overlap_minutes')->default(0);
            $table->unsignedInteger('travel_time_minutes')->default(0);
            $table->decimal('travel_distance_km', 8, 2)->nullable();
            $table->boolean('buffer_violation')->default(false);
            $table->timestamp('detected_at')->useCurrent();
            $table->string('resolution', 32)->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('volunteer_profile_id');
            $table->index('task_id');
            $table->index('conflicting_task_id');
            $table->index('conflict_type');
            $table->index('detected_at');
            $table->unique(['volunteer_profile_id', 'task_id', 'conflicting_task_id'], 'unique_conflict_pair');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_conflicts');
    }
};
