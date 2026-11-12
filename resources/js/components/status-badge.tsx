import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { InvoiceStatus } from '@/types/models';

const STYLES: Record<InvoiceStatus, string> = {
    draft: 'bg-muted text-muted-foreground border-transparent',
    sent: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-300',
    partial:
        'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-300',
    paid: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-300',
    overdue:
        'bg-red-100 text-red-700 border-transparent dark:bg-red-950 dark:text-red-300',
    cancelled: 'bg-muted text-muted-foreground border-transparent line-through',
};

const LABELS: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    partial: 'Partial',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
};

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
    return <Badge className={cn(STYLES[status])}>{LABELS[status]}</Badge>;
}
