'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import { apiGet, apiPost } from '@/app/lib/api'
import {
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
interface TaskSkill {
  id: number
  name: string
}

interface NgoProfile {
  organization_name: string
  is_verified: boolean
}

interface TaskUser {
  id: number
  name: string
  ngoProfile: NgoProfile | null
}

interface VolunteerTask {
  id: number
  title: string
  description: string
  category: string
  district: string
  quota: number
  filled_quota: number
  start_date: string
  end_date: string
  status: string
  is_emergency: boolean
  match_score: number       // 0–100, from backend combined formula
  skills: TaskSkill[]
  user: TaskUser | null
}

// ── Match badge ─────────────────────────────────────────────────────────────
function MatchBadge({ score }: { score: number }) {
  if (score < 10) return null

  const cfg =
    score >= 70 ? { label: 'Strong match', cls: 'bg-green-50 text-green-700 border-green-200' } :
    score >= 40 ? { label: 'Good match',   cls: 'bg-blue-50  text-blue-700  border-blue-200'  } :
                  { label: 'Possible',      cls: 'bg-gray-50  text-gray-600  border-gray-200'  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      {cfg.label} · {score}%
    </span>
  )
}

// ── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
      ${type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function VolunteerTasksPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [tasks, setTasks]         = useState<VolunteerTask[]>([])
  const [loading, setLoading]     = useState(true)
  const [applying, setApplying]   = useState<number | null>(null)
  const [search, setSearch]       = useState('')
  const [district, setDistrict]   = useState('all')
  const [toast, setToast]         = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Unique districts for filter dropdown
  const districts = ['all', ...Array.from(new Set(tasks.map(t => t.district).filter(Boolean)))]

  // ── Fetch tasks from backend ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await apiGet<{ data: VolunteerTask[] }>('/volunteer/tasks')
        // API returns tasks already sorted by match_score DESC
        setTasks(res.data ?? [])
      } catch (err: any) {
        console.error('Failed to load tasks:', err)
        setToast({ message: 'Could not load tasks. Please try again.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Apply for a task ─────────────────────────────────────────────────────
  async function handleApply(taskId: number) {
    try {
      setApplying(taskId)
      await apiPost(`/volunteer/tasks/${taskId}/apply`, {})
      setToast({ message: 'Application submitted!', type: 'success' })
      // Refresh so quota updates
      const res = await apiGet<{ data: VolunteerTask[] }>('/volunteer/tasks')
      setTasks(res.data ?? [])
    } catch (err: any) {
      const msg = err?.message ?? 'Something went wrong'
      if (msg.includes('409') || msg.includes('already applied')) {
        setToast({ message: 'You have already applied for this task.', type: 'error' })
      } else if (msg.includes('400') || msg.includes('quota')) {
        setToast({ message: 'This task is fully booked.', type: 'error' })
      } else {
        setToast({ message: 'Failed to apply. Please try again.', type: 'error' })
      }
    } finally {
      setApplying(null)
    }
  }

  // ── Client-side filter (search + district) ───────────────────────────────
  const filtered = tasks.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.skills.some(s => s.name.toLowerCase().includes(q))
    const matchDistrict = district === 'all' || t.district === district
    return matchSearch && matchDistrict
  })

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Browse Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">Finding tasks matched to your skills…</p>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-full mb-2" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tasks are ranked by how well they match your skills, location, and trust score.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          Algorithm: TF-IDF · Haversine · Trust score
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-50">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search tasks, skills, categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm outline-none w-full bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="text-sm outline-none bg-transparent"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d === 'all' ? 'All Districts' : d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400">
        {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'} found
        {search || district !== 'all' ? ' (filtered)' : ''}
      </p>

      {/* Task cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No tasks found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search || district !== 'all'
              ? 'Try clearing your filters'
              : 'Check back later — NGOs are adding new tasks regularly'}
          </p>
          {(search || district !== 'all') && (
            <button
              onClick={() => { setSearch(''); setDistrict('all') }}
              className="mt-4 text-sm text-[#4F46C8] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(task => {
            const progress = task.quota > 0 ? (task.filled_quota / task.quota) * 100 : 0
            const isFull   = task.filled_quota >= task.quota
            const isLoading = applying === task.id

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border p-6 transition-shadow hover:shadow-md
                  ${task.is_emergency ? 'border-red-300' : 'border-gray-200'}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {task.is_emergency && (
                        <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          🚨 Emergency
                        </span>
                      )}
                      <h2 className="text-base font-semibold text-gray-900">{task.title}</h2>
                    </div>
                    {task.user?.ngoProfile && (
                      <p className="text-xs text-gray-400 mb-2">
                        by {task.user.ngoProfile.organization_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  {/* Match badge */}
                  <MatchBadge score={task.match_score} />
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {task.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(task.start_date).toLocaleDateString()} – {new Date(task.end_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {task.filled_quota}/{task.quota} volunteers
                  </span>
                  <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                    {task.category}
                  </span>
                </div>

                {/* Skills */}
                {task.skills && task.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {task.skills.map(s => (
                      <span key={s.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-[#4F46C8]'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  {isFull && (
                    <p className="text-xs text-red-500 mt-1">This task is fully booked</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => router.push(`/dashboard/volunteer/apply/${task.id}`)}
                    className="text-sm text-[#4F46C8] hover:underline"
                  >
                    View details
                  </button>
                  <button
                    onClick={() => handleApply(task.id)}
                    disabled={isFull || isLoading}
                    className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isFull
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#4F46C8] text-white hover:bg-[#3f37a0] active:scale-95'
                      }`}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isFull ? 'Full' : isLoading ? 'Applying…' : 'Apply Now'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}