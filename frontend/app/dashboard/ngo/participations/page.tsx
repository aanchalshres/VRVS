'use client'
import { useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost } from '@/app/lib/api'
import {
  Users, Search, Mail, Phone, ShieldCheck, ShieldAlert,
  XCircle, ChevronDown, ChevronUp, Inbox
} from 'lucide-react'

interface Assignment {
  id: number
  task_id: number
  volunteer_profile_id: number
  status: string
  applied_at: string
  reviewed_at: string | null
  task: { id: number; title: string; status: string }
  volunteer: {
    id: number
    skills: { id: number; name: string }[]
    documents: { id: number; status: string }[]
    user: { id: number; name: string; email: string; phone: string }
  }
}

interface Meta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function NgoAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', '20')
      const res = await apiGet<{ data: Assignment[]; meta: Meta }>(`/api/ngo/assignments?${params}`)
      setAssignments(res.data)
      setMeta(res.meta)
    } catch {
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  const cancelAssignment = async (id: number) => {
    if (!confirm('Remove this volunteer from the assignment?')) return
    try {
      await apiPost(`/api/ngo/applications/${id}/cancel`, {})
      load()
    } catch (err: any) {
      alert(err.message || 'Failed to remove volunteer')
    }
  }

  const filtered = assignments.filter((a) => {
    const name = a.volunteer?.user?.name?.toLowerCase() || ''
    const task = a.task?.title?.toLowerCase() || ''
    const q = searchQuery.toLowerCase()
    return name.includes(q) || task.includes(q)
  })

  const isVerified = (a: Assignment) => (a.volunteer?.documents?.filter((d) => d.status === 'verified') || []).length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assigned Volunteers</h1>
        <p className="text-sm text-[#6B7280]">{meta.total} active assignment{meta.total !== 1 ? 's' : ''}</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by name or opportunity..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-10 text-center">
          <Users size={36} className="mx-auto text-[#6B7280] mb-3" />
          <p className="text-gray-900 font-medium mb-1">No assigned volunteers</p>
          <p className="text-[#6B7280] text-sm">Volunteers will appear here after you accept their applications.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((a) => {
              const isExpanded = expandedId === a.id
              const vol = a.volunteer
              const volUser = vol?.user
              const verified = isVerified(a)

              return (
                <div key={a.id} className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                        <Users size={18} className="text-green-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{volUser?.name || 'Unknown'}</p>
                          {verified ? (
                            <ShieldCheck size={14} className="text-green-600" title="Verified" />
                          ) : (
                            <ShieldAlert size={14} className="text-gray-400" title="Not verified" />
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280]">{a.task?.title || `Task #${a.task_id}`}</p>
                        {volUser?.email && <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5"><Mail size={11} /> {volUser.email}</p>}
                        <p className="text-xs text-[#6B7280]">Assigned {new Date(a.reviewed_at || a.applied_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setExpandedId(isExpanded ? null : a.id)} className="p-2 text-[#6B7280] hover:text-[#4F46C8] transition">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button onClick={() => cancelAssignment(a.id)} className="p-2 text-[#6B7280] hover:text-red-500 transition" title="Remove volunteer">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-gray-50 rounded-xl p-4 mt-3 text-sm space-y-2">
                      <p><span className="text-[#6B7280]">Email:</span> <span className="text-gray-900">{volUser?.email || 'N/A'}</span></p>
                      <p><span className="text-[#6B7280]">Phone:</span> <span className="text-gray-900">{volUser?.phone || 'N/A'}</span></p>
                      <p><span className="text-[#6B7280]">Verification:</span>
                        <span className={`ml-1 font-medium ${verified ? 'text-green-600' : 'text-gray-500'}`}>
                          {verified ? 'Documents Verified' : 'Not Verified'}
                        </span>
                      </p>
                      {vol?.skills && vol.skills.length > 0 && (
                        <p>
                          <span className="text-[#6B7280]">Skills:</span>
                          <span className="flex flex-wrap gap-1 mt-1">
                            {vol.skills.map((s) => (
                              <span key={s.id} className="text-xs bg-[#EEF0FF] text-[#4F46C8] px-2 py-0.5 rounded-full">{s.name}</span>
                            ))}
                          </span>
                        </p>
                      )}
                      <p><span className="text-[#6B7280]">Opportunity:</span> <span className="text-gray-900">{a.task?.title} ({a.task?.status})</span></p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                Previous
              </button>
              <span className="text-sm text-[#6B7280]">Page {meta.current_page} of {meta.last_page}</span>
              <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
