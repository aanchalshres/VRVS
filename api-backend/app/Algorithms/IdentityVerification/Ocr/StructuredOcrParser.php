<?php

namespace App\Algorithms\IdentityVerification\Ocr;

class StructuredOcrParser
{
    private array $patterns = [
        'citizenship' => [
            'number' => '/\b\d{2}-\d{2}-\d{2}-\d{5}\b/',
            'name' => '/Name\s*:?\s*(.+)/i',
            'dob' => '/\b(\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2})\b/',
            'gender' => '/\b(Male|Female|Other)\b/i',
            'address' => '/Address\s*:?\s*(.+)/i',
            'father_name' => "/Father(?:'s)?\s*Name\s*:?\s*(.+)/i",
            'mother_name' => "/Mother(?:'s)?\s*Name\s*:?\s*(.+)/i",
        ],
        'national_id' => [
            'number' => '/\b\d{4,6}\b/',
            'name' => '/Name\s*:?\s*(.+)/i',
            'dob' => '/\b(\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2})\b/',
            'gender' => '/\b(Male|Female|Other)\b/i',
            'address' => '/Address\s*:?\s*(.+)/i',
        ],
        'student_id' => [
            'number' => '/\b\d{5,10}\b/',
            'name' => '/Name\s*:?\s*(.+)/i',
            'institution' => '/(University|College|School|Institute)\s*:?\s*(.+)/i',
        ],
        'passport' => [
            'number' => '/\b[A-Z]{1,2}\d{6,8}\b/',
            'name' => '/Surname\s*:?\s*(.+)/i',
            'given_name' => '/Given\s*Name(?:s)?\s*:?\s*(.+)/i',
            'dob' => '/\b(\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2})\b/',
            'expiry' => '/\b(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\b/',
        ],
    ];

    public function parse(string $documentType, array $ocrResult): array
    {
        $extracted = [
            'document_type' => $documentType,
            'full_name' => null,
            'document_number' => null,
            'date_of_birth' => null,
            'gender' => null,
            'address' => null,
            'issuing_authority' => null,
            'expiry_date' => null,
            'raw_fields' => [],
        ];

        $rawText = $ocrResult['raw_text'] ?? '';
        $lines = $ocrResult['lines'] ?? [];

        $typePatterns = $this->patterns[$documentType] ?? $this->patterns['citizenship'];

        if (isset($typePatterns['name']) && preg_match($typePatterns['name'], $rawText, $m)) {
            $extracted['full_name'] = trim($m[1]);
        }

        if (isset($typePatterns['number']) && preg_match($typePatterns['number'], $rawText, $m)) {
            $extracted['document_number'] = trim($m[0]);
        }

        if (isset($typePatterns['dob']) && preg_match($typePatterns['dob'], $rawText, $m)) {
            $extracted['date_of_birth'] = trim($m[1]);
        }

        if (isset($typePatterns['gender']) && preg_match($typePatterns['gender'], $rawText, $m)) {
            $extracted['gender'] = trim($m[1]);
        }

        if (isset($typePatterns['address']) && preg_match($typePatterns['address'], $rawText, $m)) {
            $extracted['address'] = trim($m[1]);
        }

        if ($documentType === 'passport' && isset($typePatterns['expiry']) && preg_match($typePatterns['expiry'], $rawText, $m)) {
            $extracted['expiry_date'] = trim($m[1]);
        }

        if ($documentType === 'student_id' && isset($typePatterns['institution']) && preg_match($typePatterns['institution'], $rawText, $m)) {
            $extracted['issuing_authority'] = trim($m[2] ?? $m[1]);
        }

        $extracted['raw_fields'] = $this->extractKeyValuePairs($lines);

        return $extracted;
    }

    private function extractKeyValuePairs(array $lines): array
    {
        $pairs = [];

        foreach ($lines as $line) {
            if (str_contains($line, ':')) {
                $parts = explode(':', $line, 2);
                $key = trim($parts[0]);
                $value = trim($parts[1] ?? '');
                if ($key && $value) {
                    $pairs[$key] = $value;
                }
            }
        }

        return $pairs;
    }
}
