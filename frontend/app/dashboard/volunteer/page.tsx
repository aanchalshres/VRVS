'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet } from '@/app/lib/api'
import {
  User, Calendar, CheckCircle, Clock, Star,
  FileText, TrendingUp, Activity, ArrowRight,
  AlertCircle, PlusCircle, UserCheck,
  MapPin, Upload, Link as LinkIcon
} from 'lucide-react'

interface DashboardData {
  profile: {
    name: string
    email: string
    city: string | null
    country: string | null
    availability: string | null
    skills: string[]
    bio: string | null
    profile_photo: string | null
  }
  stats: {
    total_applications: number
    accepted_applications: number
    pending_applications: number
    total_service_hours: number
    average_rating: number
    total_reviews: number
  }
  profile_completion: number
  document_status: string
  upcoming_tasks: {
    id: number
    title: string
    ngo: string
    location: string | null
    status: string
    date: string
  }[]
  recent_activity: {
    type: string
    text: string
    date: string
  }[]
  pending_applications_list: {
    id: number
    title: string
    days: number
  }[]
}

export default function VolunteerDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animatedStats, setAnimatedStats] = useState({
    applications: 0,
    accepted: 0,
    hours: 0,
    rating: 0,
  })

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await apiGet<{ data: DashboardData }>('/volunteer/dashboard')
        setData(res.data)
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.')
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
      applications: data.stats.total_applications,
      accepted: data.stats.accepted_applications,
      hours: data.stats.total_service_hours,
      rating: data.stats.average_rating,
    }

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setAnimatedStats({
        applications: Math.floor(eased * targets.applications),
        accepted: Math.floor(eased * targets.accepted),
        hours: Math.floor(eased * targets.hours),
        rating: +(eased * targets.rating).toFixed(1),
      })
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [data])

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAvailabilityDot = (avail: string | null) => {
    switch (avail) {
      case 'Available': return 'bg-green-500'
      case 'Busy': return 'bg-yellow-500'
      case 'Unavailable': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getVerificationLabel = (status: string) => {
    if (status === 'verified') return '✓ Verified'
    if (status === 'rejected') return '✗ Rejected'
    if (status === 'pending') return 'Pending'
    return 'Not uploaded'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-medium mb-1">Failed to load dashboard</p>
          <p className="text-sm text-[#6B7280]">{error || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#4F46C8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] transition"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const { profile, stats, upcoming_tasks, recent_activity, pending_applications_list } = data

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4F46C8] to-[#7683D6] flex items-center justify-center text-white text-2xl font-bold">
                {profile.name?.charAt(0) || 'V'}
              </div>
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getAvailabilityDot(profile.availability)}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Welcome back, {profile.name?.split(' ')[0] || 'Volunteer'}!
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(data.document_status)}`}>
                  {getVerificationLabel(data.document_status)}
                </span>
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin size={14} /> {profile.city || 'Location not set'}{profile.country ? `, ${profile.country}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/volunteer/tasks')}
            className="flex items-center gap-2 bg-[#4F46C8] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#4338CA] transition"
          >
            <PlusCircle size={16} /> Find Opportunities
          </button>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FileText}
            label="Applications"
            value={animatedStats.applications}
            sub={`${stats.pending_applications} pending`}
            color="text-[#4F46C8]"
            bg="bg-[#EEF0FF]"
          />
          <StatCard
            icon={UserCheck}
            label="Accepted"
            value={animatedStats.accepted}
            sub="by NGOs"
            color="text-green-700"
            bg="bg-green-50"
          />
          <StatCard
            icon={Clock}
            label="Hours contributed"
            value={animatedStats.hours}
            sub="lifetime"
            color="text-amber-700"
            bg="bg-amber-50"
          />
          <StatCard
            icon={Star}
            label="Avg. rating"
            value={animatedStats.rating}
            sub={`from ${stats.total_reviews} reviews`}
            color="text-rose-700"
            bg="bg-rose-50"
          />
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: Main content (2 cols) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Upcoming Opportunities */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={20} className="text-[#4F46C8]" /> Upcoming Opportunities
                </h2>
                <button
                  onClick={() => router.push('/dashboard/volunteer/tasks')}
                  className="text-sm font-semibold text-[#4F46C8] hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>
              {upcoming_tasks.length === 0 ? (
                <div className="bg-white border border-black/5 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-[#6B7280]">No upcoming tasks yet. Browse available tasks to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming_tasks.map((item) => (
                    <div key={item.id} className="bg-white border border-black/5 rounded-xl p-4 flex flex-wrap items-center justify-between shadow-sm">
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                          <MapPin size={14} /> {item.location || 'Location not specified'}
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{item.ngo}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-400">{item.date || 'Date TBD'}</p>
                        <button
                          onClick={() => router.push(`/dashboard/volunteer/tasks`)}
                          className="bg-[#4F46C8]/10 text-[#4F46C8] text-sm font-medium px-3 py-1 rounded-lg hover:bg-[#4F46C8]/20 transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={20} className="text-[#4F46C8]" /> Recent Activity
                </h2>
              </div>
              {recent_activity.length === 0 ? (
                <div className="bg-white border border-black/5 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-[#6B7280]">No recent activity. Start by applying to a task!</p>
                </div>
              ) : (
                <div className="bg-white border border-black/5 rounded-xl divide-y divide-black/5 shadow-sm">
                  {recent_activity.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {item.type === 'application' ? (
                          <FileText size={16} className="text-gray-600" />
                        ) : (
                          <CheckCircle size={16} className="text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.text}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-8">

            {/* Profile Completion */}
            <section className="bg-white border border-black/5 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[#4F46C8]" /> Profile Strength
              </h3>
              <div className="relative pt-1">
                <div className="flex mb-1 items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">{data.profile_completion}%</span>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                  <div
                    style={{ width: `${data.profile_completion}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#4F46C8] to-[#7683D6]"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" /> Basic info {profile.bio ? 'filled' : 'pending'}
                </div>
                <div className="flex items-center gap-2">
                  {profile.skills.length > 0 ? (
                    <><CheckCircle size={14} className="text-green-500" /> Skills added ({profile.skills.length})</>
                  ) : (
                    <><AlertCircle size={14} className="text-yellow-500" /> No skills added</>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {data.document_status === 'none' ? (
                    <><AlertCircle size={14} className="text-yellow-500" /> No documents uploaded</>
                  ) : data.document_status === 'verified' ? (
                    <><CheckCircle size={14} className="text-green-500" /> Documents verified</>
                  ) : data.document_status === 'rejected' ? (
                    <><AlertCircle size={14} className="text-red-500" /> Documents rejected</>
                  ) : (
                    <><AlertCircle size={14} className="text-yellow-500" /> Documents pending</>
                  )}
                </div>
                <button
                  onClick={() => router.push('/dashboard/volunteer/profile')}
                  className="mt-3 w-full text-center text-sm font-medium text-[#4F46C8] bg-[#EEF0FF] px-3 py-1.5 rounded-lg hover:bg-[#E0E5FF] transition"
                >
                  Complete your profile
                </button>
              </div>
            </section>

            {/* Pending Applications */}
            <section className="bg-white border border-black/5 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Clock size={16} className="text-amber-500" /> Pending Applications
                <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {stats.pending_applications}
                </span>
              </h3>
              {pending_applications_list.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No pending applications.</p>
              ) : (
                <div className="space-y-3">
                  {pending_applications_list.map((app) => (
                    <div key={app.id} className="border-l-2 border-amber-400 pl-3 py-1">
                      <p className="text-sm font-medium text-gray-800">{app.title}</p>
                      <p className="text-xs text-gray-400">Pending for {app.days} days</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => router.push('/dashboard/volunteer/applications')}
                className="mt-4 w-full text-center text-sm font-medium text-[#4F46C8] hover:underline"
              >
                View all applications
              </button>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-2">
              <button
                onClick={() => router.push('/dashboard/volunteer/skills')}
                className="flex flex-col items-center justify-center bg-white border border-black/5 rounded-xl p-3 shadow-sm hover:shadow-md transition"
              >
                <Upload size={18} className="text-[#4F46C8] mb-1" />
                <span className="text-xs font-medium text-gray-700">Upload Document</span>
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
