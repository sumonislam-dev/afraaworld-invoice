<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\ClientPortalAccessController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceActionController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoicePdfController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Portal\InvoiceController as PortalInvoiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;

// The home page is the login form. Signed-in users go straight to the dashboard.
Route::get('/', function (Request $request) {
    if ($request->user()) {
        return redirect()->route('dashboard');
    }

    return app(AuthenticatedSessionController::class)->create($request);
})->name('home');

Route::inertia('/welcome', 'welcome')->name('welcome');

Route::middleware(['auth', 'verified', 'password.change'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'verified', 'role:admin', 'password.change'])->group(function () {
    Route::resource('clients', ClientController::class);
    Route::post('clients/{client}/portal-access', [ClientPortalAccessController::class, 'store'])
        ->name('clients.portal-access');

    Route::resource('invoices', InvoiceController::class)->except(['show']);
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::post('invoices/{invoice}/send', [InvoiceActionController::class, 'send'])->name('invoices.send');
    Route::post('invoices/{invoice}/cancel', [InvoiceActionController::class, 'cancel'])->name('invoices.cancel');
    Route::get('invoices/{invoice}/pdf', [InvoicePdfController::class, 'show'])->name('invoices.pdf');
    Route::post('invoices/{invoice}/payments', [PaymentController::class, 'store'])->name('invoices.payments.store');
    Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
});

Route::middleware(['auth', 'verified', 'role:client', 'password.change'])
    ->prefix('portal')
    ->name('portal.')
    ->group(function () {
        Route::get('invoices/{invoice}', [PortalInvoiceController::class, 'show'])->name('invoices.show');
        Route::get('invoices/{invoice}/pdf', [InvoicePdfController::class, 'show'])->name('invoices.pdf');
    });

require __DIR__.'/settings.php';
