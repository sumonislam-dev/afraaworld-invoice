<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Invoice $invoice): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isClient()
            && $user->client_id === $invoice->client_id
            && $invoice->status !== 'draft';
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->isAdmin() && $invoice->status === 'draft';
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->isAdmin() && $invoice->status === 'draft';
    }

    public function send(User $user, Invoice $invoice): bool
    {
        return $user->isAdmin() && $invoice->status === 'draft';
    }

    public function cancel(User $user, Invoice $invoice): bool
    {
        return $user->isAdmin() && $invoice->status !== 'cancelled';
    }

    public function recordPayment(User $user, Invoice $invoice): bool
    {
        return $user->isAdmin() && $invoice->status !== 'draft' && $invoice->status !== 'cancelled';
    }
}
