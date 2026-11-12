<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceDiscountValidationTest extends TestCase
{
    use RefreshDatabase;

    /** The default items below have a subtotal of 100.00. */
    private function payload(Client $client, array $overrides = []): array
    {
        return array_merge([
            'client_id' => $client->id,
            'issue_date' => '2026-11-01',
            'due_date' => '2026-11-30',
            'status' => 'draft',
            'currency' => 'BDT',
            'tax_rate' => 0,
            'discount_type' => 'percent',
            'discount_value' => 0,
            'notes' => null,
            'items' => [
                ['description' => 'Work', 'quantity' => 1, 'unit_price' => 100],
            ],
        ], $overrides);
    }

    public function test_percent_discount_above_100_is_rejected_on_create(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->create();

        $this->actingAs($admin)
            ->post(route('invoices.store'), $this->payload($client, ['discount_value' => 150]))
            ->assertSessionHasErrors('discount_value');

        $this->assertDatabaseCount('invoices', 0);
    }

    public function test_percent_discount_of_exactly_100_is_accepted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->create();

        $this->actingAs($admin)
            ->post(route('invoices.store'), $this->payload($client, ['discount_value' => 100]))
            ->assertSessionDoesntHaveErrors();

        $this->assertDatabaseCount('invoices', 1);
    }

    public function test_fixed_discount_above_subtotal_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->create();

        $this->actingAs($admin)
            ->post(route('invoices.store'), $this->payload($client, [
                'discount_type' => 'fixed',
                'discount_value' => 100.01,
            ]))
            ->assertSessionHasErrors('discount_value');

        $this->assertDatabaseCount('invoices', 0);
    }

    public function test_fixed_discount_equal_to_subtotal_is_accepted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->create();

        $this->actingAs($admin)
            ->post(route('invoices.store'), $this->payload($client, [
                'discount_type' => 'fixed',
                'discount_value' => 100,
            ]))
            ->assertSessionDoesntHaveErrors();

        $this->assertDatabaseCount('invoices', 1);
    }

    public function test_percent_discount_above_100_is_rejected_on_update(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->create();
        $invoice = Invoice::factory()->for($client)->create(['status' => 'draft']);
        $invoice->items()->create([
            'description' => 'Work',
            'quantity' => 1,
            'unit_price' => 100,
            'sort_order' => 0,
        ]);

        $this->actingAs($admin)
            ->put(route('invoices.update', $invoice), $this->payload($client, ['discount_value' => 120]))
            ->assertSessionHasErrors('discount_value');

        $this->assertSame(0.0, (float) $invoice->fresh()->discount_value);
    }
}
