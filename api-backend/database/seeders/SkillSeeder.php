<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            'First Aid',
            'Communication',
            'Leadership',
            'Teamwork',
            'Teaching',
            'Tutoring',
            'Event Planning',
            'Fundraising',
            'Community Outreach',
            'Public Speaking',
            'Counseling',
            'Healthcare',
            'Child Care',
            'Elderly Care',
            'Disaster Response',
            'Environmental Conservation',
            'Tree Planting',
            'Waste Management',
            'Cooking',
            'Driving',
            'Photography',
            'Videography',
            'Graphic Design',
            'Content Writing',
            'Social Media Management',
            'Marketing',
            'IT Support',
            'Web Development',
            'Mobile App Development',
            'Data Entry',
            'Translation',
            'Interpretation',
            'Research',
            'Project Management',
            'Accounting',
            'Administrative Support',
            'Logistics',
            'Mentoring',
            'Conflict Resolution',
            'Animal Care',
        ];

        foreach ($skills as $skill) {
            Skill::firstOrCreate([
                'name' => $skill,
            ]);
        }
    }
}
