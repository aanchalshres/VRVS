<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            'First Aid', 'CPR', 'Emergency Medical Response', 'Triage',
            'Communication', 'Public Speaking', 'Negotiation', 'Active Listening',
            'Leadership', 'Team Management', 'Supervision', 'Decision Making',
            'Teamwork', 'Collaboration', 'Coordination', 'Interpersonal Skills',
            'Teaching', 'Tutoring', 'Mentoring', 'Training Facilitation',
            'Curriculum Development', 'Lesson Planning', 'Classroom Management',
            'Event Planning', 'Event Coordination', 'Event Management',
            'Fundraising', 'Grant Writing', 'Donor Relations', 'Sponsorship',
            'Community Outreach', 'Advocacy', 'Awareness Campaigns', 'Public Relations',
            'Counseling', 'Peer Support', 'Crisis Intervention', 'Psychosocial Support',
            'Healthcare', 'Nursing', 'Health Education', 'Nutrition Counseling',
            'Child Care', 'Child Protection', 'Early Childhood Development',
            'Elderly Care', 'Geriatric Support', 'Home Visitation',
            'Disaster Response', 'Search and Rescue', 'Relief Distribution', 'Shelter Management',
            'Environmental Conservation', 'Tree Planting', 'Waste Management', 'Recycling',
            'Wildlife Conservation', 'Park Cleanup', 'Water Conservation',
            'Cooking', 'Food Preparation', 'Nutrition Planning', 'Meal Distribution',
            'Driving', 'Logistics', 'Transportation Management', 'Fleet Management',
            'Photography', 'Videography', 'Photo Editing', 'Video Editing',
            'Graphic Design', 'Illustration', 'Layout Design', 'Branding',
            'Content Writing', 'Copywriting', 'Technical Writing', 'Editing',
            'Social Media Management', 'Digital Marketing', 'SEO', 'Email Marketing',
            'Marketing', 'Market Research', 'Campaign Strategy', 'Brand Management',
            'IT Support', 'Technical Support', 'Hardware Troubleshooting', 'Network Administration',
            'Web Development', 'Frontend Development', 'Backend Development', 'Full Stack Development',
            'Mobile App Development', 'React Native', 'Flutter', 'iOS Development',
            'Data Entry', 'Data Management', 'Database Administration', 'Data Analysis',
            'Translation', 'Interpretation', 'Language Teaching', 'Linguistics',
            'Research', 'Data Collection', 'Survey Design', 'Report Writing',
            'Project Management', 'Program Management', 'Agile Methodology', 'Scrum',
            'Accounting', 'Bookkeeping', 'Financial Reporting', 'Budgeting',
            'Administrative Support', 'Office Management', 'Scheduling', 'Record Keeping',
            'Logistics', 'Supply Chain', 'Inventory Management', 'Procurement',
            'Conflict Resolution', 'Mediation', 'Peacebuilding', 'Restorative Justice',
            'Animal Care', 'Veterinary Assistance', 'Animal Rescue', 'Shelter Operations',
            'Construction', 'Carpentry', 'Plumbing', 'Electrical Work',
            'Music', 'Art Therapy', 'Dance Instruction', 'Creative Arts',
            'Sports Coaching', 'Recreation Leadership', 'Physical Education', 'Yoga Instruction',
            'Legal Aid', 'Human Rights Advocacy', 'Paralegal Support', 'Policy Research',
            'GIS Mapping', 'Surveying', 'Cartography', 'Spatial Analysis',
        ];

        foreach ($skills as $skill) {
            Skill::firstOrCreate([
                'name' => $skill,
            ]);
        }
    }
}
