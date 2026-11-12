<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasChangedPassword
{
    /**
     * Redirect users who were issued a temporary password to the security
     * settings page until they set their own password.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $exempt = $request->routeIs('security.edit')
            || $request->routeIs('user-password.update')
            || $request->routeIs('logout');

        if ($user && $user->force_password_change && ! $exempt) {
            return redirect()->route('security.edit')
                ->with('status', 'Please set a new password before continuing.');
        }

        return $next($request);
    }
}
