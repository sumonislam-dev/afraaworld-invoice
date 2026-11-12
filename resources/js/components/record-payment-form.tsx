import { useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
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
import type { PaymentType } from '@/types/models';

interface RecordPaymentFormData {
    amount: string;
    payment_date: string;
    method: string;
    note: string;
    payment_type: PaymentType;
}

interface RecordPaymentFormProps {
    action: string;
    balance: number;
    currency: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function RecordPaymentForm({
    action,
    balance,
    currency,
}: RecordPaymentFormProps) {
    const { data, setData, errors, processing, post, reset } =
        useForm<RecordPaymentFormData>({
            amount: balance.toFixed(2),
            payment_date: today(),
            method: '',
            note: '',
            payment_type: 'final',
        });

    // Track whether the admin has manually picked a payment_type; once they
    // have, stop overriding their choice as the amount changes.
    const userPickedType = useRef(false);

    useEffect(() => {
        if (userPickedType.current) {
            return;
        }

        const amount = Number(data.amount);
        setData('payment_type', amount === balance ? 'final' : 'partial');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.amount, balance]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(action, {
            onSuccess: () => {
                reset();
                userPickedType.current = false;
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                    />
                    <InputError message={errors.amount} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="payment_date">Date</Label>
                    <Input
                        id="payment_date"
                        type="date"
                        value={data.payment_date}
                        onChange={(e) =>
                            setData('payment_date', e.target.value)
                        }
                    />
                    <InputError message={errors.payment_date} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="method">Method</Label>
                    <Input
                        id="method"
                        value={data.method}
                        placeholder="Bank transfer, card, cash…"
                        onChange={(e) => setData('method', e.target.value)}
                    />
                    <InputError message={errors.method} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="payment_type">Payment type</Label>
                    <Select
                        value={data.payment_type}
                        onValueChange={(value) => {
                            userPickedType.current = true;
                            setData('payment_type', value as PaymentType);
                        }}
                    >
                        <SelectTrigger id="payment_type" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="advance">Advance</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="final">Final</SelectItem>
                            <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.payment_type} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                    id="note"
                    value={data.note}
                    onChange={(e) => setData('note', e.target.value)}
                />
                <InputError message={errors.note} />
            </div>

            <Button type="submit" disabled={processing}>
                Record payment ({currency} {Number(data.amount || 0).toFixed(2)}
                )
            </Button>
        </form>
    );
}
