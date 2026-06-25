'use client'

import { useEffect, useState } from 'react'

export default function NGOApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])

  // replace with real logged-in NGO ID later
  const currentNgoId = "ngo_1"

  useEffect(() => {
    const allApplications = JSON.parse(
      localStorage.getItem('applications') || '[]'
    )

    // FILTER ONLY THIS NGO APPLICATIONS ⭐
    const ngoApps = allApplications.filter(
      (app: any) => app.ngoId === currentNgoId
    )

    setApplications(ngoApps)
  }, [])

  // UPDATE STATUS (ACCEPT / REJECT)
  const updateStatus = (index: number, status: string) => {
    const all = JSON.parse(localStorage.getItem('applications') || '[]')

    const updated = all.map((app: any) => {
      if (app.taskId === applications[index].taskId && app.email === applications[index].email) {
        return { ...app, status }
      }
      return app
    })

    localStorage.setItem('applications', JSON.stringify(updated))

    // refresh UI
    const refreshed = updated.filter(
      (app: any) => app.ngoId === currentNgoId
    )

    setApplications(refreshed)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-2xl font-bold mb-4 text-[#4F46C8]">
        NGO Applications
      </h1>

      {applications.length === 0 ? (
        <p className="text-gray-500">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow border"
            >
              <h2 className="font-bold text-lg">{app.taskTitle}</h2>

              <p><b>Name:</b> {app.name}</p>
              <p><b>Email:</b> {app.email}</p>
              <p><b>Phone:</b> {app.phone}</p>
              <p><b>Location:</b> {app.location}</p>

              <p className="mt-2 text-sm text-gray-600">
                Skills: {app.skills?.join(', ')}
              </p>

              <p className="mt-1">
                Status:
                <span className={`ml-2 font-semibold ${
                  app.status === "pending"
                    ? "text-yellow-500"
                    : app.status === "accepted"
                    ? "text-green-600"
                    : "text-red-500"
                }`}>
                  {app.status || "pending"}
                </span>
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => updateStatus(index, "accepted")}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Accept
                </button>

                <button
                  onClick={() => updateStatus(index, "rejected")}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}