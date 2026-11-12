<?php

namespace App\Concerns;

use Illuminate\Validation\Validator;

/**
 * Keeps a discount from making an invoice total negative: a percentage can't
 * exceed 100, and a fixed amount can't exceed the subtotal of the line items.
 */
trait ValidatesInvoiceDiscount
{
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->has('discount_value') || $validator->errors()->has('discount_type')) {
                return;
            }

            $discount = (float) $this->input('discount_value');

            if ($this->input('discount_type') === 'percent' && $discount > 100) {
                $validator->errors()->add('discount_value', 'A percentage discount cannot be more than 100.');

                return;
            }

            if ($this->input('discount_type') === 'fixed' && $discount > $this->itemsSubtotal()) {
                $validator->errors()->add('discount_value', 'A fixed discount cannot be more than the invoice subtotal of '.number_format($this->itemsSubtotal(), 2).'.');
            }
        });
    }

    private function itemsSubtotal(): float
    {
        $items = $this->input('items', []);

        if (! is_array($items)) {
            return 0.0;
        }

        return round(collect($items)->sum(function ($item) {
            return is_array($item)
                ? (float) ($item['quantity'] ?? 0) * (float) ($item['unit_price'] ?? 0)
                : 0.0;
        }), 2);
    }
}
