<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Community Service', 'description' => 'Activities that improve local communities and neighborhoods'],
            ['name' => 'Education', 'description' => 'Teaching, tutoring, and educational support programs'],
            ['name' => 'Healthcare', 'description' => 'Medical camps, health awareness, and wellness programs'],
            ['name' => 'Disaster Relief', 'description' => 'Emergency response, relief distribution, and recovery efforts'],
            ['name' => 'Environment', 'description' => 'Conservation, tree planting, and environmental protection'],
            ['name' => 'Animal Welfare', 'description' => 'Animal rescue, shelter support, and veterinary assistance'],
            ['name' => 'Youth Development', 'description' => 'Programs focused on empowering young people'],
            ['name' => 'Elderly Care', 'description' => 'Support and companionship for senior citizens'],
            ['name' => 'Women Empowerment', 'description' => 'Initiatives supporting women\'s rights, education, and livelihoods'],
            ['name' => 'Child Welfare', 'description' => 'Child protection, orphanage support, and children\'s programs'],
            ['name' => 'Food Distribution', 'description' => 'Food drives, meal programs, and nutrition assistance'],
            ['name' => 'Blood Donation', 'description' => 'Blood donation drives and awareness campaigns'],
            ['name' => 'Technology', 'description' => 'Digital literacy, IT support, and tech-for-good initiatives'],
            ['name' => 'Events', 'description' => 'Event planning, coordination, and on-day support'],
            ['name' => 'Administration', 'description' => 'Office support, data entry, and organizational tasks'],
            ['name' => 'Fundraising', 'description' => 'Campaigns and activities to raise funds for causes'],
            ['name' => 'Mental Health', 'description' => 'Counseling, support groups, and mental health awareness'],
            ['name' => 'Agriculture', 'description' => 'Farming support, food security, and sustainable agriculture'],
            ['name' => 'Emergency Response', 'description' => 'Immediate assistance during crises and emergencies'],
            ['name' => 'Other', 'description' => 'Other volunteer activities not covered by existing categories'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description']]
            );
        }
    }
}
