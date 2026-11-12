import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import PaymentsTable from '@/components/payments-table';
import StatusBadge from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard } from '@/routes';
import { edit, index, portalAccess, show } from '@/routes/clients';
import {
    create as createInvoice,
    show as showInvoice,
} from '@/routes/invoices';
import type { Client, Invoice, PageProps, Payment } from '@/types/models';

type Props = PageProps<{
    client: Client;
    invoices: Invoice[];
}>;

export default function ClientsShow({ client, invoices }: Props) {
    const { flash } = usePage();
    const [dismissedCredentials, setDismissedCredentials] = useState(false);

    const credentials = dismissedCredentials
        ? undefined
        : flash.portalCredentials;

    const payments: Payment[] = invoices.flatMap((invoice) =>
        invoice.payments.map((payment) => ({
            ...payment,
            invoice: {
                id: invoice.id,
                invoice_number: invoice.invoice_number,
                currency: invoice.currency,
                client: null,
            },
        })),
    );

    return (
        <>
            <Head title={client.name} />

            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={client.name}
                        description={client.company ?? undefined}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={edit(client.id)}>Edit</Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={createInvoice({
                                    query: { client_id: client.id },
                                })}
                            >
                                New invoice
                            </Link>
                        </Button>
                    </div>
                </div>

                {credentials && (
                    <Card className="border-emerald-400">
                        <CardHeader>
                            <CardTitle>Portal access ready</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                                Share these with {client.name}. This password is
                                shown only once — it won't be displayed again.
                            </p>
                            <div className="flex gap-2">
                                <span className="font-medium">Email:</span>{' '}
                                {credentials.email}
                            </div>
                            <div className="flex gap-2">
                                <span className="font-medium">
                                    Temporary password:
                                </span>{' '}
                                <code className="rounded bg-muted px-1.5 py-0.5">
                                    {credentials.password}
                                </code>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDismissedCredentials(true)}
                            >
                                Dismiss
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="space-y-1">
                                <p>{client.email ?? 'No email on file'}</p>
                                <p>{client.phone ?? 'No phone on file'}</p>
                                <p className="whitespace-pre-line text-muted-foreground">
                                    {client.address ?? 'No address on file'}
                                </p>
                            </div>

                            {client.contacts && client.contacts.length > 0 && (
                                <div className="space-y-2 border-t pt-3">
                                    {client.contacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className="space-y-0.5"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {contact.label || 'Contact'}
                                                </span>
                                                {contact.is_cc && (
                                                    <Badge variant="outline">
                                                        CC on invoices
                                                    </Badge>
                                                )}
                                            </div>
                                            {contact.email && (
                                                <p className="text-muted-foreground">
                                                    {contact.email}
                                                </p>
                                            )}
                                            {contact.phone && (
                                                <p className="text-muted-foreground">
                                                    {contact.phone}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Portal access</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p className="text-muted-foreground">
                                {client.has_portal_access
                                    ? 'This client can log in to view their invoices.'
                                    : 'This client cannot log in yet.'}
                            </p>
                            <Link
                                href={portalAccess(client.id)}
                                method="post"
                                as="button"
                                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
                            >
                                {client.has_portal_access
                                    ? 'Reset portal password'
                                    : 'Give portal access'}
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="invoices" className="space-y-3">
                    <TabsList>
                        <TabsTrigger value="invoices">Invoices</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="invoices">
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
                                                    href={showInvoice(
                                                        invoice.id,
                                                    )}
                                                    className="font-medium underline-offset-4 hover:underline"
                                                >
                                                    {invoice.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {invoice.issue_date}
                                            </td>
                                            <td className="px-4 py-2">
                                                <StatusBadge
                                                    status={
                                                        invoice.computed_status
                                                    }
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
                    </TabsContent>

                    <TabsContent value="payments">
                        <PaymentsTable payments={payments} />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

ClientsShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Clients', href: index() },
        { title: props.client.name, href: show(props.client.id) },
    ],
});
