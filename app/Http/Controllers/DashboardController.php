<?php

namespace App\Http\Controllers;

use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        return $user->isAdmin()
            ? $this->adminDashboard()
            : $this->clientDashboard($user->client_id);
    }

    private function adminDashboard(): Response
    {
        // Balances are computed per invoice (nothing is stored), so the open
        // invoices are walked in chunks rather than loaded all at once.
        $outstanding = 0.0;
        $overdueCount = 0;
        $overdueAmount = 0.0;

        Invoice::with(['items', 'payments'])
            ->where('status', '!=', 'cancelled')
            ->chunkById(200, function ($invoices) use (&$outstanding, &$overdueCount, &$overdueAmount) {
                foreach ($invoices as $invoice) {
                    if ($invoice->status === 'draft' || $invoice->balance <= 0) {
                        continue;
                    }

                    $outstanding += $invoice->balance;

                    if ($invoice->computed_status === 'overdue') {
                        $overdueCount++;
                        $overdueAmount += $invoice->balance;
                    }
                }
            });

        $paidThisMonth = Payment::query()
            ->whereHas('invoice', fn ($query) => $query->where('status', '!=', 'cancelled'))
            ->whereBetween('payment_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
            ->sum('amount');

        $recent = Invoice::with(['client', 'items', 'payments'])
            ->latest('issue_date')
            ->take(10)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'outstandingBalance' => round($outstanding, 2),
                'paidThisMonth' => round((float) $paidThisMonth, 2),
                'overdueCount' => $overdueCount,
                'overdueAmount' => round($overdueAmount, 2),
            ],
            'recentInvoices' => $this->resourceData(InvoiceResource::collection($recent)),
        ]);
    }

    private function clientDashboard(?int $clientId): Response
    {
        $invoices = Invoice::with(['client', 'items', 'payments'])
            ->where('client_id', $clientId)
            ->where('status', '!=', 'draft')
            ->latest('issue_date')
            ->get();

        return Inertia::render('portal/dashboard', [
            'invoices' => $this->resourceData(InvoiceResource::collection($invoices)),
        ]);
    }
}
