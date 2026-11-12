# AfraaWorld Invoice App

A small invoicing app for a freelancer or small business: bill clients, record payments, and give
each client a read-only portal to see only their own invoices.

## Features

- **Clients**: create clients and give each one a portal login.
- **Invoices**: line items, percentage or fixed discounts, tax, issue and due dates, and notes.
  Invoices start as drafts and are marked sent when you send them.
- **Payments**: record payments against an invoice. Totals, balance and status update
  automatically.
- **PDF invoices**: download a PDF with or without the payment history. A green **PAID** stamp
  appears on fully paid invoices.
- **Client portal**: clients see only their own non-draft invoices.
- **Branding**: company name, address and logo under Settings → Company, which appear on invoices.

## Stack

- Laravel 13, Inertia + React (TypeScript), Tailwind, via the official Laravel React starter kit
  (Fortify for auth, Wayfinder for typed routes and actions)
- SQLite by default (`.env.example`). MySQL works too: set `DB_CONNECTION=mysql` and the
  `DB_*` values in `.env`.
- barryvdh/laravel-dompdf for invoice PDFs

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env`: set `APP_NAME`, the admin credentials that will be seeded (see below), and your
database settings. For SQLite, create the database file first:

```bash
touch database/database.sqlite   # SQLite only, if it doesn't already exist
php artisan migrate --seed
npm install
npm run dev      # or: npm run build
php artisan serve
```

Open `http://localhost:8000`. The home page is the login form.

## Admin login

The one admin account is created by `AdminUserSeeder` from environment variables. Nothing is
hardcoded:

```
ADMIN_NAME="Admin"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password
```

Set these in `.env` **before** running `php artisan migrate --seed`. To change them later, re-run
`php artisan db:seed --class=AdminUserSeeder`. It is safe to re-run: it updates the existing admin
record by email.

Log in at `/` (or `/login`) with those credentials. Signed-in users who open `/` go to the
dashboard.

## Branding

- **App name**: `APP_NAME` in `.env`. It appears in the sidebar and page titles. Run
  `php artisan config:clear` after changing it.
- **Logo in the app**: `public/assets/logo-mark.png` (sidebar, header and login pages).
  `public/assets/logo-wordmark.png` is the full logo.
- **Browser icons**: `public/favicon.png` and `public/apple-touch-icon.png`.
- **Invoice logo and company details**: upload under **Settings → Company**. These are stored in
  `storage/app/public/logos/`.

After changing frontend files, run `npm run build` (or keep `npm run dev` running).

## Creating a client portal login

Clients never self-register. As the admin:

1. Go to **Clients** and create the client (they need an email address).
2. Open the client's page and click **Give portal access**.
3. A temporary password is generated and shown once on that page. Copy it and send it to the
   client. It will not be shown again.
4. The client logs in at `/` with their email and the temporary password. They must set a new
   password on their first login before they can see anything else.
5. Clicking **Give portal access** again (now labeled **Reset portal password**) issues a new
   temporary password and forces another password change.

Clients only ever see their own invoices, and never see invoices still in `draft`. This is
enforced server-side by `InvoicePolicy`, not just hidden in the UI. See
`tests/Feature/InvoiceAccessControlTest.php`.

## Invoice PDFs

On an invoice page, the **PDF** menu has two options:

- **With payment history**: the PDF includes the payment history table.
- **Without payment history**: the PDF shows the totals and balance only.

The file is named after the invoice number, for example `INV-2026-0001.pdf`. The PDF is generated
from the current data each time. It is not stored, so save a copy after the final payment if you
need a record.

The **PAID** stamp appears when the invoice balance is zero. The PDF has the same layout for
admins and clients.

## How totals are calculated

Nothing money-related is stored as a column (no `subtotal`, `total`, `amount_paid`, `balance`,
etc.). Everything is computed on the fly from `invoice_items` and `payments` by
`App\Services\InvoiceCalculator`, so it can never drift out of sync:

- `subtotal` = sum of `quantity * unit_price` across items
- `discount_amount` = percent of subtotal, or a fixed amount
- `tax_amount` = tax rate applied after the discount
- `total` = subtotal − discount + tax
- `amount_paid` = sum of all payments, regardless of their `payment_type`
- `balance` = total − amount_paid

The displayed status (`draft` / `sent` / `partial` / `paid` / `overdue` / `cancelled`) is also
derived, not stored. See `InvoiceCalculator::computedStatus()`.

`payment_type` (`advance` / `partial` / `final` / `full`) is a display-only badge the admin picks
when recording a payment. It never affects the balance math above.

## Deployment

Before putting the app on a live server:

1. Set `APP_ENV=production` and `APP_DEBUG=false` in the server's `.env`. Debug mode shows
   stack traces and secrets to visitors.
2. Set `APP_URL` to the real address, and generate `APP_KEY` on the server with
   `php artisan key:generate` if it isn't set.
3. Use a real database (MySQL is the tested option). Run `php artisan migrate --force`.
4. Set `MAIL_MAILER` to a real mail service. `log` only writes emails to a file.
5. Run `npm ci && npm run build`. The `public/build` folder is not in git, so the server has to
   build it.
6. Run `php artisan config:cache` and `php artisan route:cache` after the `.env` is final.
7. Point the web server at the `public/` folder and make `storage/` and `bootstrap/cache/`
   writable by the web server.
8. Set up scheduled database backups. Client and invoice data lives only in the database and
   `storage/app/public/` (company logo).
9. Use a strong admin password, and turn on two-factor login for the admin account if you can.

## Tests

```bash
php artisan test
npm run types:check   # tsc --noEmit
```

Feature tests cover:

- invoice total calculation (discount and tax)
- status transitions (partial payment, paid, overdue, cancelled)
- `payment_type` never affecting the balance
- a client not being able to view another client's invoice by guessing its URL
- the PDF PAID stamp and payment history option, and the download option
- the home page showing the login form to guests and redirecting signed-in users to the dashboard
