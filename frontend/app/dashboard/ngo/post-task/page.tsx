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

  // ⭐ SYSTEM FIELD (not entered by NGO, but added here for simplicity)
  const [trustRequired] = useState(60)

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ basic validation
    if (!title || !description || !location || !quota) {
      alert('Please fill all required fields!')
      return
    }

    setLoading(true)

    const newTask = {
      id: Date.now(),

      // NGO INPUT
      title,
      description,
      category,
      location,
      skills: selectedSkills,
      quota: Number(quota),
      startDate,
      endDate,
      urgency,

      // SYSTEM GENERATED ⭐
      trust_required: trustRequired,
      applied_count: 0,
      status: 'open',
      createdAt: new Date().toISOString(),

      // FOR ALGORITHM USE
      matchScore: 0,
    }

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('ngo_tasks') || '[]')
    const updated = [newTask, ...existing]
    localStorage.setItem('ngo_tasks', JSON.stringify(updated))

    // Reset form
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

          {/* TITLE */}
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* DESCRIPTION */}
          <textarea
            className="w-full border p-3 rounded-lg"
            placeholder="Task Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* CATEGORY */}
          <select
            className="w-full border p-3 rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Emergency</option>
            <option>Health</option>
            <option>Education</option>
            <option>Environment</option>
            <option>Social Work</option>
          </select>

          {/* LOCATION */}
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="City / District"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {/* SKILLS */}
          <div>
            <p className="font-medium mb-2">Required Skills</p>

            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    selectedSkills.includes(skill)
                      ? 'bg-[#4F46C8] text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* QUOTA */}
          <input
            type="number"
            className="w-full border p-3 rounded-lg"
            placeholder="Volunteer Quota"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
          />

          {/* DATES */}
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

          {/* URGENCY */}
          <div className="flex gap-4">
            {['Low', 'Medium', 'High 🚨'].map((level) => (
              <label key={level} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="urgency"
                  value={level}
                  checked={urgency === level}
                  onChange={(e) => setUrgency(e.target.value)}
                />
                {level}
              </label>
            ))}
          </div>

          {/* TRUST INFO (READ ONLY UI) */}
          <div className="text-sm text-gray-500">
            Required Trust Score: <b>{trustRequired}%</b>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4F46C8] text-white py-3 rounded-lg font-semibold hover:opacity-90"
          >
            {loading ? 'Posting...' : 'Post Task'}
          </button>

        </form>
      </div>
    </div>
  )
}