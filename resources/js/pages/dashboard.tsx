import { Head, Link } from '@inertiajs/react';
import StatusBadge from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { show } from '@/routes/invoices';
import type { Invoice, PageProps } from '@/types/models';

type Props = PageProps<{
    stats: {
        outstandingBalance: number;
        paidThisMonth: number;
        overdueCount: number;
        overdueAmount: number;
    };
    recentInvoices: Invoice[];
}>;

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
                {value}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ stats, recentInvoices }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Outstanding balance"
                        value={`$${stats.outstandingBalance.toFixed(2)}`}
                    />
                    <StatCard
                        label="Paid this month"
                        value={`$${stats.paidThisMonth.toFixed(2)}`}
                    />
                    <StatCard
                        label="Overdue"
                        value={`${stats.overdueCount} ($${stats.overdueAmount.toFixed(2)})`}
                    />
                </div>

                <div>
                    <h3 className="mb-2 text-base font-medium">
                        Recent invoices
                    </h3>
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-2 font-medium">
                                        Number
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Client
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentInvoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="border-b last:border-0 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-2">
                                            <Link
                                                href={show(invoice.id)}
                                                className="font-medium underline-offset-4 hover:underline"
                                            >
                                                {invoice.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {invoice.client?.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            <StatusBadge
                                                status={invoice.computed_status}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            {invoice.currency}{' '}
                                            {invoice.balance.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {recentInvoices.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No invoices yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
