<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceStatusTest extends TestCase
{
    use RefreshDatabase;

    private function invoiceWithTotal(array $attributes, float $unitPrice): Invoice
    {
        $invoice = Invoice::factory()->for(Client::factory())->create(array_merge([
            'tax_rate' => 0,
            'discount_type' => 'fixed',
            'discount_value' => 0,
        ], $attributes));

        $invoice->items()->create([
            'description' => 'Work',
            'quantity' => 1,
            'unit_price' => $unitPrice,
            'sort_order' => 0,
        ]);

        return $invoice->refresh();
    }

    public function test_draft_stays_draft_regardless_of_payments(): void
    {
        $invoice = $this->invoiceWithTotal(['status' => 'draft'], 100);

        $this->assertSame('draft', $invoice->computed_status);
    }

    public function test_sent_invoice_with_no_payment_is_sent(): void
    {
        $invoice = $this->invoiceWithTotal([
            'status' => 'sent',
            'due_date' => now()->addDays(10),
        ], 100);

        $this->assertSame('sent', $invoice->computed_status);
    }

    public function test_partial_payment_transitions_status_to_partial(): void
    {
        $invoice = $this->invoiceWithTotal([
            'status' => 'sent',
            'due_date' => now()->addDays(10),
        ], 100);

        $invoice->payments()->create([
            'amount' => 40,
            'payment_date' => now(),
            'payment_type' => 'partial',
        ]);

        $invoice->refresh();

        $this->assertSame(60.0, $invoice->balance);
        $this->assertSame('partial', $invoice->computed_status);
    }

    public function test_full_payment_transitions_status_to_paid(): void
    {
        $invoice = $this->invoiceWithTotal([
            'status' => 'sent',
            'due_date' => now()->addDays(10),
        ], 100);

        $invoice->payments()->create([
            'amount' => 100,
            'payment_date' => now(),
            'payment_type' => 'full',
        ]);

        $invoice->refresh();

        $this->assertSame(0.0, $invoice->balance);
        $this->assertSame('paid', $invoice->computed_status);
    }

    public function test_unpaid_invoice_past_due_date_is_overdue(): void
    {
        $invoice = $this->invoiceWithTotal([
            'status' => 'sent',
            'issue_date' => now()->subDays(20),
            'due_date' => now()->subDays(5),
        ], 100);

        $this->assertSame('overdue', $invoice->computed_status);
    }

    public function test_cancelled_stays_cancelled_even_if_overdue(): void
    {
        $invoice = $this->invoiceWithTotal([
            'status' => 'cancelled',
            'issue_date' => now()->subDays(20),
            'due_date' => now()->subDays(5),
        ], 100);

        $this->assertSame('cancelled', $invoice->computed_status);
    }
}
