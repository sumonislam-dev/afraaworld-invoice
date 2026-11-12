import { Head } from '@inertiajs/react';
import ClientForm from '@/components/client-form';
import Heading from '@/components/heading';
import { dashboard } from '@/routes';
import { edit, index, show, update } from '@/routes/clients';
import type { Client, PageProps } from '@/types/models';

type Props = PageProps<{
    client: Client;
}>;

export default function ClientsEdit({ client }: Props) {
    return (
        <>
            <Head title={`Edit ${client.name}`} />

            <div className="space-y-6 p-4">
                <Heading title={`Edit ${client.name}`} />
                <ClientForm
                    client={client}
                    action={{ url: update(client.id).url, method: 'put' }}
                    submitLabel="Save changes"
                />
            </div>
        </>
    );
}

ClientsEdit.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Clients', href: index() },
        { title: props.client.name, href: show(props.client.id) },
        { title: 'Edit', href: edit(props.client.id) },
    ],
});
