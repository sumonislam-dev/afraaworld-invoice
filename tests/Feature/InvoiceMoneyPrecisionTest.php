<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceMoneyPrecisionTest extends TestCase
{
    use RefreshDatabase;

    public function test_line_totals_are_exact_to_the_cent(): void
    {
        $invoice = Invoice::factory()->for(Client::factory())->create([
            'status' => 'sent',
            'due_date' => now()->addDays(10),
            'tax_rate' => 0,
            'discount_type' => 'fixed',
            'discount_value' => 0,
        ]);

        $invoice->items()->create([
            'description' => 'Hours',
            'quantity' => 3,
            'unit_price' => 19.99,
            'sort_order' => 0,
        ]);

        $this->assertSame(59.97, $invoice->refresh()->subtotal);
    }

    public function test_repeated_payments_do_not_leave_a_phantom_fraction_of_a_cent(): void
    {
        $invoice = Invoice::factory()->for(Client::factory())->create([
            'status' => 'sent',
            'due_date' => now()->addDays(10),
            'tax_rate' => 0,
            'discount_type' => 'fixed',
            'discount_value' => 0,
        ]);

        $invoice->items()->create([
            'description' => 'Work',
            'quantity' => 1,
            'unit_price' => 100,
            'sort_order' => 0,
        ]);

        foreach ([33.33, 33.33, 33.33] as $amount) {
            $invoice->payments()->create([
                'amount' => $amount,
                'payment_date' => now(),
                'payment_type' => 'partial',
            ]);
        }

        $invoice->refresh();

        $this->assertSame(99.99, $invoice->amount_paid);
        $this->assertSame(0.01, $invoice->balance);
        $this->assertSame('partial', $invoice->computed_status);
    }
}
