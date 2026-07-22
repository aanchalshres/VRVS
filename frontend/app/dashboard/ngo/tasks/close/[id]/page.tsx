'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiGet, apiPost } from '@/app/lib/api'
import { ArrowLeft, CheckCircle2, AlertTriangle, Users, Calendar } from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  location: string | null
  required_volunteers: number
  start_date: string
  end_date: string | null
  urgency_level: string
  status: string
}

export default function CloseTaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = Number(params.id)

  const [task, setTask] = useState<Task | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGet<{ data: Task }>(`/api/ngo/tasks/${taskId}`)
        setTask(res.data)
      } catch {
        setNotFound(true)
      }
    }
    load()
  }, [taskId])

  const handleClose = async () => {
    if (!task) return
    setClosing(true)
    setError(null)
    try {
      await apiPost(`/api/ngo/tasks/${taskId}/complete`, {})
      router.push('/dashboard/ngo/tasks')
    } catch (err: any) {
      setError(err.message || 'Failed to close task')
      setClosing(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center p-8">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-10 text-center max-w-md">
          <AlertTriangle size={36} className="mx-auto text-red-500 mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Task not found</h1>
          <p className="text-[#6B7280] mb-6">This task may have already been deleted or the link is invalid.</p>
          <button onClick={() => router.push('/dashboard/ngo/tasks')} className="bg-[#4F46C8] hover:bg-[#3f39a8] transition text-white px-5 py-2.5 rounded-lg font-medium">
            Back to Tasks
          </button>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center p-8">
        <p className="text-[#6B7280]">Loading task...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.push('/dashboard/ngo/tasks')} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Tasks
        </button>

        <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-8">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 size={24} className="text-green-600" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">Close this task?</h1>
          <p className="text-[#6B7280] mb-6">
            <span className="font-medium text-gray-900">"{task.title}"</span> will be marked as{' '}
            <span className="font-medium text-gray-900">completed</span>. It will move out of active
            listings and volunteers will no longer be able to apply.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Users size={15} className="text-[#4F46C8]" />
              {task.required_volunteers} volunteers needed
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={15} className="text-[#4F46C8]" />
              {new Date(task.start_date).toLocaleDateString()}
              {task.end_date && ` – ${new Date(task.end_date).toLocaleDateString()}`}
            </div>
          </div>

          {error && <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded p-3 mb-6"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

          <div className="flex gap-3 justify-end">
            <button onClick={() => router.push('/dashboard/ngo/tasks')} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition">
              Go Back
            </button>
            <button onClick={handleClose} disabled={closing} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-60">
              <CheckCircle2 size={16} />
              {closing ? 'Closing...' : 'Close Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
