<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateCompanyProfileRequest;
use App\Http\Resources\CompanyProfileResource;
use App\Models\CompanyProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CompanyProfileController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/company', [
            'company' => $this->resourceData(new CompanyProfileResource(CompanyProfile::current())),
        ]);
    }

    public function update(UpdateCompanyProfileRequest $request): RedirectResponse
    {
        $company = CompanyProfile::current();

        $company->fill($request->safe()->except(['logo', 'remove_logo']));

        if ($request->boolean('remove_logo') && $company->logo_path) {
            Storage::disk('public')->delete($company->logo_path);
            $company->logo_path = null;
        }

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }

            $path = $request->file('logo')->store('logos', 'public');

            throw_if($path === false, new RuntimeException('Failed to store the uploaded logo.'));

            $company->logo_path = $path;
        }

        $company->save();

        $this->flashToast('Company profile updated.');

        return to_route('company.edit');
    }
}
