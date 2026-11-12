import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types/models';

type PaginationMeta = Pick<
    Paginated<unknown>,
    'current_page' | 'last_page' | 'total' | 'prev_page_url' | 'next_page_url'
>;

export default function PaginationLinks({ meta }: { meta: PaginationMeta }) {
    if (!meta.prev_page_url && !meta.next_page_url) {
        return null;
    }

    return (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
                Page {meta.current_page} of {meta.last_page} ({meta.total}{' '}
                total)
            </span>
            <div className="flex gap-2">
                {meta.prev_page_url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={meta.prev_page_url}>Previous</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Previous
                    </Button>
                )}
                {meta.next_page_url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={meta.next_page_url}>Next</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Next
                    </Button>
                )}
            </div>
        </div>
    );
}
