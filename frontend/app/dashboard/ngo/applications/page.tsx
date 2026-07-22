'use client'
import { useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost } from '@/app/lib/api'
import {
  User, Clock, CheckCircle2, XCircle, Hourglass,
  Inbox, ChevronDown, ChevronUp, Search, Filter, X, ShieldCheck, ShieldAlert
} from 'lucide-react'

interface Application {
  id: number
  task_id: number
  volunteer_profile_id: number
  status: string
  applied_at: string
  reviewed_at: string | null
  remarks: string | null
  task: { id: number; title: string; status: string }
  volunteer: {
    id: number
    skills: { id: number; name: string }[]
    documents: { id: number; status: string }[]
    user: { id: number; name: string; email: string; phone: string }
  }
}

interface Task {
  id: number
  title: string
}

interface Meta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Hourglass, label: 'Pending' },
  Accepted: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Accepted' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle, label: 'Cancelled' },
}

export default function NgoApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [taskFilter, setTaskFilter] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (taskFilter) params.set('task_id', taskFilter)
      params.set('page', String(page))
      params.set('per_page', '20')

      const res = await apiGet<{ data: Application[]; meta: Meta }>(`/api/ngo/applications?${params}`)
      setApplications(res.data)
      setMeta(res.meta)
    } catch {
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, taskFilter, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await apiGet<{ data: Task[] }>('/api/ngo/tasks')
        setTasks(res.data)
      } catch {}
    }
    loadTasks()
  }, [])

  const updateStatus = async (id: number, action: 'accept' | 'reject') => {
    try {
      await apiPost(`/api/ngo/applications/${id}/${action}`, {})
      load()
    } catch (err: any) {
      alert(err.message || `Failed to ${action} application`)
    }
  }

  const cancelAssignment = async (id: number) => {
    if (!confirm('Cancel this assignment?')) return
    try {
      await apiPost(`/api/ngo/applications/${id}/cancel`, {})
      load()
    } catch (err: any) {
      alert(err.message || 'Failed to cancel assignment')
    }
  }

  const getVerificationStatus = (app: Application) => {
    const verifiedDocs = app.volunteer?.documents?.filter((d) => d.status === 'verified') || []
    return verifiedDocs.length > 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-[#6B7280]">Review and manage volunteer applications ({meta.total} total)</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8] appearance-none cursor-pointer w-full" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="relative flex-1">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8] appearance-none cursor-pointer w-full" value={taskFilter} onChange={(e) => { setTaskFilter(e.target.value); setPage(1) }}>
            <option value="">All Opportunities</option>
            {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-10 text-center">
          <Inbox size={36} className="mx-auto text-[#6B7280] mb-3" />
          <p className="text-gray-900 font-medium mb-1">No applications found</p>
          <p className="text-[#6B7280] text-sm">Adjust filters or wait for volunteers to apply.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((app) => {
              const status = STATUS_STYLES[app.status] || STATUS_STYLES.Pending
              const StatusIcon = status.icon
              const title = app.task?.title || `Task #${app.task_id}`
              const isExpanded = expandedId === app.id
              const vol = app.volunteer
              const volUser = vol?.user
              const isVerified = getVerificationStatus(app)

              return (
                <div key={app.id} className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
                        <User size={18} className="text-[#4F46C8]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">{volUser?.name || 'Unknown'}</p>
                          {isVerified ? (
                            <ShieldCheck size={14} className="text-green-600 shrink-0" title="Verified" />
                          ) : (
                            <ShieldAlert size={14} className="text-gray-400 shrink-0" title="Not verified" />
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] truncate">Applied for: {title}</p>
                        <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                          <Clock size={12} />
                          <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                          {app.status === 'Cancelled' && app.reviewed_at && <span>| Cancelled {new Date(app.reviewed_at).toLocaleDateString()}</span>}
                        </div>
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
                      {isExpanded ? 'Hide details' : 'View details'}
                    </button>
                  )}

                  {isExpanded && volUser && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2.5">
                      <p><span className="text-[#6B7280]">Email:</span> <span className="text-gray-900">{volUser.email}</span></p>
                      <p><span className="text-[#6B7280]">Phone:</span> <span className="text-gray-900">{volUser.phone || 'N/A'}</span></p>
                      <p><span className="text-[#6B7280]">Verification:</span>
                        <span className={`ml-1 font-medium ${isVerified ? 'text-green-600' : 'text-gray-500'}`}>
                          {isVerified ? 'Documents Verified' : 'Not Verified'}
                        </span>
                      </p>
                      {vol.skills && vol.skills.length > 0 && (
                        <p>
                          <span className="text-[#6B7280]">Skills:</span>
                          <span className="flex flex-wrap gap-1 mt-1">
                            {vol.skills.map((s) => (
                              <span key={s.id} className="text-xs bg-[#EEF0FF] text-[#4F46C8] px-2 py-0.5 rounded-full">{s.name}</span>
                            ))}
                          </span>
                        </p>
                      )}
                      <p><span className="text-[#6B7280]">Opportunity:</span> <span className="text-gray-900">{title} ({app.task?.status})</span></p>
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
                      {app.status === 'Accepted' && (
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                          <button onClick={() => cancelAssignment(app.id)} className="flex-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-sm font-medium py-2 rounded-lg transition">
                            Cancel Assignment
                          </button>
                        </div>
                      )}
                    </div>
              )
            })}
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Previous
              </button>
              <span className="text-sm text-[#6B7280]">Page {meta.current_page} of {meta.last_page}</span>
              <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
