<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@sahayogi.com'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@sahayogi.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '9800000000',
                'is_active' => true,
            ]
        );

        $this->command?->info('Default admin created: admin@sahayogi.com / password');
    }
}
