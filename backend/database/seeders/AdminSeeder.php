<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'mtemaabdul61@gmail.com'],
            [
                'full_name' => 'Abdul Mtema',
                'phone' => '0789980351',
                'password' => Hash::make('mtEmA26@#!'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}