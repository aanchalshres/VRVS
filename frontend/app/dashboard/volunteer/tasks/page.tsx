'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VolunteerTasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('ngo_tasks') || '[]')
    setTasks(data)
  }, [])

  const handleApply = (task: any) => {
    // store selected task for apply page
    localStorage.setItem('selectedTask', JSON.stringify(task))
    router.push(`/dashboard/volunteer/apply/${task.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <h1 className="text-2xl font-bold text-[#4F46C8] mb-6">
        Volunteer Task Feed
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks available</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">

          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-5 rounded-xl shadow border"
            >
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {task.description}
              </p>

              <div className="mt-3 text-sm space-y-1">
                <p>📍 {task.location}</p>
                <p>👥 {task.quota} Volunteers Needed</p>
                <p>🚨 {task.urgency}</p>
                <p>📂 {task.category}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {task.selectedSkills?.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs bg-[#4F46C8] text-white rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleApply(task)}
                className="mt-4 w-full bg-[#4F46C8] text-white py-2 rounded-lg hover:opacity-90"
              >
                Apply Now
              </button>

            </div>
          ))}

        </div>
      )}
    </div>
  )
}