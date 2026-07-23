<?php

namespace App\Algorithms\Contracts;

interface QRCodeInterface
{
    public function generate(string $data, string $path): string;
    public function getDataUri(string $data): string;
}
