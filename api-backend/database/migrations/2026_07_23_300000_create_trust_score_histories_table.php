<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trust_score_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('volunteer_profile_id')->constrained()->cascadeOnDelete();
            $table->float('previous_score')->nullable();
            $table->float('new_score');
            $table->float('score_change');
            $table->string('change_reason', 255)->nullable();
            $table->json('components_snapshot')->nullable();
            $table->string('triggered_by', 64)->nullable();
            $table->timestamps();

            $table->index('volunteer_profile_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trust_score_histories');
    }
};
