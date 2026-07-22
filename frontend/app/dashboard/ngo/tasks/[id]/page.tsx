'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiGet } from '@/app/lib/api'
import {
  ArrowLeft, MapPin, Calendar, Users, Clock,
  AlertTriangle, Globe, Edit3, Trash2
} from 'lucide-react'
import Link from 'next/link'

interface TaskDetail {
  id: number
  title: string
  slug: string
  description: string
  category_id: number | null
  task_type: string
  selection_logic: string | null
  location: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  required_volunteers: number
  start_date: string
  end_date: string | null
  application_deadline: string | null
  urgency_level: string
  status: string
  cover_image: string | null
  created_at: string
  updated_at: string
  total_applications: number
  pending_applications: number
  accepted_applications: number
  skills: { id: number; name: string }[]
  category: { id: number; name: string } | null
  ngo: { id: number; organization_name: string; logo: string | null; city: string | null; country: string | null }
}

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = Number(params.id)

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiGet<{ data: TaskDetail }>(`/api/ngo/tasks/${taskId}`)
        setTask(res.data)
      } catch (err: any) {
        setError(err.message || 'Failed to load task')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [taskId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <AlertTriangle size={36} className="mx-auto text-red-500 mb-3" />
        <p className="text-red-600 font-medium mb-2">Failed to load opportunity</p>
        <p className="text-sm text-[#6B7280]">{error}</p>
        <button onClick={() => router.push('/dashboard/ngo/tasks')} className="mt-4 bg-[#4F46C8] text-white px-4 py-2 rounded-lg text-sm font-medium">
          Back to Tasks
        </button>
      </div>
    )
  }

  if (!task) return null

  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700',
    Open: 'bg-green-100 text-green-700',
    Ongoing: 'bg-blue-100 text-blue-700',
    Completed: 'bg-purple-100 text-purple-700',
    Cancelled: 'bg-red-100 text-red-700',
  }

  const urgencyColors: Record<string, string> = {
    Low: 'bg-gray-50 text-gray-500 border border-gray-200',
    Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
    High: 'bg-red-50 text-red-600 border border-red-200',
  }

  const remaining = task.required_volunteers - task.accepted_applications

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white border border-black/5 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-600'}`}>
                  {task.status}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${urgencyColors[task.urgency_level] || ''}`}>
                  {task.urgency_level}
                </span>
                {task.category && (
                  <span className="text-xs bg-[#EEF0FF] text-[#4F46C8] px-2.5 py-0.5 rounded-full">
                    {task.category.name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <p className="text-sm text-[#6B7280] mt-1">Created {new Date(task.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/ngo/tasks/edit/${task.id}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                <Edit3 size={14} /> Edit
              </Link>
              <Link href={`/dashboard/ngo/tasks/delete/${task.id}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                <Trash2 size={14} /> Delete
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-sm text-[#6B7280] whitespace-pre-wrap">{task.description || 'No description'}</p>
            </div>

            {task.skills && task.skills.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {task.skills.map((s) => (
                    <span key={s.id} className="text-xs bg-[#EEF0FF] text-[#4F46C8] px-3 py-1 rounded-full">{s.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">Details</h2>

              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Users size={16} className="text-[#4F46C8] shrink-0" />
                <span><strong className="text-gray-900">{task.required_volunteers}</strong> volunteers needed</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Users size={16} className="text-green-600 shrink-0" />
                <span><strong className="text-gray-900">{task.accepted_applications}</strong> assigned</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Clock size={16} className="text-amber-600 shrink-0" />
                <span><strong className="text-gray-900">{task.pending_applications}</strong> pending reviews</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Users size={16} className="text-blue-600 shrink-0" />
                <span><strong className={`${remaining > 0 ? 'text-blue-600' : 'text-green-600'}`}>{remaining > 0 ? `${remaining} remaining` : 'Filled'}</strong></span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Calendar size={16} className="text-[#4F46C8] shrink-0" />
                <span>{task.start_date ? new Date(task.start_date).toLocaleDateString() : 'TBD'}{task.end_date ? ` - ${new Date(task.end_date).toLocaleDateString()}` : ''}</span>
              </div>

              {task.application_deadline && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Clock size={16} className="text-red-500 shrink-0" />
                  <span>Deadline: {new Date(task.application_deadline).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Globe size={16} className="text-[#4F46C8] shrink-0" />
                <span>{task.task_type}</span>
              </div>

              {task.selection_logic && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Users size={16} className="text-[#4F46C8] shrink-0" />
                  <span>Selection: {task.selection_logic}</span>
                </div>
              )}
            </div>

            {(task.location || task.city) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h2 className="text-sm font-semibold text-gray-900">Location</h2>
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <MapPin size={16} className="text-[#4F46C8] shrink-0" />
                  <span>{[task.city, task.location, task.country].filter(Boolean).join(', ')}</span>
                </div>
                {task.latitude && task.longitude && (
                  <p className="text-xs text-[#6B7280]">{task.latitude}, {task.longitude}</p>
                )}
              </div>
            )}

            {task.ngo && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h2 className="text-sm font-semibold text-gray-900">Organization</h2>
                <p className="text-sm font-medium text-gray-900">{task.ngo.organization_name}</p>
                {(task.ngo.city || task.ngo.country) && (
                  <p className="text-xs text-[#6B7280]">{[task.ngo.city, task.ngo.country].filter(Boolean).join(', ')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
