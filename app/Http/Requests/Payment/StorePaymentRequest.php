<?php

namespace App\Http\Requests\Payment;

use App\Models\Invoice;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $invoice = $this->route('invoice');

        return $invoice instanceof Invoice && $this->user()?->can('recordPayment', $invoice);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'method' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
            'payment_type' => ['required', 'in:advance,partial,final,full'],
        ];
    }

    public function withValidator(ValidatorContract $validator): void
    {
        $validator->after(function (ValidatorContract $validator) {
            /** @var Invoice $invoice */
            $invoice = $this->route('invoice');
            $amount = (float) $this->input('amount');

            if ($amount > $invoice->balance) {
                $validator->errors()->add('amount', 'Amount cannot exceed the remaining balance of '.number_format($invoice->balance, 2).'.');
            }
        });
    }
}
