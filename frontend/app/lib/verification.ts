// lib/verification.ts
//
// Volunteer identity verification store (email + phone OTP), backed by
// localStorage to match the rest of this app's persistence pattern.
//
// A volunteer is considered "verified" only once BOTH email_verified and
// phone_verified are true. NGOs should treat unverified applicants as
// untrusted (see ngo/applications page changes).

export interface VerificationRecord {
  volunteer_id: string; // matches your auth user.id, stringified
  email: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
  email_otp?: string;
  email_otp_expires_at?: string;
  phone_otp?: string;
  phone_otp_expires_at?: string;
  updated_at: string;
}

const KEY = "volunteer_verifications";
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function readAll(): VerificationRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(records: VerificationRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
  window.dispatchEvent(new Event("verification:updated"));
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function norm(v?: string | null): string {
  return (v || "").trim().toLowerCase();
}

export function getVerification(volunteerId: string): VerificationRecord | null {
  return readAll().find((r) => r.volunteer_id === volunteerId) || null;
}

/** True only if this volunteer has confirmed BOTH email and phone. */
export function isVolunteerVerified(volunteerId: string | number | undefined | null): boolean {
  if (volunteerId === undefined || volunteerId === null) return false;
  const rec = getVerification(String(volunteerId));
  return !!rec && rec.email_verified && rec.phone_verified;
}

/** Fallback lookup for NGO-side records that only have email/phone, not a user id. */
export function isContactVerified(email?: string | null, phone?: string | null): boolean {
  const all = readAll();
  return all.some((r) => {
    const emailMatches = email ? norm(r.email) === norm(email) : false;
    const phoneMatches = phone ? norm(r.phone) === norm(phone) : false;
    return (emailMatches || phoneMatches) && r.email_verified && r.phone_verified;
  });
}

function upsert(volunteerId: string, patch: Partial<VerificationRecord>): VerificationRecord {
  const all = readAll();
  const idx = all.findIndex((r) => r.volunteer_id === volunteerId);
  const base: VerificationRecord =
    idx !== -1
      ? all[idx]
      : {
          volunteer_id: volunteerId,
          email: "",
          phone: "",
          email_verified: false,
          phone_verified: false,
          updated_at: new Date().toISOString(),
        };
  const updated: VerificationRecord = { ...base, ...patch, updated_at: new Date().toISOString() };
  if (idx !== -1) all[idx] = updated;
  else all.push(updated);
  writeAll(all);
  return updated;
}

/**
 * Sends (simulates) an email OTP. Returns the code so a demo UI can show
 * it directly (swap this out for a real email provider call later — just
 * stop returning the code once you do).
 */
export function sendEmailOtp(volunteerId: string, email: string): string {
  const otp = generateOtp();
  upsert(volunteerId, {
    email,
    email_otp: otp,
    email_otp_expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  });
  return otp;
}

export function sendPhoneOtp(volunteerId: string, phone: string): string {
  const otp = generateOtp();
  upsert(volunteerId, {
    phone,
    phone_otp: otp,
    phone_otp_expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  });
  return otp;
}

export function confirmEmailOtp(
  volunteerId: string,
  code: string
): { success: boolean; error?: string } {
  const rec = getVerification(volunteerId);
  if (!rec || !rec.email_otp || !rec.email_otp_expires_at) {
    return { success: false, error: "No code was sent. Request a new one." };
  }
  if (new Date(rec.email_otp_expires_at).getTime() < Date.now()) {
    return { success: false, error: "Code expired. Request a new one." };
  }
  if (rec.email_otp !== code.trim()) {
    return { success: false, error: "Incorrect code." };
  }
  upsert(volunteerId, { email_verified: true, email_otp: undefined, email_otp_expires_at: undefined });
  return { success: true };
}

export function confirmPhoneOtp(
  volunteerId: string,
  code: string
): { success: boolean; error?: string } {
  const rec = getVerification(volunteerId);
  if (!rec || !rec.phone_otp || !rec.phone_otp_expires_at) {
    return { success: false, error: "No code was sent. Request a new one." };
  }
  if (new Date(rec.phone_otp_expires_at).getTime() < Date.now()) {
    return { success: false, error: "Code expired. Request a new one." };
  }
  if (rec.phone_otp !== code.trim()) {
    return { success: false, error: "Incorrect code." };
  }
  upsert(volunteerId, { phone_verified: true, phone_otp: undefined, phone_otp_expires_at: undefined });
  return { success: true };
}