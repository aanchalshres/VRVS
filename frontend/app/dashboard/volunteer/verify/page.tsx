"use client";

// app/volunteer/verify-identity/page.tsx
//
// Volunteer must complete this before they're allowed to apply to any task.
// Identity here is `volunteer_profile_id` from localStorage, matching how
// the Apply page identifies the volunteer (no auth context involved).
//
// Flow: Apply page redirects here with ?next=<apply-page-url> whenever
// isVolunteerVerified(volunteerProfileId) is false. Once both email + phone
// are confirmed, this page auto-redirects back to `next`.

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  getVerification,
  sendEmailOtp,
  sendPhoneOtp,
  confirmEmailOtp,
  confirmPhoneOtp,
} from "app/lib/verification";

export default function VerifyIdentityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard/volunteer/tasks";

  const [volunteerProfileId, setVolunteerProfileId] = useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo-only: surfaces the generated OTP directly in the UI since there's
  // no real email/SMS provider wired up yet. Remove devEmailOtp/devPhoneOtp
  // once your Laravel backend sends real codes.
  const [devEmailOtp, setDevEmailOtp] = useState<string | null>(null);
  const [devPhoneOtp, setDevPhoneOtp] = useState<string | null>(null);

  useEffect(() => {
    const idStr = localStorage.getItem("volunteer_profile_id");
    const id = idStr ? Number(idStr) : null;
    setVolunteerProfileId(id);

    if (id !== null) {
      const rec = getVerification(String(id));
      if (rec) {
        setEmail(rec.email || "");
        setPhone(rec.phone || "");
        setEmailVerified(!!rec.email_verified);
        setPhoneVerified(!!rec.phone_verified);
      }
    }
  }, []);

  useEffect(() => {
    if (emailVerified && phoneVerified) {
      router.push(next);
    }
  }, [emailVerified, phoneVerified, next, router]);

  if (volunteerProfileId === null) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#CACDD3] p-8 text-center max-w-sm">
          <AlertTriangle size={32} className="mx-auto text-[#B91C1C] mb-3" />
          <p className="text-[#111827] font-medium mb-1">No volunteer profile found</p>
          <p className="text-[#6B7280] text-sm">
            Please log in as a volunteer before verifying your identity.
          </p>
        </div>
      </div>
    );
  }

  const idStr = String(volunteerProfileId);

  const handleSendEmail = () => {
    setError(null);
    if (!email.trim()) {
      setError("Enter an email address first.");
      return;
    }
    const otp = sendEmailOtp(idStr, email.trim());
    setDevEmailOtp(otp); // remove in production
    setEmailSent(true);
  };

  const handleSendPhone = () => {
    setError(null);
    if (!phone.trim()) {
      setError("Enter a phone number first.");
      return;
    }
    const otp = sendPhoneOtp(idStr, phone.trim());
    setDevPhoneOtp(otp); // remove in production
    setPhoneSent(true);
  };

  const handleConfirmEmail = () => {
    const res = confirmEmailOtp(idStr, emailCode);
    if (!res.success) {
      setError(res.error || "Could not verify email.");
      return;
    }
    setError(null);
    setEmailVerified(true);
  };

  const handleConfirmPhone = () => {
    const res = confirmPhoneOtp(idStr, phoneCode);
    if (!res.success) {
      setError(res.error || "Could not verify phone.");
      return;
    }
    setError(null);
    setPhoneVerified(true);
  };

  const progress = (emailVerified ? 1 : 0) + (phoneVerified ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#CACDD3] p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F46C8]/10">
            <ShieldCheck className="h-5 w-5 text-[#4F46C8]" />
          </span>
          <h1 className="text-xl font-bold text-[#111827]">Verify your identity</h1>
        </div>
        <p className="text-sm text-[#6B7280] mb-4">
          You need to confirm your email and phone number before you can apply to any task.
        </p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 h-1.5 rounded-full bg-[#B9C0D4]/40 overflow-hidden">
            <div
              className="h-full bg-[#4F46C8] transition-all"
              style={{ width: `${(progress / 2) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-[#6B7280]">{progress}/2</span>
        </div>

        {error && (
          <div className="mb-4 text-sm text-[#B91C1C] bg-[#B91C1C]/5 border border-[#B91C1C]/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm font-medium text-[#111827] mb-2">
            <Mail size={14} className="text-[#4F46C8]" /> Email
            {emailVerified && (
              <span className="ml-auto flex items-center gap-1 text-xs text-[#15803D] font-semibold">
                <CheckCircle2 size={13} /> Verified
              </span>
            )}
          </label>

          {emailVerified ? (
            <div className="bg-[#B9C0D4]/15 rounded-lg px-3 py-2 text-sm text-[#111827]">{email}</div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]/30"
                />
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#4F46C8] hover:bg-[#3f39a8] text-white transition-colors shrink-0"
                >
                  {emailSent ? "Resend" : "Send code"}
                </button>
              </div>

              {emailSent && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="6-digit code"
                    className="flex-1 border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7683D6]/40"
                  />
                  <button
                    onClick={handleConfirmEmail}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#7683D6] hover:bg-[#5f6cc4] text-white transition-colors shrink-0"
                  >
                    Confirm
                  </button>
                </div>
              )}

              {devEmailOtp && (
                <p className="text-xs text-[#6B7280] mt-1.5 bg-[#B9C0D4]/15 rounded-md px-2 py-1 inline-block">
                  Demo mode — your code is <span className="font-mono font-semibold">{devEmailOtp}</span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Phone */}
        <div className="mb-1">
          <label className="flex items-center gap-2 text-sm font-medium text-[#111827] mb-2">
            <Phone size={14} className="text-[#4F46C8]" /> Phone
            {phoneVerified && (
              <span className="ml-auto flex items-center gap-1 text-xs text-[#15803D] font-semibold">
                <CheckCircle2 size={13} /> Verified
              </span>
            )}
          </label>

          {phoneVerified ? (
            <div className="bg-[#B9C0D4]/15 rounded-lg px-3 py-2 text-sm text-[#111827]">{phone}</div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className="flex-1 border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]/30"
                />
                <button
                  onClick={handleSendPhone}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#4F46C8] hover:bg-[#3f39a8] text-white transition-colors shrink-0"
                >
                  {phoneSent ? "Resend" : "Send code"}
                </button>
              </div>

              {phoneSent && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="6-digit code"
                    className="flex-1 border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7683D6]/40"
                  />
                  <button
                    onClick={handleConfirmPhone}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#7683D6] hover:bg-[#5f6cc4] text-white transition-colors shrink-0"
                  >
                    Confirm
                  </button>
                </div>
              )}

              {devPhoneOtp && (
                <p className="text-xs text-[#6B7280] mt-1.5 bg-[#B9C0D4]/15 rounded-md px-2 py-1 inline-block">
                  Demo mode — your code is <span className="font-mono font-semibold">{devPhoneOtp}</span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}