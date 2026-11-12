<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Resources\Json\JsonResource;
use Inertia\Inertia;

abstract class Controller
{
    use AuthorizesRequests;

    /**
     * Flash a one-time toast notification, picked up by the frontend's
     * useFlashToast hook via Inertia's native flash mechanism.
     */
    protected function flashToast(string $message, string $type = 'success'): void
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);
    }

    /**
     * Fully resolve a resource (or resource collection) into plain arrays,
     * including anything nested inside it (e.g. a loaded relation exposed via
     * another resource). ->resolve()/->toArray() alone leave nested resources
     * as unresolved objects, which independently re-wrap themselves in a
     * "data" key once Inertia JSON-encodes the response — routing through
     * the real HTTP response pipeline and decoding it back is what Laravel
     * uses internally to resolve everything up front.
     *
     * @return array<int|string, mixed>
     */
    protected function resourceData(JsonResource $resource): array
    {
        return $resource->response()->getData(true)['data'];
    }
}
