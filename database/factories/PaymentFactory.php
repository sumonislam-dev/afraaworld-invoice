<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'amount' => fake()->randomFloat(2, 10, 200),
            'payment_date' => now()->toDateString(),
            'method' => fake()->randomElement(['bank_transfer', 'card', 'cash']),
            'note' => null,
            'payment_type' => 'partial',
        ];
    }
}
