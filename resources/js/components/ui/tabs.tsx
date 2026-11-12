import { createContext, useContext, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
    value: string;
    setValue: (value: string) => void;
    idPrefix: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error(`<${component} /> must be used within <Tabs />`);
    }
    return context;
}

interface TabsProps {
    defaultValue: string;
    className?: string;
    children: ReactNode;
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
    const [value, setValue] = useState(defaultValue);
    const idPrefix = useId();

    return (
        <TabsContext.Provider value={{ value, setValue, idPrefix }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            role="tablist"
            className={cn(
                'inline-flex items-center gap-1 rounded-lg bg-muted p-1',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function TabsTrigger({
    value,
    children,
}: {
    value: string;
    children: ReactNode;
}) {
    const context = useTabsContext('TabsTrigger');
    const active = context.value === value;

    return (
        <button
            type="button"
            role="tab"
            id={`${context.idPrefix}-tab-${value}`}
            aria-selected={active}
            aria-controls={`${context.idPrefix}-panel-${value}`}
            onClick={() => context.setValue(value)}
            className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                active
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
            )}
        >
            {children}
        </button>
    );
}

export function TabsContent({
    value,
    className,
    children,
}: {
    value: string;
    className?: string;
    children: ReactNode;
}) {
    const context = useTabsContext('TabsContent');
    if (context.value !== value) {
        return null;
    }

    return (
        <div
            role="tabpanel"
            id={`${context.idPrefix}-panel-${value}`}
            aria-labelledby={`${context.idPrefix}-tab-${value}`}
            className={className}
        >
            {children}
        </div>
    );
}
