<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ngo_profiles', function (Blueprint $table) {
            $table->text('mission')->nullable()->after('description');
            $table->text('vision')->nullable()->after('mission');
            $table->json('social_links')->nullable()->after('website');
            $table->foreignId('org_category_id')
                ->nullable()
                ->after('country')
                ->constrained('categories')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ngo_profiles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('org_category_id');
            $table->dropColumn(['mission', 'vision', 'social_links']);
        });
    }
};
