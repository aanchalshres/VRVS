<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_logs', function (Blueprint $table) {
            $table->string('qr_token', 128)->nullable()->after('feedback');
            $table->timestamp('qr_expires_at')->nullable()->after('qr_token');
            $table->string('verification_method', 32)->nullable()->after('qr_expires_at');
            $table->decimal('check_in_latitude', 10, 7)->nullable()->after('verification_method');
            $table->decimal('check_in_longitude', 10, 7)->nullable()->after('check_in_latitude');
            $table->float('check_in_gps_accuracy')->nullable()->after('check_in_longitude');
            $table->float('check_in_distance_from_task')->nullable()->after('check_in_gps_accuracy');
            $table->decimal('check_out_latitude', 10, 7)->nullable()->after('check_in_distance_from_task');
            $table->decimal('check_out_longitude', 10, 7)->nullable()->after('check_out_latitude');
            $table->float('check_out_gps_accuracy')->nullable()->after('check_out_longitude');
            $table->float('check_out_distance_from_task')->nullable()->after('check_out_gps_accuracy');
            $table->float('attendance_confidence_score')->nullable()->after('check_out_distance_from_task');
            $table->string('confidence_level', 32)->nullable()->after('attendance_confidence_score');
            $table->json('device_info')->nullable()->after('confidence_level');
        });
    }

    public function down(): void
    {
        Schema::table('service_logs', function (Blueprint $table) {
            $table->dropColumn([
                'qr_token', 'qr_expires_at', 'verification_method',
                'check_in_latitude', 'check_in_longitude', 'check_in_gps_accuracy',
                'check_in_distance_from_task',
                'check_out_latitude', 'check_out_longitude', 'check_out_gps_accuracy',
                'check_out_distance_from_task',
                'attendance_confidence_score', 'confidence_level', 'device_info',
            ]);
        });
    }
};
