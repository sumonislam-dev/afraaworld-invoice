<?php

namespace App\Models;

use App\Services\InvoiceCalculator;
use App\Services\InvoiceTotals;
use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Money and status values are computed by InvoiceCalculator, not stored.
 *
 * @property-read float $subtotal
 * @property-read float $discount_amount
 * @property-read float $taxable_amount
 * @property-read float $tax_amount
 * @property-read float $total
 * @property-read float $amount_paid
 * @property-read float $balance
 * @property-read string $computed_status
 * @property Carbon $issue_date
 * @property Carbon $due_date
 */
class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasFactory;

    protected $fillable = [
        'client_id',
        'issue_date',
        'due_date',
        'status',
        'currency',
        'tax_rate',
        'discount_type',
        'discount_value',
        'notes',
    ];

    protected ?InvoiceTotals $cachedTotals = null;

    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (! $invoice->invoice_number) {
                $invoice->invoice_number = $invoice->generateInvoiceNumber();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'tax_rate' => 'decimal:2',
            'discount_value' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Client, $this> */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /** @return HasMany<InvoiceItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->orderBy('payment_date');
    }

    /**
     * Compute (and memoize) subtotal/tax/discount/balance/status for this
     * instance. None of these are stored columns — see InvoiceCalculator.
     */
    public function totals(): InvoiceTotals
    {
        return $this->cachedTotals ??= app(InvoiceCalculator::class)->calculate($this);
    }

    /** @return Attribute<float, never> */
    protected function subtotal(): Attribute
    {
        return Attribute::get(fn () => $this->totals()->subtotal);
    }

    /** @return Attribute<float, never> */
    protected function discountAmount(): Attribute
    {
        return Attribute::get(fn () => $this->totals()->discountAmount);
    }

    /** @return Attribute<float, never> */
    protected function taxableAmount(): Attribute
    {
        return Attribute::get(fn () => $this->totals()->taxableAmount);
    }

    /** @return Attribute<float, never> */
    protected function taxAmount(): Attribute
    {
        return Attribute::get(fn () => $this->totals()->taxAmount);
    }

    /** @return Attribute<float, never> */
    protected function total(): Attribute
    {
        return Attribute::get(fn () => $this->totals()->total);
    }

    /** @return Attribute<float, never> */
    protected function amountPaid(): Attribute
    {
        return Attribute::get(fn () => $this->totals()->amountPaid);
    }

    /** @return Attribute<float, never> */
    protected function balance(): Attribute
    {
        return Attribute::get(fn () => $this->totals()->balance);
    }

    /** @return Attribute<string, never> */
    protected function computedStatus(): Attribute
    {
        return Attribute::get(fn () => $this->totals()->computedStatus);
    }

    private function generateInvoiceNumber(): string
    {
        $year = Carbon::parse($this->issue_date ?? now())->year;

        return DB::transaction(function () use ($year) {
            $last = static::where('invoice_number', 'like', "INV-{$year}-%")
                ->lockForUpdate()
                ->orderByDesc('invoice_number')
                ->value('invoice_number');

            $next = $last ? ((int) substr($last, -4)) + 1 : 1;

            return sprintf('INV-%d-%04d', $year, $next);
        });
    }
}
