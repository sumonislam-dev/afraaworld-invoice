<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\CompanyProfile;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoicePdfPrintTest extends TestCase
{
    use RefreshDatabase;

    private function invoiceWithPayment(string $status, float $paid): Invoice
    {
        $invoice = Invoice::factory()->for(Client::factory())->create([
            'status' => $status,
            'due_date' => now()->addDays(10),
            'tax_rate' => 0,
            'discount_type' => 'fixed',
            'discount_value' => 0,
        ]);

        $invoice->items()->create([
            'description' => 'Design work',
            'quantity' => 1,
            'unit_price' => 100,
            'sort_order' => 0,
        ]);

        if ($paid > 0) {
            $invoice->payments()->create([
                'amount' => $paid,
                'payment_date' => now(),
                'payment_type' => 'full',
                'method' => 'Bank transfer',
            ]);
        }

        return $invoice->refresh()->load(['client', 'items', 'payments']);
    }

    /**
     * Renders the template the same way InvoicePdfController does, so the
     * assertions reflect what DomPDF receives.
     */
    private function renderInvoice(Invoice $invoice, bool $showHistory): string
    {
        return view('pdf.invoice', [
            'invoice' => $invoice,
            'company' => CompanyProfile::current(),
            'companyLogoDataUri' => null,
            'paymentTermsLabel' => null,
            'showHistory' => $showHistory,
            'showPaidStamp' => $invoice->computed_status === 'paid',
        ])->render();
    }

    public function test_paid_invoice_renders_paid_stamp(): void
    {
        $invoice = $this->invoiceWithPayment('sent', 100);

        $html = $this->renderInvoice($invoice, showHistory: true);

        $this->assertStringContainsString('class="paid-stamp"', $html);
    }

    public function test_unpaid_invoice_has_no_paid_stamp(): void
    {
        $invoice = $this->invoiceWithPayment('sent', 40);

        $html = $this->renderInvoice($invoice, showHistory: true);

        $this->assertStringNotContainsString('class="paid-stamp"', $html);
    }

    public function test_history_table_is_included_when_requested(): void
    {
        $invoice = $this->invoiceWithPayment('sent', 100);

        $html = $this->renderInvoice($invoice, showHistory: true);

        $this->assertStringContainsString('Payment history', $html);
        $this->assertStringContainsString('Bank transfer', $html);
    }

    public function test_history_table_is_omitted_when_not_requested(): void
    {
        $invoice = $this->invoiceWithPayment('sent', 100);

        $html = $this->renderInvoice($invoice, showHistory: false);

        $this->assertStringNotContainsString('Payment history', $html);
        $this->assertStringNotContainsString('Bank transfer', $html);
        // Totals still show the payment so the balance stays readable.
        $this->assertStringContainsString('Balance due', $html);
    }

    public function test_download_flag_sends_pdf_as_attachment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = $this->invoiceWithPayment('sent', 100);

        $this->actingAs($admin)
            ->get(route('invoices.pdf', [$invoice, 'history' => 0, 'download' => 1]))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf')
            ->assertHeader('content-disposition', 'attachment; filename='.$invoice->invoice_number.'.pdf');
    }

    public function test_admin_gets_pdf_with_and_without_history_flag(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = $this->invoiceWithPayment('sent', 100);

        $this->actingAs($admin)
            ->get(route('invoices.pdf', [$invoice, 'history' => 0]))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->actingAs($admin)
            ->get(route('invoices.pdf', $invoice))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }
}
