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

            // Foreign keys
            $table->foreignId('ngo_id')
                ->constrained('ngo_profiles')
                ->onDelete('cascade');

            $table->foreignId('category_id')
                ->constrained('categories')
                ->onDelete('cascade');

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Task details
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->enum('task_type', ['Event', 'Emergency', 'Campaign', 'Task']);
            $table->enum('selection_logic', ['FCFS', 'Weighted']);

            // Location info
            $table->text('location')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Dates
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->dateTime('application_deadline')->nullable();

            $table->integer('required_volunteers')->nullable();

            // Status fields
            $table->enum('status', ['Draft', 'Open', 'Ongoing', 'Completed', 'Cancelled'])
                ->default('Draft');

            $table->enum('urgency_level', ['Low', 'Medium', 'High'])
                ->default('Low');

            $table->string('cover_image')->nullable();

            // Correct Laravel timestamps (ONLY ONCE)
            $table->timestamps();

            // Soft deletes (recommended instead of manual deleted_at)
            $table->softDeletes();
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