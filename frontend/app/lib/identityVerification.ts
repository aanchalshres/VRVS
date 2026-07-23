import { apiGet, apiPost, apiUpload } from '@/app/lib/api';
import type {
  IdentityVerificationStartResponse,
  IdentityVerificationUploadResponse,
  IdentityVerificationSubmitResponse,
  IdentityVerificationStatusResponse,
  IdentityVerificationHistoryResponse,
  DocumentType,
} from '@/app/types';

export async function startVerification() {
  return apiPost<IdentityVerificationStartResponse>(
    '/volunteer/identity-verification/start',
    {}
  );
}

export async function uploadDocument(
  verificationId: number,
  documentType: DocumentType,
  file: File,
  onProgress?: (pct: number) => void
) {
  const formData = new FormData();
  formData.append('verification_id', String(verificationId));
  formData.append('document_type', documentType);
  formData.append('document', file);

  if (onProgress) onProgress(50);

  const result = await apiUpload<IdentityVerificationUploadResponse>(
    '/volunteer/identity-verification/upload-document',
    formData
  );

  if (onProgress) onProgress(100);
  return result;
}

export async function uploadSelfie(
  verificationId: number,
  file: File,
  onProgress?: (pct: number) => void
) {
  const formData = new FormData();
  formData.append('verification_id', String(verificationId));
  formData.append('selfie', file);

  if (onProgress) onProgress(50);

  const result = await apiUpload<IdentityVerificationUploadResponse>(
    '/volunteer/identity-verification/upload-selfie',
    formData
  );

  if (onProgress) onProgress(100);
  return result;
}

export async function submitVerification(verificationId: number) {
  return apiPost<IdentityVerificationSubmitResponse>(
    '/volunteer/identity-verification/submit',
    { verification_id: verificationId }
  );
}

export async function getVerificationStatus(verificationId: number) {
  return apiGet<IdentityVerificationStatusResponse>(
    `/volunteer/identity-verification/status/${verificationId}`
  );
}

export async function getVerificationHistory() {
  return apiGet<IdentityVerificationHistoryResponse>(
    '/volunteer/identity-verification/history'
  );
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  citizenship: 'Citizenship',
  national_id: 'National ID',
  student_id: 'Student ID',
  volunteer_card: 'Volunteer Card',
  passport: 'Passport',
};

export const DOCUMENT_TYPE_MIME_TYPES: Record<DocumentType, string> = {
  citizenship: 'image/jpeg,image/png,image/webp,application/pdf',
  national_id: 'image/jpeg,image/png,image/webp,application/pdf',
  student_id: 'image/jpeg,image/png,image/webp,application/pdf',
  volunteer_card: 'image/jpeg,image/png,image/webp,application/pdf',
  passport: 'image/jpeg,image/png,image/webp,application/pdf',
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  pending_review: 'Manual Review',
  verified: 'Verified',
  rejected: 'Rejected',
  failed: 'Failed',
};

export const VERIFICATION_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  pending_review: 'bg-orange-100 text-orange-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  failed: 'bg-gray-100 text-gray-600',
};

export const DECISION_LABELS: Record<string, string> = {
  auto_verified: 'Auto-Verified',
  manual_review: 'Manual Review',
  rejected: 'Rejected',
  admin_approved: 'Admin Approved',
  admin_rejected: 'Admin Rejected',
};
