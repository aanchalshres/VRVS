<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('identity_verifications', function (Blueprint $table) {
            $table->id();
            $table->morphs('verifiable');
            $table->string('status')->default('pending');
            $table->float('confidence_score')->nullable();
            $table->float('ocr_score')->nullable();
            $table->float('face_match_score')->nullable();
            $table->float('liveness_score')->nullable();
            $table->float('document_quality_score')->nullable();
            $table->float('data_consistency_score')->nullable();
            $table->string('decision')->nullable();
            $table->text('decision_reason')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('admin_remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('identity_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('identity_verification_id')->constrained()->cascadeOnDelete();
            $table->string('document_type');
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedInteger('file_size');
            $table->json('ocr_extracted_data')->nullable();
            $table->float('ocr_confidence')->nullable();
            $table->string('ocr_status')->default('pending');
            $table->json('validation_results')->nullable();
            $table->string('validation_status')->default('pending');
            $table->timestamps();
        });

        Schema::create('identity_selfies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('identity_verification_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedInteger('file_size');
            $table->string('face_detection_status')->nullable();
            $table->integer('faces_detected')->nullable();
            $table->float('image_quality_score')->nullable();
            $table->boolean('is_blurry')->nullable();
            $table->json('liveness_result')->nullable();
            $table->string('liveness_status')->default('pending');
            $table->timestamps();
        });

        Schema::create('identity_verification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('identity_verification_id')->constrained()->cascadeOnDelete();
            $table->string('step');
            $table->string('status');
            $table->text('message')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identity_verification_logs');
        Schema::dropIfExists('identity_selfies');
        Schema::dropIfExists('identity_documents');
        Schema::dropIfExists('identity_verifications');
    }
};
