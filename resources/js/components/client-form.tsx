import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Client } from '@/types/models';

interface ContactRow {
    id: number | null;
    label: string;
    email: string;
    phone: string;
    is_cc: boolean;
}

interface ClientFormData {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    contacts: ContactRow[];
    [key: string]: string | ContactRow[];
}

interface ClientFormProps {
    client?: Client;
    action: { url: string; method: 'post' | 'put' };
    submitLabel: string;
}

function emptyContact(): ContactRow {
    return { id: null, label: '', email: '', phone: '', is_cc: true };
}

export default function ClientForm({
    client,
    action,
    submitLabel,
}: ClientFormProps) {
    const { data, setData, errors, processing, post, put } =
        useForm<ClientFormData>({
            name: client?.name ?? '',
            company: client?.company ?? '',
            email: client?.email ?? '',
            phone: client?.phone ?? '',
            address: client?.address ?? '',
            notes: client?.notes ?? '',
            contacts:
                client?.contacts?.map((contact) => ({
                    id: contact.id,
                    label: contact.label ?? '',
                    email: contact.email ?? '',
                    phone: contact.phone ?? '',
                    is_cc: contact.is_cc,
                })) ?? [],
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const submitFn = action.method === 'put' ? put : post;
        submitFn(action.url);
    };

    const updateContact = (
        index: number,
        field: keyof ContactRow,
        value: string | boolean,
    ) => {
        setData(
            'contacts',
            data.contacts.map((contact, i) =>
                i === index ? { ...contact, [field]: value } : contact,
            ),
        );
    };

    const removeContact = (index: number) => {
        setData(
            'contacts',
            data.contacts.filter((_, i) => i !== index),
        );
    };

    return (
        <form onSubmit={submit} className="max-w-xl space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                    id="company"
                    value={data.company}
                    onChange={(e) => setData('company', e.target.value)}
                />
                <InputError message={errors.company} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                />
                <InputError message={errors.phone} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                    id="address"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                />
                <InputError message={errors.address} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                />
                <InputError message={errors.notes} />
            </div>

            <div className="grid gap-3">
                <div className="flex items-center justify-between">
                    <Label>Additional contacts</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setData('contacts', [
                                ...data.contacts,
                                emptyContact(),
                            ])
                        }
                    >
                        <Plus className="size-4" />
                        Add contact
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Extra people to loop in, e.g. a CC email for invoices or a
                    second phone number.
                </p>

                {data.contacts.map((contact, index) => (
                    <div
                        key={index}
                        className="grid gap-3 rounded-lg border p-3"
                    >
                        <div className="flex items-start gap-2">
                            <div className="grid flex-1 gap-2">
                                <Input
                                    placeholder="Label (e.g. Billing, CC)"
                                    value={contact.label}
                                    onChange={(e) =>
                                        updateContact(
                                            index,
                                            'label',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={errors[`contacts.${index}.label`]}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeContact(index)}
                                aria-label="Remove contact"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={contact.email}
                                    onChange={(e) =>
                                        updateContact(
                                            index,
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={errors[`contacts.${index}.email`]}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Input
                                    placeholder="Phone"
                                    value={contact.phone}
                                    onChange={(e) =>
                                        updateContact(
                                            index,
                                            'phone',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={errors[`contacts.${index}.phone`]}
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Checkbox
                                checked={contact.is_cc}
                                onCheckedChange={(checked) =>
                                    updateContact(
                                        index,
                                        'is_cc',
                                        checked === true,
                                    )
                                }
                            />
                            CC this contact on invoice emails
                        </label>
                    </div>
                ))}
            </div>

            <Button type="submit" disabled={processing}>
                {submitLabel}
            </Button>
        </form>
    );
}
