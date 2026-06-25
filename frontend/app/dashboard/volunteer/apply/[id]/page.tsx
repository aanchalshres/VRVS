'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'

export default function ApplyPage() {
  const { id } = useParams()
  const router = useRouter()

  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    availability: '',
    skills: [] as string[],
    location: '',
  })

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  // ✅ LOAD TASK BY ID (FIXED)
  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem('ngo_tasks') || '[]')

    const found = tasks.find((t: any) => t.id == id)

    setTask(found || null)
    setLoading(false)
  }, [id])

  // Location detection
  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords

      setCoords({ lat: latitude, lng: longitude })

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        )

        const data = await res.json()

        const locationName =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.display_name ||
          'Detected location'

        setForm((prev) => ({
          ...prev,
          location: locationName,
        }))
      } catch {}
    })
  }, [])

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

    if (!form.name || !form.email || !form.phone || !form.availability) {
      alert('Please fill all required fields!')
      return
    }

    const applications = JSON.parse(
      localStorage.getItem('applications') || '[]'
    )

    const alreadyApplied = applications.find(
      (a: any) => a.taskId == id && a.email === form.email
    )

    if (alreadyApplied) {
      alert('You already applied!')
      return
    }

    applications.push({
      taskId: id,
      taskTitle: task?.title,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      skills: form.skills,
      availability: form.availability,
      location: form.location,
      coordinates: coords,
      appliedAt: new Date().toISOString(),
    })

    localStorage.setItem('applications', JSON.stringify(applications))

    alert('Application submitted successfully!')

    router.push('/dashboard/volunteer/tasks')
  }

  // LOADING
  if (loading) return <div className="p-6">Loading...</div>

  // NO TASK
  if (!task) {
    return (
      <div className="p-6 text-red-500">
        Task not found. Please go back.
      </div>
    )
  }

  const progress =
    task.quota > 0 ? (task.volunteers / task.quota) * 100 : 0

  return (
    <div className="bg-[#F0F1F3] min-h-screen p-6">

      <div className="max-w-5xl mx-auto space-y-6">

        <button
          onClick={() => router.push('/dashboard/volunteer/tasks')}
          className="text-sm text-[#4F46C8]"
        >
          ← Back
        </button>

        {/* TASK CARD */}
        <div className="bg-white p-6 rounded-xl space-y-4">

          <h1 className="text-xl font-bold">{task.title}</h1>
          <p>{task.description}</p>

          <div className="flex flex-wrap gap-2">
            {task.selectedSkills?.map((skill: string) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>

          <p>📍 {task.location}</p>

          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-indigo-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl space-y-4"
        >

          <input
            placeholder="Name *"
            className="w-full p-2 border rounded"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Email *"
            className="w-full p-2 border rounded"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            placeholder="Phone *"
            className="w-full p-2 border rounded"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <select
            className="w-full p-2 border rounded"
            value={form.availability}
            onChange={(e) =>
              setForm({ ...form, availability: e.target.value })
            }
          >
            <option value="">Select Availability *</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Weekend">Weekend</option>
          </select>

          <textarea
            placeholder="Message"
            className="w-full p-2 border rounded"
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
          />

          {/* SKILLS */}
          <div>
            <p className="text-sm mb-2">Select Skills</p>

            <div className="flex flex-wrap gap-2">
              {task.selectedSkills?.map((skill: string) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full border ${
                    form.skills.includes(skill)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* LOCATION */}
          <input
            className="w-full p-2 border rounded"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
          />

          <Button
            type="submit"
            className="w-full bg-indigo-600 text-white"
          >
            Apply
          </Button>
        </form>

      </div>
    </div>
  )
}