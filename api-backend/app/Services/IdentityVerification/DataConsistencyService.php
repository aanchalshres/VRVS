<?php

namespace App\Services\IdentityVerification;

use App\Models\VolunteerProfile;

class DataConsistencyService
{
    public function check(array $ocrData, ?VolunteerProfile $profile): array
    {
        $checks = [];
        $totalWeight = 0;
        $passedWeight = 0;

        $nameConsistency = $this->checkName($ocrData, $profile);
        $checks['name_match'] = $nameConsistency;
        $totalWeight += 0.4;
        if ($nameConsistency['matched']) {
            $passedWeight += 0.4;
        }

        $dobConsistency = $this->checkDateOfBirth($ocrData, $profile);
        $checks['dob_match'] = $dobConsistency;
        $totalWeight += 0.3;
        if ($dobConsistency['matched']) {
            $passedWeight += 0.3;
        }

        $genderConsistency = $this->checkGender($ocrData, $profile);
        $checks['gender_match'] = $genderConsistency;
        $totalWeight += 0.15;
        if ($genderConsistency['matched']) {
            $passedWeight += 0.15;
        }

        $phoneConsistency = $this->checkAddress($ocrData, $profile);
        $checks['address_match'] = $phoneConsistency;
        $totalWeight += 0.15;
        if ($phoneConsistency['matched']) {
            $passedWeight += 0.15;
        }

        $consistencyScore = $totalWeight > 0 ? ($passedWeight / $totalWeight) * 100 : 50;

        return [
            'consistency_score' => round($consistencyScore, 2),
            'checks' => $checks,
        ];
    }

    private function checkName(array $ocrData, ?VolunteerProfile $profile): array
    {
        $ocrName = strtolower(trim($ocrData['full_name'] ?? ''));
        $profileName = $profile && $profile->user ? strtolower(trim($profile->user->name ?? '')) : '';

        $matched = false;
        $similarity = 0;

        if ($ocrName && $profileName) {
            $lev = levenshtein($ocrName, $profileName);
            $maxLen = max(strlen($ocrName), strlen($profileName));
            $similarity = $maxLen > 0 ? round((1 - $lev / $maxLen) * 100, 2) : 0;
            $matched = $similarity > 60;
        }

        return [
            'matched' => $matched,
            'similarity' => $similarity,
            'ocr_value' => $ocrName,
            'profile_value' => $profileName,
        ];
    }

    private function checkDateOfBirth(array $ocrData, ?VolunteerProfile $profile): array
    {
        $ocrDob = $ocrData['date_of_birth'] ?? null;
        $profileDob = $profile ? ($profile->date_of_birth ? $profile->date_of_birth->format('Y-m-d') : null) : null;

        $matched = $ocrDob && $profileDob && str_contains($ocrDob, $profileDob);

        return [
            'matched' => $matched,
            'ocr_value' => $ocrDob,
            'profile_value' => $profileDob,
        ];
    }

    private function checkGender(array $ocrData, ?VolunteerProfile $profile): array
    {
        $ocrGender = $ocrData['gender'] ?? null;
        $profileGender = $profile ? $profile->gender : null;

        $matched = $ocrGender && $profileGender && strtolower($ocrGender) === strtolower($profileGender);

        return [
            'matched' => $matched,
            'ocr_value' => $ocrGender,
            'profile_value' => $profileGender,
        ];
    }

    private function checkAddress(array $ocrData, ?VolunteerProfile $profile): array
    {
        $ocrAddress = strtolower(trim($ocrData['address'] ?? ''));
        $profileAddress = $profile ? strtolower(trim(($profile->city ?? '') . ' ' . ($profile->country ?? ''))) : '';

        $matched = false;
        if ($ocrAddress && $profileAddress) {
            $matched = str_contains($ocrAddress, $profileAddress) || str_contains($profileAddress, $ocrAddress);
        }

        return [
            'matched' => $matched,
            'ocr_value' => $ocrAddress,
            'profile_value' => $profileAddress,
        ];
    }
}
