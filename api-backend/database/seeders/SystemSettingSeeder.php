<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'platform_name', 'value' => 'Sahayogi Hub', 'group' => 'general', 'description' => 'Platform display name'],
            ['key' => 'platform_tagline', 'value' => 'Connecting Volunteers with Meaningful Opportunities', 'group' => 'general', 'description' => 'Platform tagline'],
            ['key' => 'contact_email', 'value' => 'support@sahayogi.com', 'group' => 'general', 'description' => 'Default contact email address'],
            ['key' => 'support_phone', 'value' => '+977-1-4XXXXXX', 'group' => 'general', 'description' => 'Support phone number'],
            ['key' => 'address', 'value' => 'Kathmandu, Nepal', 'group' => 'general', 'description' => 'Organization address'],
            ['key' => 'max_upload_size', 'value' => '10240', 'group' => 'general', 'description' => 'Maximum file upload size in KB (10MB)'],
            ['key' => 'allowed_file_types', 'value' => 'jpg,jpeg,png,pdf,doc,docx', 'group' => 'general', 'description' => 'Comma-separated list of allowed file extensions'],
            ['key' => 'default_pagination', 'value' => '20', 'group' => 'general', 'description' => 'Default items per page for paginated lists'],
            ['key' => 'session_timeout_minutes', 'value' => '120', 'group' => 'general', 'description' => 'Session timeout in minutes'],
            ['key' => 'volunteer_min_age', 'value' => '16', 'group' => 'general', 'description' => 'Minimum age for volunteer registration'],
            ['key' => 'require_volunteer_verification', 'value' => 'true', 'group' => 'general', 'description' => 'Whether volunteers must verify their identity'],
            ['key' => 'require_ngo_verification', 'value' => 'true', 'group' => 'general', 'description' => 'Whether NGOs must be verified before posting tasks'],
            ['key' => 'enable_notifications', 'value' => 'true', 'group' => 'general', 'description' => 'Master toggle for all platform notifications'],
            ['key' => 'maintenance_mode', 'value' => 'false', 'group' => 'general', 'description' => 'Put the platform in maintenance mode'],
            ['key' => 'registration_open', 'value' => 'true', 'group' => 'general', 'description' => 'Allow new user registrations'],
            ['key' => 'tfidf_enabled', 'value' => 'true', 'group' => 'general', 'description' => 'Enable TF-IDF recommendation engine'],
            ['key' => 'trust_score_enabled', 'value' => 'true', 'group' => 'general', 'description' => 'Enable trust score calculation'],
            ['key' => 'max_skills_per_volunteer', 'value' => '20', 'group' => 'general', 'description' => 'Maximum number of skills a volunteer can select'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
