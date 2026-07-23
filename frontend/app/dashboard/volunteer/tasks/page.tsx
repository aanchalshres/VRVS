'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost } from "@/app/lib/api";
import { useRouter } from 'next/navigation'
import { RecommendationScores, getOverallScore, generateExplanation, getMatchColor, formatScore } from '@/app/lib/scoring'
import {
  MapPin, Users, Layers, Inbox, Send,
  CheckCircle, AlertCircle, Eye, Search, X,
} from 'lucide-react'

interface VolunteerTask {
  id: number;
  title: string;
  description: string;
  location: string | null;
  city: string | null;
  required_volunteers?: number;
  urgency_level?: string;
  task_type?: string;
  category?: string;
  category_id?: number;
  selectedSkills?: string[];
  skills?: { id: number; name: string }[];
  [key: string]: unknown;
}

interface Category {
  id: number;
  name: string;
}

const urgencyStyles: Record<string, { text: string; bg: string; dot: string }> = {
  low: { text: 'text-[#4F46C8]', bg: 'bg-[#4F46C8]/10', dot: 'bg-[#4F46C8]' },
  medium: { text: 'text-[#B45309]', bg: 'bg-[#B45309]/10', dot: 'bg-[#B45309]' },
  high: { text: 'text-[#B91C1C]', bg: 'bg-[#B91C1C]/10', dot: 'bg-[#B91C1C]' },
}

const TASK_TYPES = ['Event', 'Emergency', 'Campaign', 'Task']
const URGENCY_LEVELS = ['Low', 'Medium', 'High']

export default function VolunteerTasksPage() {
  const router = useRouter()

  const [tasks, setTasks] = useState<VolunteerTask[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [urgencyLevel, setUrgencyLevel] = useState('')
  const [taskType, setTaskType] = useState('')
  const [location, setLocation] = useState('')

  const hasFilters = search || categoryId || urgencyLevel || taskType || location

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryId) params.set('category_id', categoryId)
    if (urgencyLevel) params.set('urgency_level', urgencyLevel)
    if (taskType) params.set('task_type', taskType)
    if (location) params.set('location', location)
    const qs = params.toString()
    return qs ? `/volunteer/tasks?${qs}` : '/volunteer/tasks'
  }, [search, categoryId, urgencyLevel, taskType, location])

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      const endpoint = buildQuery()
      const res = await apiGet<{ data: VolunteerTask[] }>(endpoint)
      setTasks(res.data ?? [])
    } catch (err: any) {
      console.error('Failed to load tasks:', err)
      setToast({ message: 'Could not load tasks. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [buildQuery])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    apiGet<{ data: Category[] }>('/categories').then(res => {
      setCategories(res.data ?? [])
    }).catch(() => {})
  }, [])

  const clearFilters = () => {
    setSearch('')
    setCategoryId('')
    setUrgencyLevel('')
    setTaskType('')
    setLocation('')
  }

  const handleApply = async (task: VolunteerTask) => {
    setApplying(task.id)
    setToast(null)
    try {
      await apiPost(`/volunteer/tasks/${task.id}/apply`, {})
      setToast({ message: 'Application submitted successfully!', type: 'success' })
      setTimeout(() => router.push('/dashboard/volunteer/applications'), 1200)
    } catch (err: any) {
      const msg = err.message || 'Failed to apply. Please try again.'
      setToast({ message: msg, type: 'error' })
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">
            Volunteer Task Feed
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Browse open tasks and apply to the ones that fit you.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#CACDD3] p-4 mb-6 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#CACDD3] rounded-lg focus:outline-none focus:border-[#4F46C8]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-3 py-2 text-sm border border-[#CACDD3] rounded-lg focus:outline-none focus:border-[#4F46C8] bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value)}
              className="px-3 py-2 text-sm border border-[#CACDD3] rounded-lg focus:outline-none focus:border-[#4F46C8] bg-white"
            >
              <option value="">All Urgency</option>
              {URGENCY_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="px-3 py-2 text-sm border border-[#CACDD3] rounded-lg focus:outline-none focus:border-[#4F46C8] bg-white"
            >
              <option value="">All Types</option>
              {TASK_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className="px-3 py-2 text-sm border border-[#CACDD3] rounded-lg focus:outline-none focus:border-[#4F46C8] w-36"
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-[#6B7280] hover:text-red-600 border border-[#CACDD3] rounded-lg hover:border-red-300 transition"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-dashed border-[#CACDD3] rounded-2xl p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#F0F1F3] flex items-center justify-center">
              <Inbox className="h-6 w-6 text-[#6B7280]" />
            </div>
            <p className="text-[#111827] font-semibold">
              {hasFilters ? 'No matching tasks found' : 'No tasks available'}
            </p>
            <p className="text-[#6B7280] text-sm mt-1">
              {hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Check back soon for new opportunities.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-[#4F46C8] hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((task) => {
              const urgencyKey = (task.urgency_level || 'low').toLowerCase()
              const urgency = urgencyStyles[urgencyKey] ?? urgencyStyles.low
              const taskSkills = task.skills || task.selectedSkills || []

              return (
                <div
                  key={task.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-[#CACDD3] hover:border-[#7683D6]/60 transition flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-[#111827]">{task.title}</h2>
                    <span
                      className={`inline-flex items-center gap-1.5 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${urgency.bg} ${urgency.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${urgency.dot}`} />
                      {urgencyKey} urgency
                    </span>
                  </div>

                  <p className="text-sm text-[#6B7280] mt-1.5 line-clamp-2">
                    {task.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-[#111827]">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#6B7280] shrink-0" />
                      {task.city || task.location || 'Remote / Online'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#6B7280] shrink-0" />
                      {task.required_volunteers || 1} Volunteers Needed
                    </p>
                    <p className="flex items-center gap-2 capitalize">
                      <Layers className="h-4 w-4 text-[#6B7280] shrink-0" />
                      {task.task_type || task.category || 'task'}
                    </p>
                  </div>

                  {taskSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {taskSkills.map((skill: any) => (
                        <span
                          key={skill.id || skill}
                          className="px-2.5 py-1 text-xs font-medium bg-[#4F46C8]/10 text-[#4F46C8] rounded-full"
                        >
                          {skill.name || skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {(task.recommendation_score || task.match_score) && (
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#6B7280]">Match Score</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getMatchColor(getOverallScore(task as RecommendationScores))}`}>
                          {getOverallScore(task as RecommendationScores)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-center">
                        {[
                          { label: 'Semantic', value: task.semantic_match_score },
                          { label: 'Skills', value: task.skill_overlap_score },
                          { label: 'Distance', value: task.distance_score },
                          { label: 'Avail.', value: task.availability_score },
                          { label: 'Trust', value: task.trust_score },
                        ].map((s) => (
                          <div key={s.label} className="text-[10px] text-[#6B7280]">
                            <div className="font-semibold text-[#111827]">{formatScore(s.value)}%</div>
                            <div>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {generateExplanation(task as RecommendationScores).map((reason, i) => (
                          <span key={i} className="text-[10px] bg-[#4F46C8]/10 text-[#4F46C8] px-1.5 py-0.5 rounded-full">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/volunteer/apply/${task.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-[#CACDD3] hover:bg-gray-50 text-[#111827] py-2.5 rounded-lg transition font-medium text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </button>
                    <button
                      onClick={() => handleApply(task)}
                      disabled={applying === task.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#4F46C8] hover:bg-[#4F46C8]/90 disabled:bg-[#4F46C8]/50 text-white py-2.5 rounded-lg transition font-medium text-sm"
                    >
                      {applying === task.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Apply Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
