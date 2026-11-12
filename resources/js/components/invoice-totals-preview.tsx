import type { DraftInvoiceItem } from '@/components/invoice-items-editor';
import type { DiscountType } from '@/types/models';

interface InvoiceTotalsPreviewProps {
    items: DraftInvoiceItem[];
    taxRate: number;
    discountType: DiscountType;
    discountValue: number;
    currency: string;
}

function money(value: number, currency: string): string {
    return `${currency} ${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Client-side preview ONLY, mirroring App\Services\InvoiceCalculator so the
 * numbers shown here match what the backend will compute on save. The saved
 * invoice always trusts the server's recalculation, never these values.
 */
export default function InvoiceTotalsPreview({
    items,
    taxRate,
    discountType,
    discountValue,
    currency,
}: InvoiceTotalsPreviewProps) {
    const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0,
    );
    const discountAmount =
        discountType === 'percent'
            ? (subtotal * discountValue) / 100
            : discountValue;
    const taxable = subtotal - discountAmount;
    const taxAmount = (taxable * taxRate) / 100;
    const total = taxable + taxAmount;

    const rows: [string, number][] = [
        ['Subtotal', subtotal],
        ['Discount', -discountAmount],
        ['Tax', taxAmount],
    ];

    return (
        <div className="space-y-1 rounded-lg border p-4 text-sm tabular-nums">
            {rows.map(([label, value]) => (
                <div
                    key={label}
                    className="flex justify-between text-muted-foreground"
                >
                    <span>{label}</span>
                    <span>{money(value, currency)}</span>
                </div>
            ))}
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{money(total, currency)}</span>
            </div>
        </div>
    );
}
