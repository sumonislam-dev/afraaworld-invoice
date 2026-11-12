import type { Invoice } from '@/types/models';

function money(value: number, currency: string): string {
    return `${currency} ${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/** Renders the backend-computed totals for a saved invoice — never recalculated here. */
export default function InvoiceSummaryCard({ invoice }: { invoice: Invoice }) {
    const rows: [string, number][] = [
        ['Subtotal', invoice.subtotal],
        ['Discount', -invoice.discount_amount],
        ['Tax', invoice.tax_amount],
    ];

    return (
        <div className="space-y-1 rounded-lg border p-4 text-sm">
            {rows.map(([label, value]) => (
                <div
                    key={label}
                    className="flex justify-between text-muted-foreground"
                >
                    <span>{label}</span>
                    <span>{money(value, invoice.currency)}</span>
                </div>
            ))}
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{money(invoice.total, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
                <span>Paid</span>
                <span>{money(invoice.amount_paid, invoice.currency)}</span>
            </div>
            <div className="flex justify-between font-semibold">
                <span>Balance</span>
                <span>{money(invoice.balance, invoice.currency)}</span>
            </div>
        </div>
    );
}
