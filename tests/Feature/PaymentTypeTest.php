<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTypeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * payment_type is a display-only label — the balance math must be
     * identical no matter which type is chosen for a given amount.
     */
    public function test_payment_type_never_changes_the_balance_calculation(): void
    {
        $totals = [];

        foreach (['advance', 'partial', 'final', 'full'] as $type) {
            $invoice = Invoice::factory()->for(Client::factory())->create([
                'tax_rate' => 0,
                'discount_type' => 'fixed',
                'discount_value' => 0,
                'status' => 'sent',
            ]);

            $invoice->items()->create([
                'description' => 'Work',
                'quantity' => 1,
                'unit_price' => 100,
                'sort_order' => 0,
            ]);

            $invoice->payments()->create([
                'amount' => 40,
                'payment_date' => now(),
                'payment_type' => $type,
            ]);

            $invoice->refresh();

            $totals[$type] = [$invoice->amount_paid, $invoice->balance];
        }

        $this->assertSame([40.0, 60.0], $totals['advance']);
        $this->assertSame($totals['advance'], $totals['partial']);
        $this->assertSame($totals['advance'], $totals['final']);
        $this->assertSame($totals['advance'], $totals['full']);
    }

    public function test_payment_type_can_be_null(): void
    {
        $invoice = Invoice::factory()->for(Client::factory())->create([
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

        $invoice->payments()->create([
            'amount' => 100,
            'payment_date' => now(),
            'payment_type' => null,
        ]);

        $invoice->refresh();

        $this->assertSame(0.0, $invoice->balance);
        $this->assertNull($invoice->payments->first()->payment_type);
    }
}
