/**
 * Shared domain types for the invoicing app. Pages should type their props
 * against these interfaces rather than redefining ad-hoc shapes per page.
 *
 * These mirror what the backend actually sends: computed fields (subtotal,
 * tax_amount, total, amount_paid, balance, computed_status) are never stored
 * columns — they're calculated server-side (see App\Services\InvoiceCalculator)
 * and sent down as part of the Invoice resource. Never recompute the
 * authoritative totals on the frontend; the live "create invoice" preview is
 * the one intentional exception, and it's called out where it happens.
 */

import type { User } from './auth';

export interface CompanyProfile {
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    website: string | null;
    logo_url: string | null;
}

export interface ClientContact {
    id: number;
    label: string | null;
    email: string | null;
    phone: string | null;
    is_cc: boolean;
}

export interface Client {
    id: number;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    contacts?: ClientContact[];
    has_portal_access?: boolean;
    created_at: string;
    updated_at: string;
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    sort_order: number;
}

export type PaymentType = 'advance' | 'partial' | 'final' | 'full';

export interface Payment {
    id: number;
    invoice_id: number;
    amount: number;
    payment_date: string;
    method: string | null;
    note: string | null;
    payment_type: PaymentType | null;
    invoice?: {
        id: number;
        invoice_number: string;
        currency: string;
        client: { id: number; name: string } | null;
    };
    created_at: string;
}

/** Stored status — the only values ever written to invoices.status. */
export type StoredInvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

/** Derived display status — computed server-side, never stored. */
export type InvoiceStatus =
    'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export type DiscountType = 'percent' | 'fixed';

export interface Invoice {
    id: number;
    invoice_number: string;
    client_id: number;
    client?: Client;
    issue_date: string;
    due_date: string;
    /** Raw stored status — drives edit/send/cancel/delete availability. */
    status: StoredInvoiceStatus;
    /** Derived display status (draft/cancelled pass through, else paid/partial/overdue/sent). */
    computed_status: InvoiceStatus;
    currency: string;
    tax_rate: number;
    discount_type: DiscountType;
    discount_value: number;
    notes: string | null;
    items: InvoiceItem[];
    payments: Payment[];
    // Computed by the backend from items + payments — see file header.
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    amount_paid: number;
    balance: number;
    created_at: string;
    updated_at: string;
}

/**
 * Typed wrapper for Inertia page props. Every page's props extend this to
 * get access to shared data (auth user, flash/toast) alongside page-specific
 * fields, e.g.:
 *
 *   type Props = PageProps<{ invoices: Invoice[] }>;
 *   export default function Index({ invoices, auth }: Props) { ... }
 */
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export type PageProps<T = Record<string, unknown>> = T & {
    name: string;
    auth: {
        user: User;
    };
    sidebarOpen: boolean;
};
