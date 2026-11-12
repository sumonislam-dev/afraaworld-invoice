<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Seeded Admin Account
    |--------------------------------------------------------------------------
    |
    | Credentials for the one admin account created by AdminUserSeeder.
    | Set these in .env rather than hardcoding them in the seeder.
    |
    */

    'name' => env('ADMIN_NAME', 'Admin'),
    'email' => env('ADMIN_EMAIL'),
    'password' => env('ADMIN_PASSWORD'),

];
