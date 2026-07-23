import { apiGet, apiPost, apiDelete } from '@/app/lib/api';

export async function validateQr(token: string) {
  return apiPost<{
    valid: boolean;
    message: string;
    data?: {
      task: {
        id: number;
        title: string;
        description: string;
        location: string | null;
        city: string | null;
        latitude: string | null;
        longitude: string | null;
        start_date: string | null;
        end_date: string | null;
        ngo: string | null;
      };
    };
  }>('/volunteer/attendance/validate-qr', { token });
}

export async function secureCheckIn(
  qrToken: string,
  latitude: number,
  longitude: number,
  gpsAccuracy: number,
  deviceInfo?: Record<string, string>
) {
  return apiPost<{
    message: string;
    data: AttendanceLog;
  }>('/volunteer/attendance/secure-check-in', {
    qr_token: qrToken,
    latitude,
    longitude,
    gps_accuracy: gpsAccuracy,
    device_info: deviceInfo,
  });
}

export async function secureCheckOut(
  qrToken: string,
  latitude: number,
  longitude: number,
  gpsAccuracy: number,
  deviceInfo?: Record<string, string>
) {
  return apiPost<{
    message: string;
    data: AttendanceLog;
  }>('/volunteer/attendance/secure-check-out', {
    qr_token: qrToken,
    latitude,
    longitude,
    gps_accuracy: gpsAccuracy,
    device_info: deviceInfo,
  });
}

export async function getAttendanceStatus() {
  return apiGet<{
    checked_in: boolean;
    message: string;
    data?: {
      id: number;
      task_id: number;
      task_title: string;
      task_ngo: string;
      check_in_time: string;
      elapsed_minutes: number;
      confidence_score: number | null;
      confidence_level: string | null;
    };
  }>('/volunteer/attendance/status');
}

export async function getSecureHistory() {
  return apiGet<{
    data: AttendanceLog[];
  }>('/volunteer/attendance/secure-history');
}

export async function getAttendanceAnalytics() {
  return apiGet<{
    data: {
      total_sessions: number;
      total_hours: number;
      completed_sessions: number;
      active_sessions: number;
      absent_sessions: number;
      average_confidence: number | null;
      high_confidence_sessions: number;
    };
  }>('/volunteer/attendance/analytics');
}

export async function generateTaskQr(taskId: number) {
  return apiPost<{
    message: string;
    data: {
      token: string;
      task_id: number;
      task_title: string;
      expires_at: string;
    };
  }>('/ngo/attendance/generate-qr', { task_id: taskId });
}

export async function listQrCodes() {
  return apiGet<{
    data: {
      id: number;
      task_id: number;
      task_title: string;
      expires_at: string;
      is_active: boolean;
      is_expired: boolean;
      created_at: string;
    }[];
  }>('/ngo/attendance/qr-codes');
}

export async function revokeQrCode(id: number) {
  return apiDelete<{ message: string }>(`/ngo/attendance/qr-codes/${id}`);
}

export async function getNgoAttendanceAnalytics() {
  return apiGet<{
    data: {
      total_sessions: number;
      total_hours: number;
      completed_sessions: number;
      active_sessions: number;
      absent_sessions: number;
      average_confidence: number | null;
      confidence_distribution: {
        high: number;
        medium: number;
        low: number;
        manual_review: number;
      };
    };
  }>('/ngo/attendance/analytics');
}

export interface AttendanceLog {
  id: number;
  task_id: number;
  task_title: string;
  task_ngo: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  hours: number | null;
  verification_method: string | null;
  confidence_score: number | null;
  confidence_level: string | null;
  check_in_distance: number | null;
  check_out_distance: number | null;
  created_at: string;
}

export const CONFIDENCE_LEVEL_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-orange-100 text-orange-700',
  manual_review: 'bg-red-100 text-red-700',
};

export const CONFIDENCE_LEVEL_LABELS: Record<string, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
  manual_review: 'Manual Review',
};

export const STATUS_LABELS: Record<string, string> = {
  assigned: 'Assigned',
  active: 'Active',
  completed: 'Completed',
  absent: 'Absent',
};
