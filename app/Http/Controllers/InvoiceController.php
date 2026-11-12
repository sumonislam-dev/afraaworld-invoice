<?php

namespace App\Http\Controllers;

use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Http\Requests\Invoice\UpdateInvoiceRequest;
use App\Http\Resources\ClientResource;
use App\Http\Resources\InvoiceResource;
use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(): Response
    {
        $invoices = Invoice::with(['client', 'items', 'payments'])
            ->latest('issue_date')
            ->paginate(20)
            ->withQueryString();

        $payload = InvoiceResource::collection($invoices)->response()->getData(true);

        return Inertia::render('invoices/index', [
            'invoices' => [
                'data' => $payload['data'],
                'current_page' => $payload['meta']['current_page'],
                'last_page' => $payload['meta']['last_page'],
                'total' => $payload['meta']['total'],
                'prev_page_url' => $payload['links']['prev'],
                'next_page_url' => $payload['links']['next'],
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('invoices/create', [
            'clients' => $this->resourceData(ClientResource::collection(Client::orderBy('name')->get())),
            'selectedClientId' => $request->integer('client_id') ?: null,
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $invoice = DB::transaction(function () use ($request) {
            $invoice = Invoice::create($request->safe()->except('items'));

            $this->syncItems($invoice, $request->validated('items'));

            return $invoice;
        });

        $this->flashToast('Invoice '.($invoice->status === 'sent' ? 'sent' : 'saved as draft').'.');

        return redirect()->route('invoices.show', $invoice);
    }

    public function show(Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load(['client', 'items', 'payments']);

        return Inertia::render('invoices/show', [
            'invoice' => $this->resourceData(new InvoiceResource($invoice)),
            'canEdit' => $invoice->status === 'draft',
            'canSend' => $invoice->status === 'draft',
            'canCancel' => $invoice->status !== 'cancelled',
            'canDelete' => $invoice->status === 'draft',
            'canRecordPayment' => $invoice->status !== 'draft' && $invoice->status !== 'cancelled',
        ]);
    }

    public function edit(Invoice $invoice): Response
    {
        $this->authorize('update', $invoice);

        $invoice->load(['client', 'items']);

        return Inertia::render('invoices/edit', [
            'invoice' => $this->resourceData(new InvoiceResource($invoice)),
            'clients' => $this->resourceData(ClientResource::collection(Client::orderBy('name')->get())),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);

        DB::transaction(function () use ($request, $invoice) {
            $invoice->update($request->safe()->except('items'));

            $invoice->items()->delete();
            $this->syncItems($invoice, $request->validated('items'));
        });

        $this->flashToast('Invoice updated.');

        return redirect()->route('invoices.show', $invoice);
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        $this->authorize('delete', $invoice);

        $invoice->delete();

        $this->flashToast('Invoice deleted.');

        return redirect()->route('invoices.index');
    }

    /**
     * @param  array<int, array{description: string, quantity: numeric-string|float, unit_price: numeric-string|float}>  $items
     */
    private function syncItems(Invoice $invoice, array $items): void
    {
        foreach ($items as $index => $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'sort_order' => $index,
            ]);
        }
    }
}
