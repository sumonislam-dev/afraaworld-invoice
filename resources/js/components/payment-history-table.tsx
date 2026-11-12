import PaymentTypeBadge from '@/components/payment-type-badge';
import type { Payment } from '@/types/models';

export default function PaymentHistoryTable({
    payments,
    currency,
}: {
    payments: Payment[];
    currency: string;
}) {
    return (
        <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
                <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                    <tr>
                        <th className="px-4 py-2 font-medium">Date</th>
                        <th className="px-4 py-2 font-medium">Amount</th>
                        <th className="px-4 py-2 font-medium">Method</th>
                        <th className="px-4 py-2 font-medium">Type</th>
                        <th className="px-4 py-2 font-medium">Note</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id} className="border-b last:border-0">
                            <td className="px-4 py-2 text-muted-foreground">
                                {payment.payment_date}
                            </td>
                            <td className="px-4 py-2 font-medium">
                                {currency} {payment.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                                {payment.method ?? '—'}
                            </td>
                            <td className="px-4 py-2">
                                <PaymentTypeBadge type={payment.payment_type} />
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                                {payment.note ?? '—'}
                            </td>
                        </tr>
                    ))}
                    {payments.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
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
