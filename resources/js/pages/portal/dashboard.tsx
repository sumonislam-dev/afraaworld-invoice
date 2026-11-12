import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import StatusBadge from '@/components/status-badge';
import { dashboard } from '@/routes';
import { show } from '@/routes/portal/invoices';
import type { Invoice, PageProps } from '@/types/models';

type Props = PageProps<{
    invoices: Invoice[];
}>;

export default function PortalDashboard({ invoices }: Props) {
    return (
        <>
            <Head title="Your invoices" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Your invoices"
                    description="Everything billed to you, and what you owe."
                />

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2 font-medium">
                                    Number
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Issued
                                </th>
                                <th className="px-4 py-2 font-medium">Due</th>
                                <th className="px-4 py-2 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Balance
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
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
                                        {invoice.issue_date}
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                        {invoice.due_date}
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
                            {invoices.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
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
        </>
    );
}

PortalDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
