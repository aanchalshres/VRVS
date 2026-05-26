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
    Schema::create('service_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('volunteer_profile_id')->constrained('volunteer_profiles')->onDelete('cascade');
    $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
    $table->datetime('check_in_time')->nullable();
    $table->datetime('check_out_time')->nullable();
    $table->decimal('hours', 6, 2)->default(0.00);
    $table->enum('participation_status',['assigned','active','completed','absent'])->default('assigned');
    $table->text('feedback')->nullable();
    $table->timestamp('created_at')->useCurrent();
    $table->timestamp('updated_at')->useCurrent();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_logs');
    }
};
