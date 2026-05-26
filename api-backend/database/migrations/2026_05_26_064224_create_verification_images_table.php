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
        Schema::create('verification_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('verification_session_id')->constrained()->onDelete('cascade');
            $table->string('image_type');
            $table->string('file_path');
            $table->timestamp('captured_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_images');
    }
};
