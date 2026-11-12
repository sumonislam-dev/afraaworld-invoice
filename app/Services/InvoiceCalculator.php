<?php

namespace App\Services;

use App\Models\Invoice;
use Illuminate\Support\Carbon;

class InvoiceCalculator
{
    /**
     * Compute all money totals and the derived display status for an invoice.
     *
     * Relies on invoice.items and invoice.payments being loaded (or lazily
     * loads them); never reads any stored total/balance column, since none
     * exist by design.
     */
    public function calculate(Invoice $invoice): InvoiceTotals
    {
        // Every amount is worked out in whole cents and only converted back to
        // floats at the end, so repeated additions can't drift by a cent.
        $subtotal = $invoice->items->sum(fn ($item) => $this->toCents((float) $item->quantity * (float) $item->unit_price));

        $discount = $invoice->discount_type === 'percent'
            ? (int) round($subtotal * (float) $invoice->discount_value / 100)
            : $this->toCents((float) $invoice->discount_value);

        $taxable = $subtotal - $discount;
        $tax = (int) round($taxable * (float) $invoice->tax_rate / 100);
        $total = $taxable + $tax;

        $paid = $invoice->payments->sum(fn ($payment) => $this->toCents((float) $payment->amount));
        $balance = $total - $paid;

        return new InvoiceTotals(
            subtotal: $this->fromCents($subtotal),
            discountAmount: $this->fromCents($discount),
            taxableAmount: $this->fromCents($taxable),
            taxAmount: $this->fromCents($tax),
            total: $this->fromCents($total),
            amountPaid: $this->fromCents($paid),
            balance: $this->fromCents($balance),
            computedStatus: $this->computedStatus($invoice, $this->fromCents($paid), $this->fromCents($balance)),
        );
    }

    private function toCents(float $amount): int
    {
        return (int) round($amount * 100);
    }

    private function fromCents(int $cents): float
    {
        return $cents / 100;
    }

    private function computedStatus(Invoice $invoice, float $amountPaid, float $balance): string
    {
        if (in_array($invoice->status, ['draft', 'cancelled'], true)) {
            return $invoice->status;
        }

        if ($balance <= 0) {
            return 'paid';
        }

        if ($amountPaid > 0) {
            return 'partial';
        }

        if (Carbon::parse($invoice->due_date)->isPast()) {
            return 'overdue';
        }

        return 'sent';
    }
}
