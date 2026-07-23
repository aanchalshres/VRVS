export type TaskStatus = 'pending' | 'active' | 'completed' | 'removed';
export type NGOStatus = 'pending' | 'verified' | 'rejected';

export interface Task {
  id: string;
  title: string;
  ngoId: string;
  ngoName: string;
  category: string;
  district: string;
  description: string;
  quota: number;
  filledQuota: number;
  status: TaskStatus;
  createdAt: string;
  startDate: string;
  endDate: string;
}

export interface NGO {
  id: string;
  organizationName: string;
  registrationNumber: string;
  officeLocation: string;
  status: NGOStatus;
  ownerName: string;
  email: string;
  phone: string;
  createdAt?: string;
  documents?: {
    registrationCertificate: string;
    panCard: string;
    organizationProfile: string;
  };
}

export interface Activity {
  id: string;
  type: 'ngo-approved' | 'ngo-rejected' | 'task-deleted' | 'task-created' | 'ngo-registered' | 'ngo-verified';
  message: string;
  timestamp: string;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  totalUsers: number;
  totalVolunteers: number;
  totalNGOs: number;
  pendingVerifications: number;
  activeTasks: number;
  completedTasks: number;
  flaggedTasks: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}

// ─── Identity Verification Types ───

export type IdentityVerificationStatus = 'pending' | 'processing' | 'pending_review' | 'verified' | 'rejected' | 'failed';
export type IdentityVerificationDecision = 'auto_verified' | 'manual_review' | 'rejected' | 'admin_approved' | 'admin_rejected' | null;
export type DocumentType = 'citizenship' | 'national_id' | 'student_id' | 'volunteer_card' | 'passport';
export type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ValidationStatus = 'pending' | 'passed' | 'failed';
export type LivenessStatus = 'pending' | 'passed' | 'uncertain' | 'failed';
export type FaceDetectionStatus = 'no_face' | 'single_face' | 'multiple_faces' | 'blurry';

export interface IdentityDocument {
  id: number;
  document_type: DocumentType;
  original_name: string;
  mime_type: string;
  file_url: string | null;
  ocr_status: OcrStatus;
  ocr_confidence: number | null;
  ocr_extracted_data: Record<string, any> | null;
  validation_status: ValidationStatus;
}

export interface IdentitySelfie {
  id: number;
  file_url: string | null;
  face_detection_status: FaceDetectionStatus | null;
  liveness_status: LivenessStatus | null;
  image_quality_score: number | null;
}

export interface IdentityVerification {
  id: number;
  status: IdentityVerificationStatus;
  confidence_score: number | null;
  ocr_score: number | null;
  face_match_score: number | null;
  liveness_score: number | null;
  document_quality_score: number | null;
  data_consistency_score: number | null;
  decision: IdentityVerificationDecision;
  decision_reason: string | null;
  started_at: string | null;
  completed_at: string | null;
  documents: IdentityDocument[];
  selfie: IdentitySelfie | null;
}

export interface IdentityVerificationStartResponse {
  message: string;
  data: IdentityVerification;
}

export interface IdentityVerificationUploadResponse {
  message: string;
  data: IdentityVerification | any;
}

export interface IdentityVerificationSubmitResponse {
  message: string;
  data: {
    id: number;
    status: 'processing';
  };
}

export interface IdentityVerificationStatusResponse {
  data: IdentityVerification;
}

export interface IdentityVerificationHistoryResponse {
  data: IdentityVerification[];
}
