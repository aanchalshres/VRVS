// app/components/ParticipationCard.tsx
'use client'

import { Button } from '@/app/components/ui/button'
import { Award } from 'lucide-react'

interface Certificate {
  id: number
  certificate_number: string
}

interface Opportunity {
  title: string
}

interface Participation {
  id: number
  opportunity?: Opportunity | null
  participation_status: 'assigned' | 'active' | 'completed' | 'absent'
  hours_contributed: number | null
  certificate?: Certificate | null
}

export default function ParticipationCard({ participation }: { participation: Participation }) {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api$/, '')

  const handleDownload = async () => {
    if (!participation.certificate) return
    const token = localStorage.getItem('authToken')
    const res = await fetch(
      `${apiUrl}/api/certificates/${participation.certificate.id}/download`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `certificate-${participation.certificate.certificate_number}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-xl border border-[#CACDD3] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#111827]">
            {participation.opportunity?.title ?? 'Untitled opportunity'}
          </h3>
          <p className="text-sm text-gray-500 capitalize">
            Status: {participation.participation_status}
          </p>
          {participation.hours_contributed && (
            <p className="text-sm text-gray-500">
              Hours contributed: {participation.hours_contributed}
            </p>
          )}
        </div>

        {participation.participation_status === 'completed' && participation.certificate && (
          <Button
            onClick={handleDownload}
            className="bg-[#4F46C8] text-white flex items-center gap-2"
          >
            <Award size={16} />
            Download Certificate
          </Button>
        )}
      </div>
    </div>
  )
}