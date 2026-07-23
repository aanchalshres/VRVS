<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_authentications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('certificate_id')->constrained()->cascadeOnDelete();
            $table->string('certificate_hash', 64);
            $table->string('verification_token', 64)->unique();
            $table->string('verification_url', 512);
            $table->string('qr_code_path', 255)->nullable();
            $table->string('status', 32)->default('active');
            $table->boolean('is_revoked')->default(false);
            $table->text('revocation_reason')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('verification_count')->default(0);
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamps();

            $table->index('certificate_hash');
            $table->index('verification_token');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_authentications');
    }
};
