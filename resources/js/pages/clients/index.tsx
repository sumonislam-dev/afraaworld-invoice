import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import PaginationLinks from '@/components/pagination-links';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { create, index, show } from '@/routes/clients';
import type { Client, Paginated, PageProps } from '@/types/models';

type Props = PageProps<{
    clients: Paginated<Client>;
}>;

export default function ClientsIndex({ clients }: Props) {
    return (
        <>
            <Head title="Clients" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Clients"
                        description="Everyone you bill, in one place."
                    />
                    <Button asChild>
                        <Link href={create()}>New client</Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2 font-medium">Name</th>
                                <th className="px-4 py-2 font-medium">
                                    Company
                                </th>
                                <th className="px-4 py-2 font-medium">Email</th>
                                <th className="px-4 py-2 font-medium">
                                    Portal
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.data.map((client) => (
                                <tr
                                    key={client.id}
                                    className="border-b last:border-0 hover:bg-muted/30"
                                >
                                    <td className="px-4 py-2">
                                        <Link
                                            href={show(client.id)}
                                            className="font-medium underline-offset-4 hover:underline"
                                        >
                                            {client.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                        {client.company ?? '—'}
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                        {client.email ?? '—'}
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                        {client.has_portal_access
                                            ? 'Enabled'
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                            {clients.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No clients yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <PaginationLinks meta={clients} />
            </div>
        </>
    );
}

ClientsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Clients', href: index() },
    ],
};
