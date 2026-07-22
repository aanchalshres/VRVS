'use client'

import { useEffect, useState } from 'react'
import { useAuth } from "@/app/providers/AuthProvider";
import { apiGet, apiPost } from "@/app/lib/api";
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Users,
  Layers,
  Inbox,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface VolunteerTask {
  id: number;
  title: string;
  description: string;
  location: string | null;
  required_volunteers?: number;
  volunteers_needed?: number;
  quota?: number;
  urgency_level?: string;
  urgency?: string;
  type?: string;
  task_type?: string;
  category?: string;
  selectedSkills?: string[];
  [key: string]: unknown;
}

const urgencyStyles: Record<string, { text: string; bg: string; dot: string }> = {
  low: { text: 'text-[#4F46C8]', bg: 'bg-[#4F46C8]/10', dot: 'bg-[#4F46C8]' },
  medium: { text: 'text-[#B45309]', bg: 'bg-[#B45309]/10', dot: 'bg-[#B45309]' },
  high: { text: 'text-[#B91C1C]', bg: 'bg-[#B91C1C]/10', dot: 'bg-[#B91C1C]' },
}

export default function VolunteerTasksPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [tasks, setTasks]         = useState<VolunteerTask[]>([])
  const [loading, setLoading]     = useState(true)
  const [applying, setApplying]   = useState<number | null>(null)
  const [toast, setToast]         = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await apiGet<{ data: VolunteerTask[] }>('/volunteer/tasks')
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-dashed border-[#CACDD3] rounded-2xl p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#F0F1F3] flex items-center justify-center">
              <Inbox className="h-6 w-6 text-[#6B7280]" />
            </div>
            <p className="text-[#111827] font-semibold">No tasks available</p>
            <p className="text-[#6B7280] text-sm mt-1">Check back soon for new opportunities.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">

            {tasks.map((task) => {
              const urgencyKey = (task.urgency_level || task.urgency || 'low').toLowerCase()
              const urgency = urgencyStyles[urgencyKey] ?? urgencyStyles.low

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

                  <p className="text-sm text-[#6B7280] mt-1.5">
                    {task.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-[#111827]">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#6B7280] shrink-0" />
                      {task.location || 'Remote / Online'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#6B7280] shrink-0" />
                      {task.volunteers_needed || task.required_volunteers || task.quota || 1} Volunteers Needed
                    </p>
                    <p className="flex items-center gap-2 capitalize">
                      <Layers className="h-4 w-4 text-[#6B7280] shrink-0" />
                      {task.type || task.task_type || task.category || 'task'}
                    </p>
                  </div>

                  {task.selectedSkills && task.selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {task.selectedSkills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs font-medium bg-[#4F46C8]/10 text-[#4F46C8] rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleApply(task)}
                    disabled={applying === task.id}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#4F46C8] hover:bg-[#4F46C8]/90 disabled:bg-[#4F46C8]/50 text-white py-2.5 rounded-lg transition font-medium"
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
              )
            })}

          </div>
        )}
      </div>
    </div>
  )
}
