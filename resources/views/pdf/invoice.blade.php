<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $invoice->invoice_number }}</title>
    <style>
        @page { margin-bottom: 70px; }
        body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #1f2937; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .muted { color: #6b7280; }
        .row { display: flex; justify-content: space-between; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
        th { color: #6b7280; font-weight: normal; }
        .totals td { border: none; padding: 2px 8px; }
        .totals .label { color: #6b7280; text-align: right; }
        .totals .value { text-align: right; width: 120px; }
        .totals .total-row td { font-weight: bold; border-top: 1px solid #e5e7eb; padding-top: 6px; }
        .logo { max-width: 180px; max-height: 70px; margin-bottom: 8px; }
        .overdue { color: #b91c1c; font-weight: bold; }
        .page-footer { position: fixed; bottom: -55px; left: 0px; right: 0px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; }
        .page-footer .generated-at { margin-top: 4px; font-size: 10px; }
        .paid-stamp { display: block; width: 170px; margin: 8px 0 16px auto; padding: 6px 0; border: 4px solid #15803d; color: #15803d; font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; transform: rotate(-12deg); }
    </style>
</head>
<body>
    <div class="row">
        <div>
            @if($companyLogoDataUri)
                <img src="{{ $companyLogoDataUri }}" class="logo" alt="{{ $company->name }}">
            @endif
            @if($company->name)
                <div><strong>{{ $company->name }}</strong></div>
            @endif
            @if($company->address)
                <div class="muted">{{ $company->address }}</div>
            @endif
            @if($company->email)
                <div class="muted">{{ $company->email }}</div>
            @endif
            @if($company->phone)
                <div class="muted">{{ $company->phone }}</div>
            @endif
            @if($company->website)
                <div class="muted">{{ $company->website }}</div>
            @endif
        </div>
        <div style="text-align: right">
            <h1>Invoice {{ $invoice->invoice_number }}</h1>
            <div style="margin-top: 16px;"><strong>Bill to</strong></div>
            <div><strong>{{ $invoice->client->name }}</strong></div>
            @if($invoice->client->company && $invoice->client->company !== $invoice->client->name)
                <div>{{ $invoice->client->company }}</div>
            @endif
            @if($invoice->client->address)
                <div style="white-space: pre-line">{{ $invoice->client->address }}</div>
            @endif
            @if($invoice->client->email)
                <div>{{ $invoice->client->email }}</div>
            @endif
            @if($invoice->client->phone)
                <div>{{ $invoice->client->phone }}</div>
            @endif
        </div>
    </div>

    <div class="row">
        <div>
            <div class="muted">Issue date</div>
            <div>{{ $invoice->issue_date->toFormattedDateString() }}</div>
        </div>
        <div>
            <div class="muted">Due date</div>
            <div class="{{ $invoice->computed_status === 'overdue' ? 'overdue' : '' }}">
                {{ $invoice->due_date->toFormattedDateString() }}
                @if($invoice->computed_status === 'overdue')
                    (overdue)
                @endif
            </div>
        </div>
        @if($paymentTermsLabel)
            <div>
                <div class="muted">Payment terms</div>
                <div>{{ $paymentTermsLabel }}</div>
            </div>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Line total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td>{{ rtrim(rtrim(number_format((float) $item->quantity, 2), '0'), '.') }}</td>
                    <td>{{ $invoice->currency }} {{ number_format((float) $item->unit_price, 2) }}</td>
                    <td>{{ $invoice->currency }} {{ number_format((float) $item->quantity * (float) $item->unit_price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="label">Subtotal</td>
            <td class="value">{{ $invoice->currency }} {{ number_format($invoice->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td class="label">Discount</td>
            <td class="value">-{{ $invoice->currency }} {{ number_format($invoice->discount_amount, 2) }}</td>
        </tr>
        <tr>
            <td class="label">Tax</td>
            <td class="value">{{ $invoice->currency }} {{ number_format($invoice->tax_amount, 2) }}</td>
        </tr>
        <tr class="total-row">
            <td class="label">Total</td>
            <td class="value">{{ $invoice->currency }} {{ number_format($invoice->total, 2) }}</td>
        </tr>
        <tr>
            <td class="label">Paid</td>
            <td class="value">{{ $invoice->currency }} {{ number_format($invoice->amount_paid, 2) }}</td>
        </tr>
        <tr class="total-row">
            <td class="label">Balance due</td>
            <td class="value">{{ $invoice->currency }} {{ number_format($invoice->balance, 2) }}</td>
        </tr>
    </table>

    @if($showPaidStamp)
        <div class="paid-stamp">PAID</div>
    @endif

    @if($invoice->notes)
        <h3>Notes</h3>
        <div class="muted">{{ $invoice->notes }}</div>
    @endif

    @if($showHistory && $invoice->payments->isNotEmpty())
        <h3>Payment history</h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->payments as $payment)
                    <tr>
                        <td>{{ $payment->payment_date->toFormattedDateString() }}</td>
                        <td>{{ $invoice->currency }} {{ number_format((float) $payment->amount, 2) }}</td>
                        <td>{{ $payment->method ?? '—' }}</td>
                        <td>{{ $payment->payment_type ? ucfirst($payment->payment_type) : '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="page-footer muted">
        <div>This is a computer-generated invoice and does not require a signature.</div>
        <div class="generated-at">Generated on {{ now()->format('M j, Y g:ia') }}</div>
    </div>
</body>
</html>
