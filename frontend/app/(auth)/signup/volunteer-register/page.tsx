'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VolunteerRegister() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    citizenshipNo: '',
    skills: [] as string[],
    availability: 'Part-time',
  })

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

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const volunteer = {
      id: Date.now(),
      ...form,

      role: 'volunteer',

      trust_score: 0,
      verification_level: 'basic',
      isVerified: false,

      completed_tasks: 0,
      attendance_rate: 0,

      createdAt: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem('volunteers') || '[]')
    localStorage.setItem(
      'volunteers',
      JSON.stringify([volunteer, ...existing])
    )

    alert('Volunteer Registered Successfully 🚀')
    router.push('/volunteer/tasks')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow">

        <h1 className="text-xl font-bold text-[#4F46C8]">
          Volunteer Registration
        </h1>

        <input placeholder="Name" className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input placeholder="Email" className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <input placeholder="Phone" className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <input placeholder="Password" type="password" className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <input placeholder="Location" className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, location: e.target.value })} />

        <input placeholder="Citizenship No" className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, citizenshipNo: e.target.value })} />

        {/* SKILLS */}
        <div>
          <p className="text-sm font-medium mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => (
              <button
                type="button"
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  form.skills.includes(skill)
                    ? 'bg-[#4F46C8] text-white'
                    : ''
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full bg-[#4F46C8] text-white py-2 rounded">
          Register Volunteer
        </button>
      </form>
    </div>
  )
}