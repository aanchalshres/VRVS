'use client'

import { useState } from 'react'

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

export default function CreateTaskPage() {
  const [loading, setLoading] = useState(false)

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

    // ✅ SCHEMA-ALIGNED OBJECT (ONLY FIX HERE)
    const newTask = {
      // BIGINT PK
      id: Date.now(),

      // FK
      ngo_profile_id: null,
      created_by: null,

      // VARCHAR
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),

      // LONGTEXT
      description,

      // ENUM(event, campaign, emergency, task)
      type: category.toLowerCase(),

      // VARCHAR NULL
      location: location || null,

      // DATETIME
      start_date: startDate || null,
      end_date: endDate || null,

      // INTEGER DEFAULT 1
      volunteers_needed: Number(quota) || 1,

      // ENUM(draft, open, ongoing, completed, cancelled)
      status: 'open',

      // ENUM(low, medium, high)
      urgency_level: urgency.toLowerCase().replace(' 🚨', ''),

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

    alert('Task Posted Successfully 🚀 Appears in Volunteer Feed')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6">

        <h1 className="text-2xl font-bold mb-6 text-[#4F46C8]">
          Create Volunteer Task
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border p-3 rounded-lg"
            placeholder="Task Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full border p-3 rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Emergency</option>
            <option>Campaign</option>
            <option>Event</option>
            <option>Task</option>
          </select>

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="City / District"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  selectedSkills.includes(skill)
                    ? 'bg-[#4F46C8] text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          <input
            type="number"
            className="w-full border p-3 rounded-lg"
            placeholder="Volunteer Needed"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              className="border p-3 rounded-lg"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <input
              type="date"
              className="border p-3 rounded-lg"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            {['low', 'medium', 'high'].map((level) => (
              <label key={level} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="urgency"
                  value={level}
                  checked={urgency.toLowerCase() === level}
                  onChange={(e) => setUrgency(e.target.value)}
                />
                {level}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4F46C8] text-white py-3 rounded-lg font-semibold"
          >
            {loading ? 'Posting...' : 'Post Task'}
          </button>

        </form>
      </div>
    </div>
  )
}