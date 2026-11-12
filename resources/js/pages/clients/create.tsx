import { Head } from '@inertiajs/react';
import ClientForm from '@/components/client-form';
import Heading from '@/components/heading';
import { dashboard } from '@/routes';
import { create, index, store } from '@/routes/clients';

export default function ClientsCreate() {
    return (
        <>
            <Head title="New client" />

            <div className="space-y-6 p-4">
                <Heading
                    title="New client"
                    description="Add someone you'll be billing."
                />
                <ClientForm
                    action={{ url: store().url, method: 'post' }}
                    submitLabel="Create client"
                />
            </div>
        </>
    );
}

ClientsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Clients', href: index() },
        { title: 'New', href: create() },
    ],
};
