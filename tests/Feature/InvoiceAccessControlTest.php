<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceAccessControlTest extends TestCase
{
    use RefreshDatabase;

    private function clientUser(Client $client): User
    {
        return User::factory()->client($client)->create();
    }

    public function test_client_cannot_view_another_clients_invoice_by_guessing_the_url(): void
    {
        $ownClient = Client::factory()->create();
        $otherClient = Client::factory()->create();

        $user = $this->clientUser($ownClient);

        $otherInvoice = Invoice::factory()->for($otherClient)->create(['status' => 'sent']);

        $response = $this->actingAs($user)->get(route('portal.invoices.show', $otherInvoice));

        $response->assertForbidden();
    }

    public function test_client_can_view_their_own_sent_invoice(): void
    {
        $client = Client::factory()->create();
        $user = $this->clientUser($client);

        $invoice = Invoice::factory()->for($client)->create(['status' => 'sent']);

        $response = $this->actingAs($user)->get(route('portal.invoices.show', $invoice));

        $response->assertOk();
    }

    public function test_client_cannot_view_their_own_draft_invoice(): void
    {
        $client = Client::factory()->create();
        $user = $this->clientUser($client);

        $invoice = Invoice::factory()->for($client)->create(['status' => 'draft']);

        $response = $this->actingAs($user)->get(route('portal.invoices.show', $invoice));

        $response->assertForbidden();
    }

    public function test_client_cannot_reach_admin_invoice_routes(): void
    {
        $client = Client::factory()->create();
        $user = $this->clientUser($client);

        $invoice = Invoice::factory()->for($client)->create(['status' => 'sent']);

        $this->actingAs($user)->get(route('invoices.show', $invoice))->assertForbidden();
        $this->actingAs($user)->get(route('invoices.index'))->assertForbidden();
    }

    public function test_admin_can_view_any_invoice(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()->for(Client::factory())->create(['status' => 'draft']);

        $response = $this->actingAs($admin)->get(route('invoices.show', $invoice));

        $response->assertOk();
    }
}
