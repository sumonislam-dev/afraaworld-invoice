<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    private function invoice(string $status, float $amount, $dueDate = null): Invoice
    {
        $invoice = Invoice::factory()->for(Client::factory())->create([
            'status' => $status,
            'due_date' => $dueDate ?? now()->addDays(10),
            'tax_rate' => 0,
            'discount_type' => 'fixed',
            'discount_value' => 0,
        ]);

        $invoice->items()->create([
            'description' => 'Work',
            'quantity' => 1,
            'unit_price' => $amount,
            'sort_order' => 0,
        ]);

        return $invoice;
    }

    public function test_admin_dashboard_counts_outstanding_overdue_and_paid_this_month(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Partly paid: outstanding 60, not overdue because a payment was made.
        $partial = $this->invoice('sent', 100);
        $partial->payments()->create(['amount' => 40, 'payment_date' => now(), 'payment_type' => 'partial']);

        // Unpaid and past due: outstanding 50 and overdue 50.
        $this->invoice('sent', 50, now()->subDays(5));

        // Excluded: a cancelled invoice and a draft.
        $this->invoice('cancelled', 500);
        $this->invoice('draft', 70);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('stats.outstandingBalance', 110)
                ->where('stats.paidThisMonth', 40)
                ->where('stats.overdueCount', 1)
                ->where('stats.overdueAmount', 50));
    }
}
