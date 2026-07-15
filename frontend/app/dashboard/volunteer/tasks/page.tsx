'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Users,
  AlertTriangle,
  Layers,
  Inbox,
  Send,
} from 'lucide-react'

const urgencyStyles: Record<string, { text: string; bg: string; dot: string }> = {
  low: { text: 'text-[#4F46C8]', bg: 'bg-[#4F46C8]/10', dot: 'bg-[#4F46C8]' },
  medium: { text: 'text-[#B45309]', bg: 'bg-[#B45309]/10', dot: 'bg-[#B45309]' },
  high: { text: 'text-[#B91C1C]', bg: 'bg-[#B91C1C]/10', dot: 'bg-[#B91C1C]' },
}

export default function VolunteerTasksPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [tasks, setTasks]         = useState<VolunteerTask[]>([])
  const [loading, setLoading]     = useState(true)
  const [applying, setApplying]   = useState<number | null>(null)
  const [search, setSearch]       = useState('')
  const [district, setDistrict]   = useState('all')
  const [toast, setToast]         = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Unique districts for filter dropdown
  const districts = ['all', ...Array.from(new Set(tasks.map(t => t.district).filter(Boolean)))]

  // ── Fetch tasks from backend ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await apiGet<{ data: VolunteerTask[] }>('/volunteer/tasks')
        // API returns tasks already sorted by match_score DESC
        setTasks(res.data ?? [])
      } catch (err: any) {
        console.error('Failed to load tasks:', err)
        setToast({ message: 'Could not load tasks. Please try again.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleApply = (task: any) => {
    // 1. Create the schema-aligned opportunity application object
    const newApplication = {
      // BIGINT PK
      id: Date.now(),

      // BIGINT FK -> opportunities.id (maps to the selected task id)
      opportunity_id: task.id,

      // BIGINT FK -> volunteer_profiles.id (Placeholder for authorized user profile)
      volunteer_profile_id: null, 

      // ENUM(pending, approved, rejected, withdrawn) DEFAULT pending
      status: 'pending' as 'pending' | 'approved' | 'rejected' | 'withdrawn',

      // TIMESTAMP
      applied_at: new Date().toISOString(),

      // BIGINT NULL FK -> users.id (NGO reviewer - initially null)
      reviewed_by: null,

      // TIMESTAMP NULL
      reviewed_at: null,

      // TEXT NULL
      remarks: null,

      // TIMESTAMPS
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 2. Save application record to database (localStorage simulated)
    const existingApplications = JSON.parse(localStorage.getItem('opportunity_applications') || '[]')
    localStorage.setItem(
      'opportunity_applications', 
      JSON.stringify([newApplication, ...existingApplications])
    )

    // 3. Store selected task details for display UI on the next page
    localStorage.setItem('selectedTask', JSON.stringify(task))
    
    // 4. Route user to the application screen
    router.push(`/dashboard/volunteer/apply/${task.id}`)
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">

      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">
            Volunteer Task Feed
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Browse open tasks and apply to the ones that fit you.
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white border border-dashed border-[#CACDD3] rounded-2xl p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#F0F1F3] flex items-center justify-center">
              <Inbox className="h-6 w-6 text-[#6B7280]" />
            </div>
            <p className="text-[#111827] font-semibold">No tasks available</p>
            <p className="text-[#6B7280] text-sm mt-1">Check back soon for new opportunities.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">

            {tasks.map((task) => {
              const urgencyKey = (task.urgency_level || task.urgency || 'low').toLowerCase()
              const urgency = urgencyStyles[urgencyKey] ?? urgencyStyles.low

              return (
                <div
                  key={task.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-[#CACDD3] hover:border-[#7683D6]/60 transition flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-[#111827]">{task.title}</h2>
                    <span
                      className={`inline-flex items-center gap-1.5 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${urgency.bg} ${urgency.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${urgency.dot}`} />
                      {urgencyKey} urgency
                    </span>
                  </div>

                  <p className="text-sm text-[#6B7280] mt-1.5">
                    {task.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-[#111827]">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#6B7280] shrink-0" />
                      {task.location || 'Remote / Online'}
                    </p>
                    {/* 
                      Fallback fields used here since the form creates 'volunteers_needed', 
                      'urgency_level', and 'type' to comply with your backend schema specifications 
                    */}
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#6B7280] shrink-0" />
                      {task.volunteers_needed || task.quota || 1} Volunteers Needed
                    </p>
                    <p className="flex items-center gap-2 capitalize">
                      <Layers className="h-4 w-4 text-[#6B7280] shrink-0" />
                      {task.type || task.category || 'task'}
                    </p>
                  </div>

                  {task.selectedSkills && task.selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {task.selectedSkills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs font-medium bg-[#4F46C8]/10 text-[#4F46C8] rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleApply(task)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#4F46C8] hover:bg-[#4F46C8]/90 text-white py-2.5 rounded-lg transition font-medium"
                  >
                    <Send className="h-4 w-4" />
                    Apply Now
                  </button>

                </div>
              )
            })}

          </div>
        )}
      </div>
    </div>
  )
}