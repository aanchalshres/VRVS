'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiGet, apiPut } from '@/app/lib/api'
import {
  ArrowLeft, Save, AlertTriangle, CheckCircle2, ChevronDown
} from 'lucide-react'

interface Skill {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

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
  skills?: { id: number; name: string }[]
}

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = Number(params.id)

  const [form, setForm] = useState<any>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [notFound, setNotFound] = useState(false)
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [taskRes, skillsRes, categoriesRes] = await Promise.all([
          apiGet<{ data: Task }>(`/api/ngo/tasks/${taskId}`),
          apiGet<{ data: Skill[] }>('/api/skills').catch(() => ({ data: [] })),
          apiGet<{ data: Category[] }>('/api/categories').catch(() => ({ data: [] })),
        ])
        const task = taskRes.data
        setForm(task)
        setSelectedSkills(task.skills?.map((s) => s.id) || [])
        setSkills(skillsRes.data || [])
        setCategories(categoriesRes.data || [])
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [taskId])

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }))
    setSaved(false)
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const toggleSkill = (skillId: number) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    )
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!form.description.trim()) next.description = 'Description is required'
    if (!form.start_date) next.start_date = 'Start date is required'
    return next
  }

  const handleSave = async () => {
    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        required_volunteers: Number(form.required_volunteers),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        skills: selectedSkills,
        start_date: form.start_date?.slice(0, 10) || form.start_date,
        end_date: form.end_date?.slice(0, 10) || form.end_date || null,
        application_deadline: form.application_deadline?.slice(0, 10) || form.application_deadline || null,
      }
      await apiPut(`/api/ngo/tasks/${taskId}`, payload)
      setSaved(true)
      setTimeout(() => router.push('/dashboard/ngo/tasks'), 700)
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to update task' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center p-8">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-10 text-center max-w-md">
          <AlertTriangle size={36} className="mx-auto text-red-500 mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Task not found</h1>
          <p className="text-[#6B7280] mb-6">This task may have already been deleted or the link is invalid.</p>
          <button onClick={() => router.push('/dashboard/ngo/tasks')} className="bg-[#4F46C8] hover:bg-[#3f39a8] transition text-white px-5 py-2.5 rounded-lg font-medium">
            Back to Manage Tasks
          </button>
        </div>
      </div>
    )
  }

  if (!form) return null

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 bg-white border ${errors[field] ? 'border-red-400' : 'border-gray-200'} rounded-lg text-sm outline-none focus:border-[#4F46C8] focus:ring-1 focus:ring-[#4F46C8]/30 transition`

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push('/dashboard/ngo/tasks')} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Manage Tasks
        </button>

        <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-lg font-bold text-gray-900 mb-1">Edit Task</h1>
          <p className="text-sm text-[#6B7280] mb-6">Update the details for this volunteer opportunity.</p>

          {errors.form && (
            <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded p-3 mb-6">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="space-y-5">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title <span className="text-red-500">*</span></label>
              <input type="text" className={inputClass('title')} value={form.title} onChange={(e) => updateField('title', e.target.value)} />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description <span className="text-red-500">*</span></label>
              <textarea rows={4} className={inputClass('description')} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                <div className="relative">
                  <select className={`${inputClass('category_id')} appearance-none`} value={form.category_id || ''} onChange={(e) => updateField('category_id', e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Task Type</label>
                <select className={`${inputClass('task_type')} appearance-none`} value={form.task_type} onChange={(e) => updateField('task_type', e.target.value)}>
                  <option value="one_time">One-Time</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                <input type="text" className={inputClass('location')} value={form.location || ''} onChange={(e) => updateField('location', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                <input type="text" className={inputClass('city')} value={form.city || ''} onChange={(e) => updateField('city', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Volunteers Needed</label>
                <input type="number" min={1} className={inputClass('required_volunteers')} value={form.required_volunteers} onChange={(e) => updateField('required_volunteers', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Urgency Level</label>
                <select className={`${inputClass('urgency_level')} appearance-none`} value={form.urgency_level} onChange={(e) => updateField('urgency_level', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date <span className="text-red-500">*</span></label>
                <input type="date" className={inputClass('start_date')} value={form.start_date?.slice(0, 10) || ''} onChange={(e) => updateField('start_date', e.target.value)} />
                {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                <input type="date" className={inputClass('end_date')} value={form.end_date?.slice(0, 10) || ''} onChange={(e) => updateField('end_date', e.target.value || null)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Application Deadline</label>
                <input type="date" className={inputClass('application_deadline')} value={form.application_deadline?.slice(0, 10) || ''} onChange={(e) => updateField('application_deadline', e.target.value || null)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Selection Logic</label>
                <select className={`${inputClass('selection_logic')} appearance-none`} value={form.selection_logic || 'manual'} onChange={(e) => updateField('selection_logic', e.target.value)}>
                  <option value="manual">Manual Review</option>
                  <option value="auto_accept">Auto Accept</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <select className={`${inputClass('status')} appearance-none`} value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <button key={s.id} type="button" onClick={() => toggleSkill(s.id)} className={`text-xs px-3 py-1.5 rounded-full border transition ${selectedSkills.includes(s.id) ? 'bg-[#4F46C8] text-white border-[#4F46C8]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#4F46C8]'}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <button onClick={handleSave} disabled={submitting} className="flex items-center gap-2 bg-[#4F46C8] hover:bg-[#3f39a8] transition text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60">
              <Save size={16} />
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => router.push('/dashboard/ngo/tasks')} className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition">
              Discard
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium ml-2">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
