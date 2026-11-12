<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_sees_login_page_at_home(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('auth/login'));
    }

    public function test_signed_in_user_is_sent_from_home_to_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)->get('/')->assertRedirect(route('dashboard'));
    }
}
