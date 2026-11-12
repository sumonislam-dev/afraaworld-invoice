<?php

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Payment
 */
class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'amount' => (float) $this->amount,
            'payment_date' => $this->payment_date->toDateString(),
            'method' => $this->method,
            'note' => $this->note,
            'payment_type' => $this->payment_type,
            'invoice' => $this->whenLoaded('invoice', fn () => [
                'id' => $this->invoice->id,
                'invoice_number' => $this->invoice->invoice_number,
                'currency' => $this->invoice->currency,
                'client' => $this->invoice->relationLoaded('client') ? [
                    'id' => $this->invoice->client->id,
                    'name' => $this->invoice->client->name,
                ] : null,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
