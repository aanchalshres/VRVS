<?php

namespace App\Algorithms\IdentityVerification\Contracts;

use Illuminate\Http\UploadedFile;

interface DocumentValidatorInterface
{
    public function validate(UploadedFile $file): array;

    public function validateImageQuality(string $imagePath): array;
}
