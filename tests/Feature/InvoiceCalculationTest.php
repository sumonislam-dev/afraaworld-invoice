<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_totals_apply_discount_then_tax_in_order(): void
    {
        $invoice = Invoice::factory()->for(Client::factory())->create([
            'tax_rate' => 10,
            'discount_type' => 'percent',
            'discount_value' => 10,
        ]);

        $invoice->items()->create([
            'description' => 'Design work',
            'quantity' => 2,
            'unit_price' => 100,
            'sort_order' => 0,
        ]);
        $invoice->items()->create([
            'description' => 'Dev work',
            'quantity' => 1,
            'unit_price' => 300,
            'sort_order' => 1,
        ]);

        $invoice->refresh();

        // subtotal = 2*100 + 1*300 = 500
        $this->assertSame(500.0, $invoice->subtotal);
        // discount = 10% of 500 = 50
        $this->assertSame(50.0, $invoice->discount_amount);
        // taxable = 500 - 50 = 450, tax = 10% of 450 = 45
        $this->assertSame(45.0, $invoice->tax_amount);
        // total = 450 + 45 = 495
        $this->assertSame(495.0, $invoice->total);
    }

    public function test_fixed_discount_is_subtracted_verbatim(): void
    {
        $invoice = Invoice::factory()->for(Client::factory())->create([
            'tax_rate' => 0,
            'discount_type' => 'fixed',
            'discount_value' => 25,
        ]);

        $invoice->items()->create([
            'description' => 'Consulting',
            'quantity' => 1,
            'unit_price' => 200,
            'sort_order' => 0,
        ]);

        $invoice->refresh();

        $this->assertSame(200.0, $invoice->subtotal);
        $this->assertSame(25.0, $invoice->discount_amount);
        $this->assertSame(0.0, $invoice->tax_amount);
        $this->assertSame(175.0, $invoice->total);
    }

    public function test_balance_is_total_minus_all_payments(): void
    {
        $invoice = Invoice::factory()->for(Client::factory())->create([
            'tax_rate' => 0,
            'discount_type' => 'fixed',
            'discount_value' => 0,
        ]);

        $invoice->items()->create([
            'description' => 'Retainer',
            'quantity' => 1,
            'unit_price' => 1000,
            'sort_order' => 0,
        ]);

        $invoice->payments()->create([
            'amount' => 300,
            'payment_date' => now(),
            'payment_type' => 'advance',
        ]);
        $invoice->payments()->create([
            'amount' => 200,
            'payment_date' => now(),
            'payment_type' => 'partial',
        ]);

        $invoice->refresh();

        $this->assertSame(1000.0, $invoice->total);
        $this->assertSame(500.0, $invoice->amount_paid);
        $this->assertSame(500.0, $invoice->balance);
    }
}
