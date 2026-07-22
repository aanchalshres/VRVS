<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shortlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->foreignId('volunteer_profile_id')->constrained()->onDelete('cascade');
            $table->float('recommendation_score')->nullable();
            $table->float('semantic_match_score')->nullable();
            $table->float('distance_score')->nullable();
            $table->float('skill_overlap_score')->nullable();
            $table->float('availability_score')->nullable();
            $table->float('trust_score')->nullable();
            $table->string('strategy_used')->default('recommendation');
            $table->unsignedInteger('rank')->nullable();
            $table->timestamps();

            $table->unique(['task_id', 'volunteer_profile_id'], 'shortlist_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shortlists');
    }
};
