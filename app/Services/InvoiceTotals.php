<?php

namespace App\Services;

readonly class InvoiceTotals
{
    public function __construct(
        public float $subtotal,
        public float $discountAmount,
        public float $taxableAmount,
        public float $taxAmount,
        public float $total,
        public float $amountPaid,
        public float $balance,
        public string $computedStatus,
    ) {}
}
