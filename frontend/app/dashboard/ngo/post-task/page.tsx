'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost } from '@/app/lib/api'
import {
  ArrowLeft, PlusCircle, MapPin, Calendar,
  Users, Clock, AlertTriangle, ChevronDown
} from 'lucide-react'

interface Skill {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

export default function PostTaskPage() {
  const router = useRouter()
  const [skills, setSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    task_type: 'one_time',
    location: '',
    city: '',
    latitude: '',
    longitude: '',
    required_volunteers: '1',
    start_date: '',
    end_date: '',
    application_deadline: '',
    urgency_level: 'medium',
    selection_logic: 'manual',
    status: 'draft',
    skills: [] as number[],
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [skillsRes, categoriesRes] = await Promise.all([
          apiGet<{ data: Skill[] }>('/api/skills'),
          apiGet<{ data: Category[] }>('/api/categories'),
        ])
        setSkills(skillsRes.data)
        setCategories(categoriesRes.data)
      } catch {
        // Non-critical
      }
    }
    load()
  }, [])

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const toggleSkill = (skillId: number) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((id) => id !== skillId)
        : [...prev.skills, skillId],
    }))
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.title.trim()) errors.title = 'Title is required'
    if (!form.description.trim()) errors.description = 'Description is required'
    if (!form.category_id) errors.category_id = 'Category is required'
    if (!form.start_date) errors.start_date = 'Start date is required'
    if (form.latitude && isNaN(Number(form.latitude))) errors.latitude = 'Must be a number'
    if (form.longitude && isNaN(Number(form.longitude))) errors.longitude = 'Must be a number'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (status: string) => {
    const payload = { ...form, status, required_volunteers: Number(form.required_volunteers), latitude: form.latitude ? Number(form.latitude) : null, longitude: form.longitude ? Number(form.longitude) : null, category_id: form.category_id ? Number(form.category_id) : null }
    if (!validate()) return
    setSubmitting(true)
    setError(null)
    try {
      await apiPost('/api/ngo/tasks', payload)
      router.push('/dashboard/ngo/tasks')
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (key: string) =>
    `w-full px-3 py-2.5 bg-white border ${fieldErrors[key] ? 'border-red-400' : 'border-gray-200'} rounded-lg text-sm outline-none focus:border-[#4F46C8] focus:ring-1 focus:ring-[#4F46C8]/30 transition`

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
              <PlusCircle size={20} className="text-[#4F46C8]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Create New Opportunity</h1>
              <p className="text-sm text-gray-500">Fill in the details below to post a new volunteer opportunity.</p>
            </div>
          </div>

          {error && <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded p-3 mb-6"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title <span className="text-red-500">*</span></label>
              <input type="text" className={inputClass('title')} placeholder="e.g., Beach Cleanup Drive" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
              {fieldErrors.title && <p className="text-xs text-red-500 mt-1">{fieldErrors.title}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description <span className="text-red-500">*</span></label>
              <textarea rows={4} className={inputClass('description')} placeholder="Describe what volunteers will do..." value={form.description} onChange={(e) => updateField('description', e.target.value)} />
              {fieldErrors.description && <p className="text-xs text-red-500 mt-1">{fieldErrors.description}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select className={`${inputClass('category_id')} appearance-none`} value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {fieldErrors.category_id && <p className="text-xs text-red-500 mt-1">{fieldErrors.category_id}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Task Type</label>
              <select className={`${inputClass('task_type')} appearance-none`} value={form.task_type} onChange={(e) => updateField('task_type', e.target.value)}>
                <option value="one_time">One-Time</option>
                <option value="ongoing">Ongoing</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
              <input type="text" className={inputClass('location')} placeholder="e.g., Main Street Park" value={form.location} onChange={(e) => updateField('location', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
              <input type="text" className={inputClass('city')} placeholder="e.g., Kathmandu" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Latitude</label>
              <input type="text" className={inputClass('latitude')} placeholder="e.g., 27.7172" value={form.latitude} onChange={(e) => updateField('latitude', e.target.value)} />
              {fieldErrors.latitude && <p className="text-xs text-red-500 mt-1">{fieldErrors.latitude}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Longitude</label>
              <input type="text" className={inputClass('longitude')} placeholder="e.g., 85.3240" value={form.longitude} onChange={(e) => updateField('longitude', e.target.value)} />
              {fieldErrors.longitude && <p className="text-xs text-red-500 mt-1">{fieldErrors.longitude}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Required Volunteers <span className="text-red-500">*</span></label>
              <input type="number" min="1" className={inputClass('required_volunteers')} value={form.required_volunteers} onChange={(e) => updateField('required_volunteers', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Urgency Level</label>
              <select className={`${inputClass('urgency_level')} appearance-none`} value={form.urgency_level} onChange={(e) => updateField('urgency_level', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date <span className="text-red-500">*</span></label>
              <input type="date" className={inputClass('start_date')} value={form.start_date} onChange={(e) => updateField('start_date', e.target.value)} />
              {fieldErrors.start_date && <p className="text-xs text-red-500 mt-1">{fieldErrors.start_date}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <input type="date" className={inputClass('end_date')} value={form.end_date} onChange={(e) => updateField('end_date', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Application Deadline</label>
              <input type="date" className={inputClass('application_deadline')} value={form.application_deadline} onChange={(e) => updateField('application_deadline', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Selection Logic</label>
              <select className={`${inputClass('selection_logic')} appearance-none`} value={form.selection_logic} onChange={(e) => updateField('selection_logic', e.target.value)}>
                <option value="manual">Manual Review</option>
                <option value="auto_accept">Auto Accept</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <button key={s.id} type="button" onClick={() => toggleSkill(s.id)} className={`text-xs px-3 py-1.5 rounded-full border transition ${form.skills.includes(s.id) ? 'bg-[#4F46C8] text-white border-[#4F46C8]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#4F46C8]'}`}>
                  {s.name}
                </button>
              ))}
              {skills.length === 0 && <p className="text-xs text-gray-400">Loading skills...</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => handleSubmit('draft')} disabled={submitting} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-60">
              Save as Draft
            </button>
            <button onClick={() => handleSubmit('open')} disabled={submitting} className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#4F46C8] hover:bg-[#4338CA] transition disabled:opacity-60">
              {submitting ? 'Publishing...' : 'Publish Now'}
              <PlusCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
