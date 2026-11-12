import { Head, Link } from '@inertiajs/react';
import { ChevronDown, Download } from 'lucide-react';
import Heading from '@/components/heading';
import InvoiceSummaryCard from '@/components/invoice-summary-card';
import PaymentHistoryTable from '@/components/payment-history-table';
import RecordPaymentForm from '@/components/record-payment-form';
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
import { show as showClient } from '@/routes/clients';
import {
    cancel,
    destroy,
    edit,
    index,
    pdf,
    send,
    show,
} from '@/routes/invoices';
import { store as storePayment } from '@/routes/invoices/payments';
import type { Invoice, PageProps } from '@/types/models';

type Props = PageProps<{
    invoice: Invoice;
    canEdit: boolean;
    canSend: boolean;
    canCancel: boolean;
    canDelete: boolean;
    canRecordPayment: boolean;
}>;

export default function InvoicesShow({
    invoice,
    canEdit,
    canSend,
    canCancel,
    canDelete,
    canRecordPayment,
}: Props) {
    return (
        <>
            <Head title={invoice.invoice_number} />

            <div className="max-w-3xl space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <Heading title={invoice.invoice_number} />
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Link
                                href={showClient(invoice.client_id)}
                                className="hover:underline"
                            >
                                {invoice.client?.name}
                            </Link>
                            <span aria-hidden>·</span>
                            <StatusBadge status={invoice.computed_status} />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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

                        {canEdit && (
                            <Button variant="outline" asChild>
                                <Link href={edit(invoice.id)}>Edit</Link>
                            </Button>
                        )}
                        {canSend && (
                            <Button asChild>
                                <Link
                                    href={send(invoice.id)}
                                    method="post"
                                    as="button"
                                >
                                    Send
                                </Link>
                            </Button>
                        )}
                        {canCancel && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={cancel(invoice.id)}
                                    method="post"
                                    as="button"
                                    onBefore={() =>
                                        confirm('Cancel this invoice?')
                                    }
                                >
                                    Cancel
                                </Link>
                            </Button>
                        )}
                        {canDelete && (
                            <Button variant="destructive" asChild>
                                <Link
                                    href={destroy(invoice.id)}
                                    method="delete"
                                    as="button"
                                    onBefore={() =>
                                        confirm(
                                            'Delete this draft invoice? This cannot be undone.',
                                        )
                                    }
                                >
                                    Delete
                                </Link>
                            </Button>
                        )}
                    </div>
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

                {canRecordPayment && invoice.balance > 0 && (
                    <div>
                        <h3 className="mb-2 text-base font-medium">
                            Record a payment
                        </h3>
                        <RecordPaymentForm
                            action={storePayment(invoice.id).url}
                            balance={invoice.balance}
                            currency={invoice.currency}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

InvoicesShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Invoices', href: index() },
        { title: props.invoice.invoice_number, href: show(props.invoice.id) },
    ],
});
