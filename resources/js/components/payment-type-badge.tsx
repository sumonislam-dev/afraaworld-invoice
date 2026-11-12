import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PaymentType } from '@/types/models';

const STYLES: Record<PaymentType, string> = {
    advance:
        'bg-violet-100 text-violet-700 border-transparent dark:bg-violet-950 dark:text-violet-300',
    partial:
        'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-300',
    final: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-950 dark:text-blue-300',
    full: 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-300',
};

const LABELS: Record<PaymentType, string> = {
    advance: 'Advance',
    partial: 'Partial',
    final: 'Final',
    full: 'Full',
};

/** Display-only tag chosen by the admin when recording a payment — never affects balance math. */
export default function PaymentTypeBadge({
    type,
}: {
    type: PaymentType | null;
}) {
    if (!type) {
        return <span className="text-sm text-muted-foreground">—</span>;
    }

    return <Badge className={cn(STYLES[type])}>{LABELS[type]}</Badge>;
}
