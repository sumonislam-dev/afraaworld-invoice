<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ClientDatabaseGuardTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_refuses_to_delete_a_client_that_has_invoices(): void
    {
        $client = Client::factory()->create();
        $invoice = Invoice::factory()->for($client)->create(['status' => 'sent']);

        $this->expectException(QueryException::class);

        // Bypasses the controller on purpose: the foreign key must still protect the invoice.
        DB::table('clients')->where('id', $client->id)->delete();

        $this->assertDatabaseHas('invoices', ['id' => $invoice->id]);
    }
}
