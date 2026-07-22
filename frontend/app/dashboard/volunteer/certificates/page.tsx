'use client'

import { useEffect, useState } from 'react'
import { apiGet } from "@/app/lib/api"
import {
  Award, Download, Eye, X,
  CheckCircle, AlertCircle,
} from 'lucide-react'

interface Certificate {
  id: number
  certificate_number: string
  issued_at: string
  created_at: string
  content: {
    volunteer_name?: string
    organization_name?: string
    task_title?: string
    hours_contributed?: number
    issued_date?: string
  }
  ngo?: { organization_name?: string; user?: { name: string } }
  task?: { title: string }
}

export default function VolunteerCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [preview, setPreview] = useState<{ html: string; number: string } | null>(null)
  const [downloading, setDownloading] = useState<number | null>(null)

  const loadCerts = async () => {
    setLoading(true)
    try {
      const res = await apiGet<{ data: Certificate[] }>('/volunteer/certificates')
      setCertificates(res.data ?? [])
    } catch {
      setToast({ message: 'Failed to load certificates.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCerts() }, [])

  const handlePreview = async (id: number) => {
    try {
      const res = await apiGet<{ data: { html: string; certificate_number: string } }>(
        `/volunteer/certificates/${id}/download`
      )
      setPreview({ html: res.data.html, number: res.data.certificate_number })
    } catch {
      setToast({ message: 'Failed to load certificate.', type: 'error' })
    }
  }

  const handleDownload = async (id: number) => {
    setDownloading(id)
    try {
      const res = await apiGet<{ data: { html: string; certificate_number: string; volunteer_name: string } }>(
        `/volunteer/certificates/${id}/download`
      )
      const blob = new Blob([res.data.html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${res.data.certificate_number}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setToast({ message: 'Certificate downloaded!', type: 'success' })
    } catch {
      setToast({ message: 'Failed to download certificate.', type: 'error' })
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">My Certificates</h1>
          <p className="text-sm text-[#6B7280] mt-1">View and download your earned certificates.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-white border border-dashed border-[#CACDD3] rounded-2xl p-12 text-center shadow-sm">
            <Award className="mx-auto h-12 w-12 text-[#6B7280]" />
            <p className="text-[#111827] font-semibold mt-3">No certificates yet</p>
            <p className="text-[#6B7280] text-sm mt-1">
              Complete tasks to earn certificates from NGOs.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.map((cert) => {
              const content = cert.content || {}
              return (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-[#CACDD3] p-5 shadow-sm hover:border-[#4F46C8]/40 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 text-[#4F46C8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#111827] truncate">
                        {content.task_title || cert.task?.title || 'Certificate'}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {content.organization_name || cert.ngo?.organization_name || 'NGO'}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {content.hours_contributed > 0 && `${content.hours_contributed} hrs contributed`}
                        {content.hours_contributed > 0 && ' \u00b7 '}
                        Issued: {new Date(cert.issued_at || cert.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-[#4F46C8] mt-1 font-mono">
                        {cert.certificate_number}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handlePreview(cert.id)}
                      className="flex-1 flex items-center justify-center gap-2 border border-[#CACDD3] hover:bg-gray-50 text-[#111827] py-2 rounded-lg text-sm font-medium transition"
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(cert.id)}
                      disabled={downloading === cert.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#4F46C8] hover:bg-[#4F46C8]/90 disabled:bg-[#4F46C8]/50 text-white py-2 rounded-lg text-sm font-medium transition"
                    >
                      {downloading === cert.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      {downloading === cert.id ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#CACDD3]">
              <p className="font-semibold text-[#111827]">Certificate {preview.number}</p>
              <button
                onClick={() => setPreview(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: preview.html }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
