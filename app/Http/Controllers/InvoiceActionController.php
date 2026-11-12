<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\RedirectResponse;

class InvoiceActionController extends Controller
{
    public function send(Invoice $invoice): RedirectResponse
    {
        $this->authorize('send', $invoice);

        $invoice->update(['status' => 'sent']);

        $this->flashToast('Invoice sent.');

        return redirect()->route('invoices.show', $invoice);
    }

    public function cancel(Invoice $invoice): RedirectResponse
    {
        $this->authorize('cancel', $invoice);

        $invoice->update(['status' => 'cancelled']);

        $this->flashToast('Invoice cancelled.');

        return redirect()->route('invoices.show', $invoice);
    }
}
