<?php

namespace App\Http\Resources;

use App\Models\ClientContact;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ClientContact
 */
class ClientContactResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'email' => $this->email,
            'phone' => $this->phone,
            'is_cc' => $this->is_cc,
        ];
    }
}
