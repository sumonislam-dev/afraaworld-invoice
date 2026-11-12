import { Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Shape of a line item while it's still being edited, before it has an id/sort_order. */
export interface DraftInvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
}

export const emptyInvoiceItem = (): DraftInvoiceItem => ({
    description: '',
    quantity: 1,
    unit_price: 0,
});

interface InvoiceItemsEditorProps {
    items: DraftInvoiceItem[];
    onChange: (items: DraftInvoiceItem[]) => void;
    errors?: Partial<Record<string, string>>;
    disabled?: boolean;
    currency: string;
}

export default function InvoiceItemsEditor({
    items,
    onChange,
    errors = {},
    disabled = false,
    currency,
}: InvoiceItemsEditorProps) {
    const update = (index: number, patch: Partial<DraftInvoiceItem>) => {
        onChange(
            items.map((item, i) =>
                i === index ? { ...item, ...patch } : item,
            ),
        );
    };

    const remove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const add = () => {
        onChange([...items, emptyInvoiceItem()]);
    };

    return (
        <div className="space-y-3">
            <div className="hidden grid-cols-[minmax(0,1fr)_100px_140px_140px_40px] gap-3 px-1 text-sm font-medium text-muted-foreground sm:grid">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit price</span>
                <span>Line total</span>
                <span />
            </div>

            {items.map((item, index) => (
                <div
                    key={index}
                    className="grid grid-cols-1 items-start gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_100px_140px_140px_40px] sm:rounded-none sm:border-none sm:p-0"
                >
                    <div>
                        <Label className="sm:sr-only">Description</Label>
                        <Input
                            value={item.description}
                            disabled={disabled}
                            onChange={(e) =>
                                update(index, { description: e.target.value })
                            }
                            placeholder="Item description"
                        />
                        <InputError
                            message={errors[`items.${index}.description`]}
                        />
                    </div>

                    <div>
                        <Label className="sm:sr-only">Qty</Label>
                        <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            disabled={disabled}
                            onChange={(e) =>
                                update(index, {
                                    quantity: Number(e.target.value),
                                })
                            }
                        />
                        <InputError
                            message={errors[`items.${index}.quantity`]}
                        />
                    </div>

                    <div>
                        <Label className="sm:sr-only">Unit price</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            disabled={disabled}
                            onChange={(e) =>
                                update(index, {
                                    unit_price: Number(e.target.value),
                                })
                            }
                        />
                        <InputError
                            message={errors[`items.${index}.unit_price`]}
                        />
                    </div>

                    <div className="flex h-9 items-center text-sm">
                        {currency}{' '}
                        {(item.quantity * item.unit_price).toLocaleString(
                            undefined,
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            },
                        )}
                    </div>

                    <div className="flex h-9 items-center">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={disabled || items.length <= 1}
                            onClick={() => remove(index)}
                            aria-label="Remove item"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={add}
            >
                Add item
            </Button>
        </div>
    );
}
