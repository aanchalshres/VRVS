<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\VerificationService;

class VerificationController extends Controller
{
    public function __construct(
        private VerificationService $verificationService
    ) {}

    public function getNgoVerification()
    {
        $ngos = $this->verificationService->getPendingNgos();

        return response()->json([
            'data' => $ngos,
            'total' => $ngos->count(),
        ]);
    }

    public function verifyNgo($id)
    {
        $ngo = $this->verificationService->verifyNgoById($id);

        return response()->json([
            'message' => 'NGO verified successfully',
            'data' => $ngo,
        ]);
    }

    public function rejectNgo($id)
    {
        $ngo = $this->verificationService->rejectNgoById($id);

        return response()->json([
            'message' => 'NGO rejected',
            'data' => $ngo,
        ]);
    }

    public function ngos()
    {
        return response()->json(
            $this->verificationService->getAllNgos()
        );
    }

    public function ngoDetails($id)
    {
        return response()->json(
            $this->verificationService->getNgoDetails($id)
        );
    }
}
