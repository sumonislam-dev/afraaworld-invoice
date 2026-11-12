<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class InvoicePdfController extends Controller
{
    /**
     * `?history=0` leaves out the payment history table; anything else keeps it.
     * `?download=1` saves the file instead of showing it in the browser.
     * The PAID stamp appears whenever the invoice is fully settled.
     */
    public function show(Request $request, Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load(['client', 'items', 'payments']);

        $company = CompanyProfile::current();

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => $company,
            // DomPDF renders from the server filesystem, not the browser, so
            // the logo has to go in as a data URI rather than its public URL.
            'companyLogoDataUri' => $this->logoDataUri($company),
            'paymentTermsLabel' => $this->paymentTermsLabel($invoice),
            'showHistory' => $request->boolean('history', true),
            'showPaidStamp' => $invoice->computed_status === 'paid',
        ]);

        $filename = $invoice->invoice_number.'.pdf';

        return $request->boolean('download')
            ? $pdf->download($filename)
            : $pdf->stream($filename);
    }

    private function logoDataUri(CompanyProfile $company): ?string
    {
        if (! $company->logo_path || ! Storage::disk('public')->exists($company->logo_path)) {
            return null;
        }

        $contents = Storage::disk('public')->get($company->logo_path);
        $mimeType = Storage::disk('public')->mimeType($company->logo_path);

        return 'data:'.$mimeType.';base64,'.base64_encode($contents);
    }

    /**
     * The due date is set directly rather than derived from a payment-terms
     * policy, so only label it when the gap happens to match a recognized
     * term (e.g. Net 30) — an arbitrary "Net 17 days" reads as a mistake
     * rather than a deliberate policy.
     */
    private function paymentTermsLabel(Invoice $invoice): ?string
    {
        $days = (int) $invoice->issue_date->diffInDays($invoice->due_date);

        if ($days === 0) {
            return 'Due on receipt';
        }

        return in_array($days, [7, 15, 30, 45, 60], true) ? "Net {$days}" : null;
    }
}
