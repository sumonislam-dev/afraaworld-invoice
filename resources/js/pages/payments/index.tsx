import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import PaginationLinks from '@/components/pagination-links';
import PaymentsTable from '@/components/payments-table';
import { dashboard } from '@/routes';
import { index } from '@/routes/payments';
import type { Paginated, PageProps, Payment } from '@/types/models';

type Props = PageProps<{
    payments: Paginated<Payment>;
}>;

export default function PaymentsIndex({ payments }: Props) {
    return (
        <>
            <Head title="Payments" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Payments"
                    description="Every payment recorded across all invoices."
                />

                <PaymentsTable payments={payments.data} showClientColumn />

                <PaginationLinks meta={payments} />
            </div>
        </>
    );
}

PaymentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Payments', href: index() },
    ],
};
