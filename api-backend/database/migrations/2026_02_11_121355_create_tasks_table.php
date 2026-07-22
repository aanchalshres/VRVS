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
        Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->json('tfidf_vector')->nullable();
    $table->foreignId('ngo_id')->constrained('ngo_profiles')->onDelete('cascade');
    $table->foreignId('category_id')->constrained('categories');
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->enum('task_type', ['Event', 'Emergency', 'Campaign', 'Task']); // event, emergency, campaign, task
    $table->enum('selection_logic', ['FCFS', 'Weighted']);
    $table->text('location')->nullable();
    $table->string('city')->nullable();
    $table->string('country')->nullable();
    $table->decimal('latitude', 10, 8)->nullable();
    $table->decimal('longitude', 11, 8)->nullable();
    $table->dateTime('start_date')->nullable();
    $table->dateTime('end_date')->nullable();
    $table->dateTime('application_deadline')->nullable();
    $table->integer('required_volunteers')->nullable();
    $table->enum('status', ['Draft', 'Open', 'Ongoing', 'Completed', 'Cancelled'])->default('Draft');// draft, open, ongoing, completed, cancelled
    $table->enum('urgency_level', ['Low', 'Medium', 'High'])->default('Low');
    $table->string('cover_image')->nullable();
    $table->foreignId('created_by')->constrained('users')->onDelete('set null');
    $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('created_at')->useCurrent();
    $table->timestamp('updated_at')->useCurrent();
    $table->timestamp('deleted_at')->nullable();
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
