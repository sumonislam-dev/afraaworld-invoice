import { Link } from '@inertiajs/react';
import PaymentTypeBadge from '@/components/payment-type-badge';
import { show as showClient } from '@/routes/clients';
import { show as showInvoice } from '@/routes/invoices';
import type { Payment } from '@/types/models';

export default function PaymentsTable({
    payments,
    showClientColumn = false,
}: {
    payments: Payment[];
    showClientColumn?: boolean;
}) {
    const columnCount = showClientColumn ? 6 : 5;

    return (
        <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
                <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                    <tr>
                        <th className="px-4 py-2 font-medium">Date</th>
                        <th className="px-4 py-2 font-medium">Invoice</th>
                        {showClientColumn && (
                            <th className="px-4 py-2 font-medium">Client</th>
                        )}
                        <th className="px-4 py-2 font-medium">Amount</th>
                        <th className="px-4 py-2 font-medium">Method</th>
                        <th className="px-4 py-2 font-medium">Type</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr
                            key={payment.id}
                            className="border-b last:border-0 hover:bg-muted/30"
                        >
                            <td className="px-4 py-2 text-muted-foreground">
                                {payment.payment_date}
                            </td>
                            <td className="px-4 py-2">
                                {payment.invoice ? (
                                    <Link
                                        href={showInvoice(payment.invoice.id)}
                                        className="font-medium underline-offset-4 hover:underline"
                                    >
                                        {payment.invoice.invoice_number}
                                    </Link>
                                ) : (
                                    '—'
                                )}
                            </td>
                            {showClientColumn && (
                                <td className="px-4 py-2">
                                    {payment.invoice?.client ? (
                                        <Link
                                            href={showClient(
                                                payment.invoice.client.id,
                                            )}
                                            className="underline-offset-4 hover:underline"
                                        >
                                            {payment.invoice.client.name}
                                        </Link>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                            )}
                            <td className="px-4 py-2 font-medium">
                                {payment.invoice?.currency ?? ''}{' '}
                                {payment.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                                {payment.method ?? '—'}
                            </td>
                            <td className="px-4 py-2">
                                <PaymentTypeBadge type={payment.payment_type} />
                            </td>
                        </tr>
                    ))}
                    {payments.length === 0 && (
                        <tr>
                            <td
                                colSpan={columnCount}
                                className="px-4 py-8 text-center text-muted-foreground"
                            >
                                No payments recorded yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
