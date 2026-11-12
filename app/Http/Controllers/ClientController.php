<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Http\Resources\InvoiceResource;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(): Response
    {
        $clients = Client::withCount('invoices')
            ->with('users')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $payload = ClientResource::collection($clients)->response()->getData(true);

        return Inertia::render('clients/index', [
            'clients' => [
                'data' => $payload['data'],
                'current_page' => $payload['meta']['current_page'],
                'last_page' => $payload['meta']['last_page'],
                'total' => $payload['meta']['total'],
                'prev_page_url' => $payload['links']['prev'],
                'next_page_url' => $payload['links']['next'],
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('clients/create');
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        $client = DB::transaction(function () use ($request) {
            $client = Client::create($request->safe()->except('contacts'));

            $this->syncContacts($client, $request->validated('contacts', []));

            return $client;
        });

        $this->flashToast('Client created.');

        return redirect()->route('clients.show', $client);
    }

    public function show(Client $client): Response
    {
        $client->load(['users', 'contacts']);

        $invoices = $client->invoices()
            ->with(['items', 'payments'])
            ->latest('issue_date')
            ->get();

        return Inertia::render('clients/show', [
            'client' => $this->resourceData(new ClientResource($client)),
            'invoices' => $this->resourceData(InvoiceResource::collection($invoices)),
        ]);
    }

    public function edit(Client $client): Response
    {
        $client->load('contacts');

        return Inertia::render('clients/edit', [
            'client' => $this->resourceData(new ClientResource($client)),
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        DB::transaction(function () use ($request, $client) {
            $client->update($request->safe()->except('contacts'));

            $this->syncContacts($client, $request->validated('contacts', []));
        });

        $this->flashToast('Client updated.');

        return redirect()->route('clients.show', $client);
    }

    /**
     * @param  array<int, array{id?: int|null, label?: string|null, email?: string|null, phone?: string|null, is_cc?: bool}>  $contacts
     */
    private function syncContacts(Client $client, array $contacts): void
    {
        $contacts = array_filter(
            $contacts,
            fn (array $contact) => filled($contact['email'] ?? null) || filled($contact['phone'] ?? null)
        );

        $client->contacts()->whereNotIn('id', array_filter(array_column($contacts, 'id')))->delete();

        foreach ($contacts as $contact) {
            $client->contacts()->updateOrCreate(
                ['id' => $contact['id'] ?? null],
                [
                    'label' => $contact['label'] ?? null,
                    'email' => $contact['email'] ?? null,
                    'phone' => $contact['phone'] ?? null,
                    'is_cc' => $contact['is_cc'] ?? false,
                ]
            );
        }
    }

    /**
     * A client with invoices can't be deleted, because deleting it would also
     * remove those invoices and their payments from the database.
     */
    public function destroy(Client $client): RedirectResponse
    {
        if ($client->invoices()->exists()) {
            $this->flashToast('This client has invoices, so it cannot be deleted. Invoices and payments are kept for your records.', 'error');

            return redirect()->route('clients.show', $client);
        }

        DB::transaction(function () use ($client) {
            $client->users()->delete();
            $client->delete();
        });

        $this->flashToast('Client deleted.');

        return redirect()->route('clients.index');
    }
}
