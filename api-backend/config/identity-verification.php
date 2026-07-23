<?php

return [

    'auto_verify_threshold' => (float) env('IDV_AUTO_VERIFY_THRESHOLD', 95),

    'manual_review_threshold' => (float) env('IDV_MANUAL_REVIEW_THRESHOLD', 80),

    'reject_threshold' => (float) env('IDV_REJECT_THRESHOLD', 0),

    'weights' => [
        'ocr_accuracy' => 0.30,
        'face_match' => 0.30,
        'liveness' => 0.20,
        'document_quality' => 0.10,
        'data_consistency' => 0.10,
    ],

    'ocr' => [
        'provider' => env('IDV_OCR_PROVIDER', 'tesseract'),
    ],

    'face_matching' => [
        'provider' => env('IDV_FACE_MATCHING_PROVIDER', 'dummy'),
        'min_similarity' => (float) env('IDV_FACE_MIN_SIMILARITY', 70),
    ],

    'liveness' => [
        'provider' => env('IDV_LIVENESS_PROVIDER', 'dummy'),
    ],

    'document_validation' => [
        'max_file_size' => 10 * 1024 * 1024,
        'allowed_mime_types' => [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
        ],
        'min_image_width' => 600,
        'min_image_height' => 400,
    ],

    'storage' => [
        'documents_disk' => env('IDV_STORAGE_DISK', 'public'),
        'documents_path' => 'identity-verification/documents',
        'selfies_path' => 'identity-verification/selfies',
    ],
];
