<?php

namespace App\Http\Requests\Client;

use App\Models\Client;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Drop contact rows the user added but never filled in, so an empty row
     * left over from clicking "Add contact" doesn't fail validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('contacts')) {
            /** @var array<int, array<string, mixed>> $contacts */
            $contacts = $this->input('contacts', []);

            $this->merge([
                'contacts' => array_values(array_filter(
                    $contacts,
                    fn (array $contact) => filled($contact['email'] ?? null) || filled($contact['phone'] ?? null)
                )),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Client $client */
        $client = $this->route('client');

        return [
            'name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'contacts' => ['array'],
            'contacts.*.id' => [
                'nullable',
                'integer',
                Rule::exists('client_contacts', 'id')->where('client_id', $client->id),
            ],
            'contacts.*.label' => ['nullable', 'string', 'max:255'],
            'contacts.*.email' => ['nullable', 'email', 'max:255', 'required_without:contacts.*.phone'],
            'contacts.*.phone' => ['nullable', 'string', 'max:50', 'required_without:contacts.*.email'],
            'contacts.*.is_cc' => ['boolean'],
        ];
    }
}
