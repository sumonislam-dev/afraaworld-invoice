import { Head } from '@inertiajs/react';
import { ChevronDown, Download } from 'lucide-react';
import Heading from '@/components/heading';
import InvoiceSummaryCard from '@/components/invoice-summary-card';
import PaymentHistoryTable from '@/components/payment-history-table';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboard } from '@/routes';
import { pdf, show } from '@/routes/portal/invoices';
import type { Invoice, PageProps } from '@/types/models';

type Props = PageProps<{
    invoice: Invoice;
}>;

export default function PortalInvoiceShow({ invoice }: Props) {
    return (
        <>
            <Head title={invoice.invoice_number} />

            <div className="max-w-3xl space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <Heading title={invoice.invoice_number} />
                        <StatusBadge status={invoice.computed_status} />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="size-4" />
                                PDF
                                <ChevronDown className="size-4 opacity-60" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem asChild>
                                <a
                                    href={`${pdf(invoice.id).url}?history=1&download=1`}
                                >
                                    With payment history
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a
                                    href={`${pdf(invoice.id).url}?history=0&download=1`}
                                >
                                    Without payment history
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Issue date
                                </span>
                                <span>{invoice.issue_date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Due date
                                </span>
                                <span>{invoice.due_date}</span>
                            </div>
                            {invoice.notes && (
                                <p className="pt-2 whitespace-pre-line text-muted-foreground">
                                    {invoice.notes}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <InvoiceSummaryCard invoice={invoice} />
                </div>

                <div>
                    <h3 className="mb-2 text-base font-medium">Line items</h3>
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-2 font-medium">
                                        Description
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Qty
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Unit price
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Line total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-2">
                                            {item.description}
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {invoice.currency}{' '}
                                            {item.unit_price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2">
                                            {invoice.currency}{' '}
                                            {(
                                                item.quantity * item.unit_price
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-base font-medium">
                        Payment history
                    </h3>
                    <PaymentHistoryTable
                        payments={invoice.payments}
                        currency={invoice.currency}
                    />
                </div>
            </div>
        </>
    );
}

PortalInvoiceShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: props.invoice.invoice_number, href: show(props.invoice.id) },
    ],
});
