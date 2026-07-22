'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar, Clock, Star, FileText, ArrowRight,
  PlusCircle, UserCheck, Users, MapPin,
  Building2, BarChart3, ClipboardList
} from 'lucide-react'
import { apiGet } from '@/app/lib/api'

interface DashboardData {
  ngo: {
    organization_name: string
    city: string | null
    country: string | null
    verification_status: string
    website: string | null
    description: string | null
  }
  stats: {
    total_opportunities: number
    active_opportunities: number
    total_applications: number
    pending_applications: number
    assigned_volunteers: number
    total_hours: number
  }
  profile_completion: number
  upcoming_activities: {
    id: number
    title: string
    location: string | null
    start_date: string
    required_volunteers: number
  }[]
  recent_notifications: {
    id: number
    title: string
    message: string
    type: string
    is_read: boolean
    created_at: string
  }[]
}

export default function NgoDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animatedStats, setAnimatedStats] = useState({
    opportunities: 0,
    active: 0,
    volunteers: 0,
    pending: 0,
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiGet<{ data: DashboardData }>('/api/ngo/dashboard')
        setData(res.data)
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!data) return
    const duration = 1500
    const start = performance.now()
    const targets = {
      opportunities: data.stats.total_opportunities,
      active: data.stats.active_opportunities,
      volunteers: data.stats.assigned_volunteers,
      pending: data.stats.pending_applications,
    }

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedStats({
        opportunities: Math.floor(eased * targets.opportunities),
        active: Math.floor(eased * targets.active),
        volunteers: Math.floor(eased * targets.volunteers),
        pending: Math.floor(eased * targets.pending),
      })
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [data])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center p-8">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <p className="text-red-600 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-sm text-[#6B7280]">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { ngo, stats, upcoming_activities, recent_notifications } = data

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4F46C8] to-[#7683D6] flex items-center justify-center text-white text-2xl font-bold">
              {ngo.organization_name?.charAt(0) || 'N'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Welcome, {ngo.organization_name}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(ngo.verification_status)}`}>
                  {ngo.verification_status === 'verified' ? '✓ Verified' : ngo.verification_status}
                </span>
              </h1>
              {(ngo.city || ngo.country) && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={14} /> {[ngo.city, ngo.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/ngo/post-task')}
            className="flex items-center gap-2 bg-[#4F46C8] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#4338CA] transition"
          >
            <PlusCircle size={16} /> New Opportunity
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} label="Total Opportunities" value={animatedStats.opportunities} sub={`${stats.active_opportunities} active`} color="text-[#4F46C8]" bg="bg-[#EEF0FF]" />
          <StatCard icon={Users} label="Assigned Volunteers" value={animatedStats.volunteers} sub="accepted applications" color="text-green-700" bg="bg-green-50" />
          <StatCard icon={Clock} label="Pending Applications" value={animatedStats.pending} sub="awaiting review" color="text-amber-700" bg="bg-amber-50" />
          <StatCard icon={Star} label="Total Hours" value={stats.total_hours} sub="volunteer hours logged" color="text-rose-700" bg="bg-rose-50" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={20} className="text-[#4F46C8]" /> Upcoming Activities
                </h2>
                <button onClick={() => router.push('/dashboard/ngo/tasks')} className="text-sm font-semibold text-[#4F46C8] hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {upcoming_activities.length === 0 && (
                  <div className="bg-white border border-black/5 rounded-xl p-6 text-center text-sm text-[#6B7280]">
                    No upcoming activities. Create a new opportunity to get started.
                  </div>
                )}
                {upcoming_activities.map((item) => (
                  <div key={item.id} className="bg-white border border-black/5 rounded-xl p-4 flex flex-wrap items-center justify-between shadow-sm">
                    <div>
                      <p className="font-semibold text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                        <MapPin size={14} /> {item.location || 'Location TBD'}
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Needs {item.required_volunteers}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-400">{item.start_date ? new Date(item.start_date).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ClipboardList size={20} className="text-[#4F46C8]" /> Recent Notifications
                </h2>
                <button onClick={() => router.push('/dashboard/ngo/notifications')} className="text-sm font-semibold text-[#4F46C8] hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </button>
              </div>
              <div className="bg-white border border-black/5 rounded-xl divide-y divide-black/5 shadow-sm">
                {recent_notifications.length === 0 && (
                  <div className="p-6 text-center text-sm text-[#6B7280]">No recent notifications.</div>
                )}
                {recent_notifications.map((n) => (
                  <div key={n.id} className="flex items-center gap-4 p-4">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <UserCheck size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.message}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white border border-black/5 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <BarChart3 size={16} className="text-[#4F46C8]" /> Quick Overview
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="text-gray-600">Total hours contributed</span>
                  <span className="font-bold text-gray-900">{stats.total_hours}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="text-gray-600">Active volunteers</span>
                  <span className="font-bold text-gray-900">{stats.assigned_volunteers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile completion</span>
                  <span className="font-bold text-gray-900">{data.profile_completion}%</span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-2">
              <button onClick={() => router.push('/dashboard/ngo/post-task')} className="flex flex-col items-center justify-center bg-white border border-black/5 rounded-xl p-3 shadow-sm hover:shadow-md transition">
                <PlusCircle size={18} className="text-[#4F46C8] mb-1" />
                <span className="text-xs font-medium text-gray-700">New Opportunity</span>
              </button>
              <button onClick={() => router.push('/dashboard/ngo/tasks')} className="flex flex-col items-center justify-center bg-white border border-black/5 rounded-xl p-3 shadow-sm hover:shadow-md transition">
                <FileText size={18} className="text-[#4F46C8] mb-1" />
                <span className="text-xs font-medium text-gray-700">Manage Tasks</span>
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color, bg }: any) {
  return (
    <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={color} />
        </div>
        <div>
          <p className="text-xl font-extrabold text-gray-900 leading-none">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
        </div>
      </div>
    </div>
  )
}
