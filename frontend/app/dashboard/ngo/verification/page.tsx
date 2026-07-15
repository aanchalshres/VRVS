'use client'

import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'
import { getVerification } from 'app/lib/verification'

export default function VerificationBadge({
  volunteerProfileId,
}: {
  volunteerProfileId: number | null
}) {
  if (volunteerProfileId === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] bg-white border border-[#CACDD3] px-2.5 py-1 rounded-full shadow-sm">
        <ShieldQuestion size={13} strokeWidth={2} />
        Unknown
      </span>
    )
  }

  const rec = getVerification(String(volunteerProfileId))
  const emailVerified = !!rec?.email_verified
  const phoneVerified = !!rec?.phone_verified

  if (emailVerified && phoneVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] bg-[#15803D]/[0.08] border border-[#15803D]/20 px-2.5 py-1 rounded-full shadow-sm">
        <ShieldCheck size={13} strokeWidth={2.5} />
        Verified
      </span>
    )
  }

  if (emailVerified || phoneVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] bg-[#B45309]/[0.08] border border-[#B45309]/20 px-2.5 py-1 rounded-full shadow-sm">
        <ShieldAlert size={13} strokeWidth={2.5} />
        Partially verified
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] bg-[#B91C1C]/[0.08] border border-[#B91C1C]/20 px-2.5 py-1 rounded-full shadow-sm">
      <ShieldAlert size={13} strokeWidth={2.5} />
      Not verified
    </span>
  )
}