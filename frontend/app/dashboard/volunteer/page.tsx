'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Calendar, CheckCircle, Clock, Star,
  FileText, TrendingUp, Activity, ArrowRight,
  AlertCircle, PlusCircle, UserCheck,
  MapPin, Upload, Link as LinkIcon
} from 'lucide-react'

// ── MOCK DATA (replace with API calls) ──
const mockVolunteer = {
  id: 1,
  name: 'Sara Patel',
  email: 'sara@example.com',
  city: 'Kathmandu',
  country: 'Nepal',
  verificationStatus: 'approved', // 'pending' | 'approved' | 'rejected'
  availability: 'available',       // 'available' | 'busy' | 'unavailable'
  skills: ['First Aid', 'Search & Rescue', 'Psychosocial', 'Translator'],
  bio: 'Emergency medical responder with 5+ years of field experience.',
  profileCompletion: 85,
}

const mockStats = {
  totalApplications: 47,
  acceptedApplications: 32,
  totalHours: 142,
  averageRating: 4.8,
  pendingApplications: 8,
  upcomingEvents: 3,
}

const mockUpcoming = [
  { id: 1, title: 'Flood relief – Terai', date: '2026-07-05', location: 'Terai', type: 'Emergency' },
  { id: 2, title: 'Medical camp – Kathmandu', date: '2026-07-12', location: 'Kathmandu', type: 'Campaign' },
]

const mockRecent = [
  { id: 1, type: 'participation', text: 'Completed flood relief (8 hrs)', date: '2 hours ago', icon: CheckCircle },
  { id: 2, type: 'application', text: 'Applied to "Earthquake aftershock"', date: '1 day ago', icon: FileText },
  { id: 3, type: 'notification', text: 'Your document "Citizenship" was approved', date: '3 days ago', icon: Activity },
]

const mockPendingApps = [
  { id: 1, title: 'Earthquake aftershock – Gorkha', days: 2 },
  { id: 2, title: 'Blood donation camp – Lalitpur', days: 5 },
]

// ── MAIN COMPONENT ──
export default function VolunteerDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState(mockStats)
  const [animatedStats, setAnimatedStats] = useState({
    applications: 0,
    accepted: 0,
    hours: 0,
    rating: 0,
  })

  // ── Animate counters on mount ──
  useEffect(() => {
    const duration = 1500
    const start = performance.now()
    const targets = {
      applications: stats.totalApplications,
      accepted: stats.acceptedApplications,
      hours: stats.totalHours,
      rating: stats.averageRating,
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
  }, [stats])

  // ── Example: fetch real data from API ──
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await fetch('/api/volunteer/dashboard')
  //     const data = await res.json()
  //     setStats(data.stats)
  //     setMockVolunteer(data.profile)
  //     // ... update other states
  //   }
  //   fetchData()
  // }, [])

  // ── Helpers ──
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAvailabilityDot = (avail: string) => {
    switch (avail) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'unavailable': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  // ── Functional handlers ──
  const handleFindOpportunities = () => router.push('/opportunities')
  const handleViewAllUpcoming = () => router.push('/opportunities/upcoming')
  const handleViewAllActivity = () => router.push('/activity')
  const handleViewAllApplications = () => router.push('/applications')
  const handleCompleteProfile = () => router.push('/profile/edit')
  const handleUploadDocument = () => router.push('/documents/upload')
  const handleShareProfile = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/volunteer/${mockVolunteer.id}`)
    alert('Profile link copied to clipboard!')
  }
  const handleDetails = (id: number) => router.push(`/opportunities/${id}`)

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER (no notifications/settings) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4F46C8] to-[#7683D6] flex items-center justify-center text-white text-2xl font-bold">
                {mockVolunteer.name.charAt(0)}
              </div>
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getAvailabilityDot(mockVolunteer.availability)}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Welcome back, {mockVolunteer.name.split(' ')[0]}!
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(mockVolunteer.verificationStatus)}`}>
                  {mockVolunteer.verificationStatus === 'approved' ? '✓ Verified' : mockVolunteer.verificationStatus}
                </span>
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin size={14} /> {mockVolunteer.city}, {mockVolunteer.country}
              </p>
            </div>
          </div>
          <button
            onClick={handleFindOpportunities}
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
            sub={`${stats.pendingApplications} pending`}
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
            sub="from 23 reviews"
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
                  onClick={handleViewAllUpcoming}
                  className="text-sm font-semibold text-[#4F46C8] hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {mockUpcoming.map((item) => (
                  <div key={item.id} className="bg-white border border-black/5 rounded-xl p-4 flex flex-wrap items-center justify-between shadow-sm">
                    <div>
                      <p className="font-semibold text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                        <MapPin size={14} /> {item.location}
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{item.type}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-400">{item.date}</p>
                      <button
                        onClick={() => handleDetails(item.id)}
                        className="bg-[#4F46C8]/10 text-[#4F46C8] text-sm font-medium px-3 py-1 rounded-lg hover:bg-[#4F46C8]/20 transition"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={20} className="text-[#4F46C8]" /> Recent Activity
                </h2>
                <button
                  onClick={handleViewAllActivity}
                  className="text-sm font-semibold text-[#4F46C8] hover:underline flex items-center gap-1"
                >
                  See all <ArrowRight size={14} />
                </button>
              </div>
              <div className="bg-white border border-black/5 rounded-xl divide-y divide-black/5 shadow-sm">
                {mockRecent.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <item.icon size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{item.text}</p>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                  <span className="text-xs font-semibold text-gray-600">{mockVolunteer.profileCompletion}%</span>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                  <div
                    style={{ width: `${mockVolunteer.profileCompletion}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#4F46C8] to-[#7683D6]"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" /> Basic info filled
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" /> Skills added (5)
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-yellow-500" /> Documents pending (2)
                </div>
                <button
                  onClick={handleCompleteProfile}
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
                  {stats.pendingApplications}
                </span>
              </h3>
              <div className="space-y-3">
                {mockPendingApps.map((app) => (
                  <div key={app.id} className="border-l-2 border-amber-400 pl-3 py-1">
                    <p className="text-sm font-medium text-gray-800">{app.title}</p>
                    <p className="text-xs text-gray-400">Pending for {app.days} days</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleViewAllApplications}
                className="mt-4 w-full text-center text-sm font-medium text-[#4F46C8] hover:underline"
              >
                View all applications
              </button>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-2">
              <button
                onClick={handleUploadDocument}
                className="flex flex-col items-center justify-center bg-white border border-black/5 rounded-xl p-3 shadow-sm hover:shadow-md transition"
              >
                <Upload size={18} className="text-[#4F46C8] mb-1" />
                <span className="text-xs font-medium text-gray-700">Upload Document</span>
              </button>
              <button
                onClick={handleShareProfile}
                className="flex flex-col items-center justify-center bg-white border border-black/5 rounded-xl p-3 shadow-sm hover:shadow-md transition"
              >
                <LinkIcon size={18} className="text-[#4F46C8] mb-1" />
                <span className="text-xs font-medium text-gray-700">Share Profile</span>
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── STAT CARD COMPONENT ──
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