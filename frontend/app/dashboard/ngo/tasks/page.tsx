'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/link'
import Link from 'next/link'
import { apiGet, apiDelete } from '@/app/lib/api'
import {
  FileText, MapPin, Calendar, Users, Clock, PlusCircle,
  Search, Filter, Trash2, Edit3, Eye, ChevronDown, AlertTriangle
} from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  category_id: number | null
  task_type: string
  location: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  required_volunteers: number
  start_date: string
  end_date: string | null
  application_deadline: string | null
  urgency_level: string
  status: string
  selection_logic: string | null
  created_at: string
  skills?: { id: number; name: string }[]
  applications_count?: number
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiGet<{ data: Task[] }>('/api/ngo/tasks')
      setTasks(res.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true)
      await apiDelete(`/api/ngo/tasks/${id}`)
      setShowDeleteConfirm(null)
      loadTasks()
    } catch (err: any) {
      alert(err.message || 'Failed to delete task')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = tasks.filter((t) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || t.title.toLowerCase().includes(q) || (t.location || '').toLowerCase().includes(q) || (t.city || '').toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc }, {} as Record<string, number>)

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    open: 'bg-green-100 text-green-700',
    ongoing: 'bg-blue-100 text-blue-700',
    completed: 'bg-purple-100 text-purple-700',
  }

  const urgencyColors: Record<string, string> = {
    low: 'bg-gray-50 text-gray-500 border border-gray-200',
    medium: 'bg-amber-50 text-amber-600 border border-amber-200',
    high: 'bg-red-50 text-red-600 border border-red-200',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center p-8">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertTriangle size={36} className="mx-auto text-red-500 mb-3" />
          <p className="text-red-600 font-medium mb-2">Failed to load tasks</p>
          <p className="text-sm text-[#6B7280]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Opportunities</h1>
            <p className="text-sm text-gray-500">{tasks.length} total</p>
          </div>
          <Link href="/dashboard/ngo/post-task" className="flex items-center gap-2 bg-[#4F46C8] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#4338CA] transition self-start">
            <PlusCircle size={16} /> New Opportunity
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks by title, location..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8] focus:ring-1 focus:ring-[#4F46C8]/30 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8] focus:ring-1 focus:ring-[#4F46C8]/30 transition appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status ({tasks.length})</option>
              {Object.entries(statusCounts).map(([s, c]) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)} ({c})</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white border border-black/5 rounded-xl p-10 text-center">
              <FileText size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No opportunities found</p>
              <p className="text-sm text-gray-400 mt-1">{searchQuery ? 'Try a different search term.' : 'Create your first opportunity to get started.'}</p>
            </div>
          )}
          {filtered.map((task) => (
            <div key={task.id} className="bg-white border border-black/5 rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-600'}`}>
                      {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
                    </span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${urgencyColors[task.urgency_level] || ''}`}>
                      {task.urgency_level?.charAt(0).toUpperCase() + task.urgency_level?.slice(1)}
                    </span>
                    {task.applications_count !== undefined && (
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                        {task.applications_count} applicant{task.applications_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-800">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                    {(task.city || task.location) && <span className="flex items-center gap-1"><MapPin size={12} /> {[task.city, task.location].filter(Boolean).join(', ')}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'TBD'}{task.end_date ? ` - ${new Date(task.end_date).toLocaleDateString()}` : ''}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {task.required_volunteers} needed</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                  {task.skills && task.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {task.skills.map((s) => (
                        <span key={s.id} className="text-[10px] bg-[#EEF0FF] text-[#4F46C8] px-2 py-0.5 rounded-full">{s.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 lg:flex-shrink-0">
                  <Link href={`/dashboard/ngo/tasks/${task.id}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4F46C8] bg-[#EEF0FF] rounded-lg hover:bg-[#DDE0FF] transition">
                    <Eye size={14} /> View
                  </Link>
                  <Link href={`/dashboard/ngo/tasks/edit/${task.id}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                    <Edit3 size={14} /> Edit
                  </Link>
                  <Link href={`/dashboard/ngo/tasks/close/${task.id}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition">
                    <Clock size={14} /> Close
                  </Link>
                  <button onClick={() => setShowDeleteConfirm(task.id)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <Trash2 size={28} className="text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-center text-gray-900 mb-1">Delete this task?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-60">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
