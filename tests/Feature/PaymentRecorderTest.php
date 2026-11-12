<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaymentRecorder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PaymentRecorderTest extends TestCase
{
    use RefreshDatabase;

    private function sentInvoice(float $total): Invoice
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
            'unit_price' => $total,
            'sort_order' => 0,
        ]);

        return $invoice->refresh();
    }

    private function paymentData(float $amount): array
    {
        return [
            'amount' => $amount,
            'payment_date' => now()->toDateString(),
            'payment_type' => 'partial',
        ];
    }

    public function test_payment_above_the_current_balance_is_refused_even_with_a_stale_invoice(): void
    {
        $invoice = $this->sentInvoice(100);

        // Read the balance first, so this copy of the invoice holds 100 outstanding.
        $this->assertSame(100.0, $invoice->balance);

        // Another request records 80 in the meantime.
        Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => 80,
            'payment_date' => now(),
            'payment_type' => 'partial',
        ]);

        $this->expectException(ValidationException::class);

        try {
            app(PaymentRecorder::class)->record($invoice, $this->paymentData(50));
        } finally {
            $this->assertSame(1, Payment::where('invoice_id', $invoice->id)->count());
        }
    }

    public function test_payment_within_the_current_balance_is_recorded(): void
    {
        $invoice = $this->sentInvoice(100);

        $this->assertSame(100.0, $invoice->balance);

        Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => 80,
            'payment_date' => now(),
            'payment_type' => 'partial',
        ]);

        app(PaymentRecorder::class)->record($invoice, $this->paymentData(20));

        $this->assertSame(2, Payment::where('invoice_id', $invoice->id)->count());
        $this->assertSame(0.0, $invoice->fresh()->balance);
    }

    public function test_payment_request_over_the_balance_returns_an_error(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = $this->sentInvoice(100);

        $this->actingAs($admin)
            ->post(route('invoices.payments.store', $invoice), $this->paymentData(150))
            ->assertSessionHasErrors('amount');

        $this->assertSame(0, Payment::where('invoice_id', $invoice->id)->count());
    }
}
