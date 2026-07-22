'use client'
import { useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost } from '@/app/lib/api'
import {
  ClipboardCheck, Clock, Search, Filter, CheckCircle2,
  XCircle, Inbox, Users, AlertTriangle
} from 'lucide-react'

interface AttendanceRecord {
  id: number
  volunteer_profile_id: number
  task_id: number
  check_in_time: string | null
  check_out_time: string | null
  hours: number
  participation_status: string
  feedback: string | null
  created_at: string
  updated_at: string
  volunteer: {
    id: number
    user: { id: number; name: string; email: string; phone: string }
  }
  task: { id: number; title: string }
}

interface Meta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface Summary {
  total_records: number
  completed: number
  active: number
  absent: number
  assigned: number
  total_hours: number
}

interface Task {
  id: number
  title: string
}

const STATUS_COLORS: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-purple-100 text-purple-700',
  absent: 'bg-red-100 text-red-700',
}

export default function NgoAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
  const [loading, setLoading] = useState(true)
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

      const [recordsRes, summaryRes] = await Promise.all([
        apiGet<{ data: AttendanceRecord[]; meta: Meta }>(`/api/ngo/attendance?${params}`),
        apiGet<{ data: Summary }>('/api/ngo/attendance/summary'),
      ])
      setRecords(recordsRes.data)
      setMeta(recordsRes.meta)
      setSummary(summaryRes.data)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, taskFilter, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    apiGet<{ data: Task[] }>('/api/ngo/tasks').then((res) => setTasks(res.data)).catch(() => {})
  }, [])

  const approveAttendance = async (id: number) => {
    try {
      await apiPost(`/api/ngo/attendance/${id}/approve`, {})
      load()
    } catch (err: any) {
      alert(err.message || 'Failed to approve')
    }
  }

  const markAbsent = async (id: number) => {
    if (!confirm('Mark this volunteer as absent?')) return
    try {
      await apiPost(`/api/ngo/attendance/${id}/absent`, {})
      load()
    } catch (err: any) {
      alert(err.message || 'Failed to mark absent')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-[#6B7280]">Manage volunteer attendance and hours</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white border border-black/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{summary.total_records}</p>
            <p className="text-xs text-[#6B7280]">Total</p>
          </div>
          <div className="bg-white border border-black/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
            <p className="text-xs text-[#6B7280]">Completed</p>
          </div>
          <div className="bg-white border border-black/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.active}</p>
            <p className="text-xs text-[#6B7280]">Active</p>
          </div>
          <div className="bg-white border border-black/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            <p className="text-xs text-[#6B7280]">Absent</p>
          </div>
          <div className="bg-white border border-black/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-[#4F46C8]">{summary.total_hours}</p>
            <p className="text-xs text-[#6B7280]">Hours</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8] appearance-none cursor-pointer w-full" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="absent">Absent</option>
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
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-10 text-center">
          <ClipboardCheck size={36} className="mx-auto text-[#6B7280] mb-3" />
          <p className="text-gray-900 font-medium mb-1">No attendance records</p>
          <p className="text-[#6B7280] text-sm">Attendance records appear when volunteers check in to opportunities.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {records.map((r) => (
              <div key={r.id} className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Users size={18} className="text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{r.volunteer?.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-[#6B7280]">{r.task?.title || `Task #${r.task_id}`}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1"><Clock size={11} /> {r.hours > 0 ? `${r.hours}h` : '—'}</span>
                        {r.check_in_time && <span>In: {new Date(r.check_in_time).toLocaleString()}</span>}
                        {r.check_out_time && <span>Out: {new Date(r.check_out_time).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[r.participation_status] || 'bg-gray-100 text-gray-600'}`}>
                      {r.participation_status}
                    </span>
                    {r.participation_status === 'assigned' && (
                      <>
                        <button onClick={() => approveAttendance(r.id)} className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition">
                          Approve
                        </button>
                        <button onClick={() => markAbsent(r.id)} className="text-xs font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
                          Absent
                        </button>
                      </>
                    )}
                    {r.participation_status === 'active' && (
                      <button onClick={() => approveAttendance(r.id)} className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition">
                        Complete
                      </button>
                    )}
                  </div>
                </div>
                {r.feedback && <p className="text-xs text-[#6B7280] italic mt-2">"{r.feedback}"</p>}
              </div>
            ))}
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
