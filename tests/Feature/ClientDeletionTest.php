<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_with_invoices_cannot_be_deleted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->create();
        $invoice = Invoice::factory()->for($client)->create(['status' => 'sent']);

        $this->actingAs($admin)
            ->delete(route('clients.destroy', $client))
            ->assertRedirect(route('clients.show', $client));

        $this->assertDatabaseHas('clients', ['id' => $client->id]);
        $this->assertDatabaseHas('invoices', ['id' => $invoice->id]);
    }

    public function test_client_without_invoices_is_deleted_with_its_portal_logins(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->create();
        $portalUser = User::factory()->client($client)->create();

        $this->actingAs($admin)
            ->delete(route('clients.destroy', $client))
            ->assertRedirect(route('clients.index'));

        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
        $this->assertDatabaseMissing('users', ['id' => $portalUser->id]);
    }
}
