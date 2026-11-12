import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import PaginationLinks from '@/components/pagination-links';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { create, index, show } from '@/routes/invoices';
import type { Invoice, Paginated, PageProps } from '@/types/models';

type Props = PageProps<{
    invoices: Paginated<Invoice>;
}>;

export default function InvoicesIndex({ invoices }: Props) {
    return (
        <>
            <Head title="Invoices" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Invoices"
                        description="Everything you've billed."
                    />
                    <Button asChild>
                        <Link href={create()}>New invoice</Link>
                    </Button>
                </div>

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
                            {invoices.data.map((invoice) => (
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
                            {invoices.data.length === 0 && (
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

                <PaginationLinks meta={invoices} />
            </div>
        </>
    );
}

InvoicesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Invoices', href: index() },
    ],
};
