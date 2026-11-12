<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the admin account from credentials in .env (ADMIN_NAME,
     * ADMIN_EMAIL, ADMIN_PASSWORD) so they're never hardcoded here.
     */
    public function run(): void
    {
        $email = config('admin.email');

        $user = User::firstOrNew(['email' => $email]);
        $user->name = config('admin.name');
        $user->role = 'admin';
        $user->client_id = null;
        $user->password = config('admin.password');
        $user->email_verified_at = $user->email_verified_at ?? Carbon::now();
        $user->save();
    }
}
