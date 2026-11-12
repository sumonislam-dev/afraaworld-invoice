import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ChangeEvent, FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { edit, update } from '@/routes/company';
import type { CompanyProfile, PageProps } from '@/types/models';

type Props = PageProps<{
    company: CompanyProfile;
}>;

interface CompanyFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    logo: File | null;
    remove_logo: boolean;
    [key: string]: string | File | boolean | null;
}

export default function SettingsCompany({ company }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        company.logo_url,
    );

    const { data, setData, errors, processing, post } =
        useForm<CompanyFormData>({
            name: company.name ?? '',
            email: company.email ?? '',
            phone: company.phone ?? '',
            address: company.address ?? '',
            website: company.website ?? '',
            logo: null,
            remove_logo: false,
        });

    const onLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData((current) => ({ ...current, logo: file, remove_logo: false }));
        setLogoPreview(file ? URL.createObjectURL(file) : company.logo_url);
    };

    const removeLogo = () => {
        setData((current) => ({ ...current, logo: null, remove_logo: true }));
        setLogoPreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(update().url, { forceFormData: true });
    };

    return (
        <>
            <Head title="Company settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Company"
                    description="Shown on every invoice PDF — your business's name, contact details, and logo."
                />

                <form onSubmit={submit} className="max-w-xl space-y-6">
                    <div className="grid gap-2">
                        <Label>Logo</Label>
                        <div className="flex items-center gap-4">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Company logo"
                                    className="h-16 max-w-40 rounded border object-contain p-1"
                                />
                            ) : (
                                <div className="flex h-16 w-40 items-center justify-center rounded border text-xs text-muted-foreground">
                                    No logo
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    Upload logo
                                </Button>
                                {logoPreview && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeLogo}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml"
                                className="hidden"
                                onChange={onLogoChange}
                            />
                        </div>
                        <InputError message={errors.logo} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Business name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                        />
                        <InputError message={errors.website} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        Save
                    </Button>
                </form>
            </div>
        </>
    );
}

SettingsCompany.layout = {
    breadcrumbs: [{ title: 'Company settings', href: edit() }],
};
