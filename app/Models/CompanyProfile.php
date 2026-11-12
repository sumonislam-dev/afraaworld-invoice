<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CompanyProfile extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'website',
        'logo_path',
    ];

    /**
     * The single row holding the sending business's details shown on
     * invoices. Created on first access rather than seeded, since there's
     * nothing meaningful to default it to.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([]);
    }

    public function logoUrl(): ?string
    {
        return $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null;
    }
}
