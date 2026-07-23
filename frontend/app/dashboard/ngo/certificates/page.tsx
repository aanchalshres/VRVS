'use client'
import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/app/lib/api'
import { toast } from 'react-hot-toast'
import {
  Award, Download, FileText, Search, Loader2, ShieldCheck, Shield, ExternalLink
} from 'lucide-react'

interface Certificate {
  id: number
  certificate_number: string
  volunteer_name: string
  task_title: string
  hours_contributed: number
  issued_at: string
  created_at: string
}

interface Application {
  id: number
  volunteer_profile_id: number
  volunteer_name: string
  task: { id: number; title: string }
  total_hours: number
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState<number | ''>('')
  const [generating, setGenerating] = useState(false)
  const [authStatuses, setAuthStatuses] = useState<Record<number, boolean>>({})
  const [settingUpAuth, setSettingUpAuth] = useState<number | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const [certRes, appRes] = await Promise.all([
        apiGet<{ data: Certificate[] }>('/api/ngo/certificates'),
        apiGet<{ data: Application[] }>('/api/ngo/certificates/eligible').catch(() => ({ data: [] })),
      ])
      setCertificates(certRes.data)
      setApplications(appRes.data || [])

      const statuses: Record<number, boolean> = {}
      await Promise.all((certRes.data || []).map(async (c: Certificate) => {
        try {
          const res = await apiGet<any>(`/api/ngo/certificates/${c.id}/auth-status`)
          statuses[c.id] = !res.data?.is_revoked && res.data?.status === 'active'
        } catch {
          statuses[c.id] = false
        }
      }))
      setAuthStatuses(statuses)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppId) { toast.error('Select a completed application'); return }
    try {
      setGenerating(true)
      const res = await apiPost<{ data: Certificate }>('/api/ngo/certificates', {
        application_id: Number(selectedAppId),
      })
      toast.success('Certificate issued!')
      setCertificates((prev) => [res.data, ...prev])
      setShowForm(false)
      setSelectedAppId('')

      try {
        const authRes = await apiPost<any>(`/api/ngo/certificates/${res.data.id}/setup-auth`, {})
        if (authRes.message) toast.success('SHA-256 authentication enabled')
        setAuthStatuses((prev) => ({ ...prev, [res.data.id]: true }))
      } catch {
        // auth setup not critical to issuance
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to issue certificate')
    } finally {
      setGenerating(false)
    }
  }

  const handleSetupAuth = async (id: number) => {
    setSettingUpAuth(id)
    try {
      const res = await apiPost<any>(`/api/ngo/certificates/${id}/setup-auth`, {})
      toast.success('SHA-256 authentication enabled')
      setAuthStatuses((prev) => ({ ...prev, [id]: true }))
    } catch (err: any) {
      toast.error(err.message || 'Failed to setup authentication')
    } finally {
      setSettingUpAuth(null)
    }
  }

  const downloadCert = async (id: number) => {
    try {
      const res = await apiGet<{ data: { html: string } }>(`/api/ngo/certificates/${id}/download`)
      const blob = new Blob([res.data.html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${id}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download certificate')
    }
  }

  const filtered = certificates.filter(
    (c) =>
      c.volunteer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.task_title.toLowerCase().includes(search.toLowerCase()) ||
      c.certificate_number.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-sm text-[#6B7280]">Issue and manage certificates for volunteers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4F46C8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors flex items-center gap-2"
        >
          <Award size={16} /> Issue Certificate
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-black/5 rounded-xl p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Issue New Certificate</h2>
          {applications.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No completed opportunities eligible for certificates.</p>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Volunteer & Opportunity</label>
                <select value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Select --</option>
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>{a.volunteer_name} – {a.task?.title} ({a.total_hours}h)</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <ShieldCheck className="w-3.5 h-3.5" /> SHA-256 authentication will be automatically enabled
              </div>
              <button type="submit" disabled={generating}
                className="bg-[#4F46C8] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] disabled:opacity-50 transition-colors flex items-center gap-2">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                {generating ? 'Issuing...' : 'Issue Certificate'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="bg-white border border-black/5 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search certificates..." className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280] text-sm">
            <Award size={40} className="mx-auto mb-2 text-gray-300" />
            <p>No certificates issued yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-gray-50 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-amber-500 shrink-0" />
                    <span className="font-medium text-gray-900 truncate">{c.volunteer_name}</span>
                    {authStatuses[c.id] ? (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Authenticated
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">No auth</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280] mt-0.5">
                    <span>{c.task_title}</span>
                    <span>{c.hours_contributed}h</span>
                    <span className="text-gray-400">{c.certificate_number}</span>
                    <span>{new Date(c.issued_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!authStatuses[c.id] && (
                    <button onClick={() => handleSetupAuth(c.id)} disabled={settingUpAuth === c.id}
                      className="text-[#4F46C8] hover:text-[#4338CA] transition-colors p-1 text-xs flex items-center gap-1" title="Enable SHA-256 Authentication">
                      {settingUpAuth === c.id ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                      <span className="hidden sm:inline">Enable Auth</span>
                    </button>
                  )}
                  <button onClick={() => downloadCert(c.id)} className="text-[#4F46C8] hover:text-[#4338CA] transition-colors p-1" title="Download">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
