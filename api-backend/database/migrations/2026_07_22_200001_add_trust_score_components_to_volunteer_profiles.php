<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('volunteer_profiles', function (Blueprint $table) {
            $table->json('trust_score_components')->nullable()->after('trust_updated_at');
        });
    }

    public function down(): void
    {
        Schema::table('volunteer_profiles', function (Blueprint $table) {
            $table->dropColumn('trust_score_components');
        });
    }
};
