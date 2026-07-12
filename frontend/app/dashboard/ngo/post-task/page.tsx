'use client'

import { useState } from 'react'
import {
  FileText,
  AlignLeft,
  Layers,
  MapPin,
  Users,
  CalendarDays,
  AlertTriangle,
  Rocket,
  Loader2,
  Check,
} from 'lucide-react'

const skillOptions = [
  'First Aid',
  'Teaching',
  'Communication',
  'Driving',
  'Medical Support',
  'Counseling',
  'Rescue Support',
  'Data Entry',
]

const urgencyConfig = {
  low: {
    label: 'Low',
    activeText: 'text-[#4F46C8]',
    activeBorder: 'border-[#4F46C8]',
    activeBg: 'bg-[#4F46C8]/5',
    dot: 'bg-[#4F46C8]',
  },
  medium: {
    label: 'Medium',
    activeText: 'text-[#7683D6]',
    activeBorder: 'border-[#7683D6]',
    activeBg: 'bg-[#7683D6]/5',
    dot: 'bg-[#7683D6]',
  },
  high: {
    label: 'High',
    activeText: 'text-[#B9455E]',
    activeBorder: 'border-[#B9455E]',
    activeBg: 'bg-[#B9455E]/5',
    dot: 'bg-[#B9455E]',
  },
}

export default function CreateTaskPage() {
  const [loading, setLoading] = useState(false)
  const [posted, setPosted] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Emergency')
  const [location, setLocation] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [quota, setQuota] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [urgency, setUrgency] = useState('Low')

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !location || !quota) {
      alert('Please fill all required fields!')
      return
    }

    setLoading(true)

    // ✅ SCHEMA-ALIGNED OBJECT MATCHING BACKEND DEFINITION
    const newTask = {
      // BIGINT PK
      id: Date.now(),

      // FK
      ngo_profile_id: null,
      created_by: null,

      // VARCHAR
      title,
      slug: title.toLowerCase().trim().replace(/\s+/g, '-'),

      // LONGTEXT
      description,

      // ENUM(event, campaign, emergency, task)
      type: category.toLowerCase() as 'event' | 'campaign' | 'emergency' | 'task',

      // VARCHAR NULL
      location: location || null,

      // DATETIME
      start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,

      // INTEGER DEFAULT 1
      volunteers_needed: Number(quota) || 1,

      // ENUM(draft, open, ongoing, completed, cancelled) DEFAULT draft
      status: 'open' as 'draft' | 'open' | 'ongoing' | 'completed' | 'cancelled',

      // ENUM(low, medium, high) DEFAULT low
      urgency_level: urgency.toLowerCase().replace(' 🚨', '') as 'low' | 'medium' | 'high',

      // VARCHAR NULL (placeholder for future upload API)
      cover_image: null,

      // TIMESTAMPS
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }

    const existing = JSON.parse(localStorage.getItem('ngo_tasks') || '[]')
    localStorage.setItem('ngo_tasks', JSON.stringify([newTask, ...existing]))

    // reset (unchanged UI logic)
    setTitle('')
    setDescription('')
    setCategory('Emergency')
    setLocation('')
    setSelectedSkills([])
    setQuota('')
    setStartDate('')
    setEndDate('')
    setUrgency('Low')

    setLoading(false)

    setPosted(true)
    setTimeout(() => setPosted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] flex justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">
            Create Volunteer Task
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Post a task and it will appear in the volunteer feed instantly.
          </p>
        </div>

        {/* Success banner */}
        {posted && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#CACDD3] bg-white px-4 py-3 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4F46C8]/10">
              <Check className="h-4 w-4 text-[#4F46C8]" strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#111827]">Task posted successfully</p>
              <p className="text-xs text-[#6B7280]">It now appears in the volunteer feed.</p>
            </div>
          </div>
        )}

        <div className="w-full bg-white border border-[#CACDD3] shadow-sm rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#111827] mb-2">
                <FileText className="h-4 w-4 text-[#6B7280]" />
                Task Title
              </label>
              <input
                className="w-full border border-[#CACDD3] p-3 rounded-lg text-[#111827] placeholder:text-[#6B7280] outline-none transition focus:border-[#4F46C8] focus:ring-2 focus:ring-[#4F46C8]/20"
                placeholder="e.g. Flood relief distribution — Sunsari"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#111827] mb-2">
                <AlignLeft className="h-4 w-4 text-[#6B7280]" />
                Task Description
              </label>
              <textarea
                className="w-full border border-[#CACDD3] p-3 rounded-lg text-[#111827] placeholder:text-[#6B7280] outline-none transition resize-none focus:border-[#4F46C8] focus:ring-2 focus:ring-[#4F46C8]/20"
                placeholder="Describe what volunteers will be doing and what to expect"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#111827] mb-2">
                  <Layers className="h-4 w-4 text-[#6B7280]" />
                  Category
                </label>
                <select
                  className="w-full border border-[#CACDD3] p-3 rounded-lg text-[#111827] outline-none transition focus:border-[#4F46C8] focus:ring-2 focus:ring-[#4F46C8]/20 bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Emergency</option>
                  <option>Campaign</option>
                  <option>Event</option>
                  <option>Task</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#111827] mb-2">
                  <MapPin className="h-4 w-4 text-[#6B7280]" />
                  City / District
                </label>
                <input
                  className="w-full border border-[#CACDD3] p-3 rounded-lg text-[#111827] placeholder:text-[#6B7280] outline-none transition focus:border-[#4F46C8] focus:ring-2 focus:ring-[#4F46C8]/20"
                  placeholder="e.g. Kathmandu"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm font-medium text-[#111827] mb-2 block">
                Skills Needed
              </label>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-dashed border-[#CACDD3] bg-[#F0F1F3]/60">
                {skillOptions.map((skill) => {
                  const active = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${
                        active
                          ? 'bg-[#4F46C8] text-white border-[#4F46C8] shadow-sm'
                          : 'bg-white text-[#111827] border-[#CACDD3] hover:border-[#7683D6]'
                      }`}
                    >
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Volunteers Needed */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#111827] mb-2">
                <Users className="h-4 w-4 text-[#6B7280]" />
                Volunteers Needed
              </label>
              <input
                type="number"
                min={1}
                className="w-full border border-[#CACDD3] p-3 rounded-lg text-[#111827] placeholder:text-[#6B7280] outline-none transition focus:border-[#4F46C8] focus:ring-2 focus:ring-[#4F46C8]/20"
                placeholder="e.g. 10"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#111827] mb-2">
                <CalendarDays className="h-4 w-4 text-[#6B7280]" />
                Duration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[#6B7280] mb-1 block">Start date</span>
                  <input
                    type="date"
                    className="w-full border border-[#CACDD3] p-3 rounded-lg text-[#111827] outline-none transition focus:border-[#4F46C8] focus:ring-2 focus:ring-[#4F46C8]/20"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] mb-1 block">End date</span>
                  <input
                    type="date"
                    className="w-full border border-[#CACDD3] p-3 rounded-lg text-[#111827] outline-none transition focus:border-[#4F46C8] focus:ring-2 focus:ring-[#4F46C8]/20"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#111827] mb-2">
                <AlertTriangle className="h-4 w-4 text-[#6B7280]" />
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['low', 'medium', 'high'] as const).map((level) => {
                  const cfg = urgencyConfig[level]
                  const active = urgency.toLowerCase() === level
                  return (
                    <label
                      key={level}
                      className={`flex items-center justify-center gap-2 cursor-pointer rounded-lg border p-3 text-sm font-medium transition ${
                        active
                          ? `${cfg.activeBorder} ${cfg.activeBg} ${cfg.activeText}`
                          : 'border-[#CACDD3] text-[#6B7280] hover:border-[#7683D6]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level}
                        checked={active}
                        onChange={(e) => setUrgency(e.target.value)}
                        className="sr-only"
                      />
                      <span className={`h-2 w-2 rounded-full ${active ? cfg.dot : 'bg-[#CACDD3]'}`} />
                      {cfg.label}
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#4F46C8] hover:bg-[#4F46C8]/90 disabled:opacity-70 text-white py-3 rounded-lg font-semibold transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Post Task
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}