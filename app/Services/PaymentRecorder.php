<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentRecorder
{
    /**
     * Record a payment, refusing any amount above the balance at the moment of
     * saving. The invoice row is locked and its balance re-read inside the
     * transaction, so two payments submitted together can't both pass a check
     * made against the same stale balance.
     *
     * @param  array<string, mixed>  $data
     *
     * @throws ValidationException
     */
    public function record(Invoice $invoice, array $data): Payment
    {
        return DB::transaction(function () use ($invoice, $data) {
            $current = Invoice::query()
                ->whereKey($invoice->getKey())
                ->lockForUpdate()
                ->with(['items', 'payments'])
                ->firstOrFail();

            $amount = round((float) $data['amount'], 2);

            if ($amount > $current->balance) {
                throw ValidationException::withMessages([
                    'amount' => 'Amount cannot exceed the remaining balance of '.number_format($current->balance, 2).'.',
                ]);
            }

            return Payment::create([...$data, 'invoice_id' => $current->id, 'amount' => $amount]);
        });
    }
}
