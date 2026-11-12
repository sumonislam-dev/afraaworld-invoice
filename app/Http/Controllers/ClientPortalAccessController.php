<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ClientPortalAccessController extends Controller
{
    /**
     * Create (or reset) the portal login for a client and show the
     * temporary password once via a flash message.
     */
    public function store(Client $client): RedirectResponse
    {
        abort_if(blank($client->email), 422, 'Client needs an email address before portal access can be created.');

        $tempPassword = Str::password(12);

        $user = User::where('client_id', $client->id)->where('role', 'client')->first()
            ?? new User;

        $user->name = $client->name;
        $user->email = $client->email;
        $user->password = $tempPassword;
        $user->client_id = $client->id;
        $user->role = 'client';
        $user->force_password_change = true;
        $user->email_verified_at = Carbon::now();
        $user->save();

        $this->flashToast('Portal access ready.');
        Inertia::flash('portalCredentials', [
            'email' => $user->email,
            'password' => $tempPassword,
        ]);

        return redirect()->route('clients.show', $client);
    }
}
