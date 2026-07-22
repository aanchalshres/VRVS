'use client'
import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/app/lib/api'
import {
  User, Clock, CheckCircle2, XCircle, Hourglass,
  Inbox, ChevronDown, ChevronUp
} from 'lucide-react'

interface Application {
  id: number
  task_id: number
  volunteer_profile_id: number
  status: string
  applied_at: string
  reviewed_at: string | null
  remarks: string | null
  task: {
    id: number
    title: string
  }
  volunteer: {
    id: number
    first_name?: string
    last_name?: string
    skills?: string[]
    availability?: string[]
    experience_level?: string
    motivation?: string
    previous_experience?: string
    user?: {
      id: number
      name: string
      email: string
      phone: string
    }
  }
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Hourglass, label: 'Pending' },
  Accepted: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Accepted' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  Withdrawn: { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle, label: 'Withdrawn' },
}

export default function NgoApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const loadApplications = async () => {
    try {
      setLoading(true)
      const res = await apiGet<{ data: Application[] }>('/api/ngo/applications')
      setApplications(res.data)
    } catch {
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadApplications() }, [])

  const updateStatus = async (id: number, action: 'accept' | 'reject') => {
    try {
      await apiPost(`/api/ngo/applications/${id}/${action}`, {})
      loadApplications()
    } catch (err: any) {
      alert(err.message || `Failed to ${action} application`)
    }
  }

  const visible = applications

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-[#6B7280]">Review and manage volunteer applications for your tasks.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/5 p-10 text-center">
            <Inbox size={36} className="mx-auto text-[#6B7280] mb-3" />
            <p className="text-gray-900 font-medium mb-1">No applications yet</p>
            <p className="text-[#6B7280] text-sm">Applications will appear here as volunteers apply to your tasks.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((app) => {
              const status = STATUS_STYLES[app.status] || STATUS_STYLES.Pending
              const StatusIcon = status.icon
              const title = app.task?.title || `Task #${app.task_id}`
              const isExpanded = expandedId === app.id
              const vol = app.volunteer
              const volUser = vol?.user

              return (
                <div key={app.id} className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
                        <User size={18} className="text-[#4F46C8]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{volUser?.name || 'Unknown'}</p>
                        <p className="text-xs text-[#6B7280] truncate">Applied for: {title}</p>
                        <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${status.bg} ${status.text}`}>
                      <StatusIcon size={13} />
                      {status.label}
                    </span>
                  </div>

                  {volUser && (
                    <button onClick={() => setExpandedId(isExpanded ? null : app.id)} className="flex items-center gap-1.5 text-xs font-medium text-[#4F46C8] hover:text-[#3f39a8] mb-2">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Hide details' : 'View application details'}
                    </button>
                  )}

                  {isExpanded && volUser && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2.5">
                      <p><span className="text-[#6B7280]">Email:</span> <span className="text-gray-900">{volUser.email}</span></p>
                      <p><span className="text-[#6B7280]">Phone:</span> <span className="text-gray-900">{volUser.phone || 'N/A'}</span></p>
                      {vol.experience_level && <p><span className="text-[#6B7280]">Experience:</span> <span className="text-gray-900">{vol.experience_level}</span></p>}
                      {vol.skills && vol.skills.length > 0 && <p><span className="text-[#6B7280]">Skills:</span> <span className="text-gray-900">{vol.skills.join(', ')}</span></p>}
                      {vol.availability && vol.availability.length > 0 && <p><span className="text-[#6B7280]">Availability:</span> <span className="text-gray-900">{vol.availability.join(', ')}</span></p>}
                      {vol.motivation && <p><span className="text-[#6B7280]">Motivation:</span> <span className="text-gray-900">{vol.motivation}</span></p>}
                      {vol.previous_experience && <p><span className="text-[#6B7280]">Previous experience:</span> <span className="text-gray-900">{vol.previous_experience}</span></p>}
                    </div>
                  )}

                  {app.status === 'Pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button onClick={() => updateStatus(app.id, 'accept')} className="flex-1 bg-[#4F46C8] hover:bg-[#3f39a8] text-white text-sm font-medium py-2 rounded-lg transition">
                        Approve
                      </button>
                      <button onClick={() => updateStatus(app.id, 'reject')} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 text-sm font-medium py-2 rounded-lg transition">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
