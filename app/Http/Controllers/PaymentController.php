<?php

namespace App\Http\Controllers;

use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentRecorder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(): Response
    {
        $payments = Payment::with(['invoice.client'])
            ->latest('payment_date')
            ->paginate(20)
            ->withQueryString();

        $payload = PaymentResource::collection($payments)->response()->getData(true);

        return Inertia::render('payments/index', [
            'payments' => [
                'data' => $payload['data'],
                'current_page' => $payload['meta']['current_page'],
                'last_page' => $payload['meta']['last_page'],
                'total' => $payload['meta']['total'],
                'prev_page_url' => $payload['links']['prev'],
                'next_page_url' => $payload['links']['next'],
            ],
        ]);
    }

    public function store(StorePaymentRequest $request, Invoice $invoice, PaymentRecorder $recorder): RedirectResponse
    {
        $recorder->record($invoice, $request->validated());

        $this->flashToast('Payment recorded.');

        return redirect()->route('invoices.show', $invoice);
    }
}
