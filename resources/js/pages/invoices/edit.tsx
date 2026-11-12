import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import InvoiceItemsEditor from '@/components/invoice-items-editor';
import type { DraftInvoiceItem } from '@/components/invoice-items-editor';
import InvoiceTotalsPreview from '@/components/invoice-totals-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import { edit, index, show, update } from '@/routes/invoices';
import type { Client, DiscountType, Invoice, PageProps } from '@/types/models';

type Props = PageProps<{
    invoice: Invoice;
    clients: Client[];
}>;

interface InvoiceEditFormData {
    client_id: string;
    issue_date: string;
    due_date: string;
    currency: string;
    tax_rate: number;
    discount_type: DiscountType;
    discount_value: number;
    notes: string;
    items: DraftInvoiceItem[];
}

export default function InvoicesEdit({ invoice, clients }: Props) {
    const { data, setData, errors, processing, put } =
        useForm<InvoiceEditFormData>({
            client_id: String(invoice.client_id),
            issue_date: invoice.issue_date,
            due_date: invoice.due_date,
            currency: invoice.currency,
            tax_rate: invoice.tax_rate,
            discount_type: invoice.discount_type,
            discount_value: invoice.discount_value,
            notes: invoice.notes ?? '',
            items: invoice.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
            })),
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(update(invoice.id).url);
    };

    return (
        <>
            <Head title={`Edit ${invoice.invoice_number}`} />

            <div className="max-w-3xl space-y-6 p-4">
                <Heading title={`Edit ${invoice.invoice_number}`} />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid min-w-0 gap-2">
                            <Label htmlFor="client_id">Client</Label>
                            <Select
                                value={data.client_id}
                                onValueChange={(value) =>
                                    setData('client_id', value)
                                }
                            >
                                <SelectTrigger
                                    id="client_id"
                                    className="w-full min-w-0"
                                >
                                    <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem
                                            key={client.id}
                                            value={String(client.id)}
                                        >
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.client_id} />
                        </div>

                        <div className="grid min-w-0 gap-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Input
                                id="currency"
                                value={data.currency}
                                maxLength={3}
                                onChange={(e) =>
                                    setData(
                                        'currency',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                            />
                            <InputError message={errors.currency} />
                        </div>

                        <div className="grid min-w-0 gap-2">
                            <Label htmlFor="issue_date">Issue date</Label>
                            <Input
                                id="issue_date"
                                type="date"
                                value={data.issue_date}
                                onChange={(e) =>
                                    setData('issue_date', e.target.value)
                                }
                            />
                            <InputError message={errors.issue_date} />
                        </div>

                        <div className="grid min-w-0 gap-2">
                            <Label htmlFor="due_date">Due date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={data.due_date}
                                onChange={(e) =>
                                    setData('due_date', e.target.value)
                                }
                            />
                            <InputError message={errors.due_date} />
                        </div>
                    </div>

                    <div className="grid min-w-0 gap-2">
                        <Label>Line items</Label>
                        <InvoiceItemsEditor
                            items={data.items}
                            onChange={(items) => setData('items', items)}
                            errors={errors}
                            currency={data.currency}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid min-w-0 gap-2">
                            <Label htmlFor="tax_rate">Tax rate (%)</Label>
                            <Input
                                id="tax_rate"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={data.tax_rate}
                                onChange={(e) =>
                                    setData('tax_rate', Number(e.target.value))
                                }
                            />
                            <InputError message={errors.tax_rate} />
                        </div>

                        <div className="grid min-w-0 gap-2">
                            <Label htmlFor="discount_type">Discount type</Label>
                            <Select
                                value={data.discount_type}
                                onValueChange={(value) =>
                                    setData(
                                        'discount_type',
                                        value as DiscountType,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="discount_type"
                                    className="w-full min-w-0"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixed">
                                        Fixed amount
                                    </SelectItem>
                                    <SelectItem value="percent">
                                        Percent
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid min-w-0 gap-2">
                            <Label htmlFor="discount_value">
                                Discount value
                                {data.discount_type === 'percent' ? ' (%)' : ''}
                            </Label>
                            <Input
                                id="discount_value"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.discount_value}
                                onChange={(e) =>
                                    setData(
                                        'discount_value',
                                        Number(e.target.value),
                                    )
                                }
                            />
                            <InputError message={errors.discount_value} />
                        </div>
                    </div>

                    <div className="grid min-w-0 gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <InvoiceTotalsPreview
                        items={data.items}
                        taxRate={data.tax_rate}
                        discountType={data.discount_type}
                        discountValue={data.discount_value}
                        currency={data.currency}
                    />

                    <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={processing}
                    >
                        Save changes
                    </Button>
                </form>
            </div>
        </>
    );
}

InvoicesEdit.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Invoices', href: index() },
        { title: props.invoice.invoice_number, href: show(props.invoice.id) },
        { title: 'Edit', href: edit(props.invoice.id) },
    ],
});
