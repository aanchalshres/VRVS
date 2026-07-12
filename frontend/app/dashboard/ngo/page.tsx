'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar, Clock, Star, FileText, TrendingUp, Activity, ArrowRight,
  AlertCircle, PlusCircle, UserCheck, Users, MapPin, Eye, CheckSquare,
  Building2, Award, BarChart3, ClipboardList, UserPlus
} from 'lucide-react'

// ── MOCK DATA (replace with API calls) ──
const mockNgo = {
  id: 1,
  name: 'Sara Patel',
  organizationName: 'Nepal Relief Foundation',
  email: 'sara@example.com',
  logo: '/logos/nrf.png',
  city: 'Kathmandu',
  country: 'Nepal',
  verificationStatus: 'approved', // 'pending' | 'approved' | 'rejected'
  website: 'https://nepalrelief.org',
  description: 'Providing emergency relief and medical aid since 2015.',
}

const mockStats = {
  totalOpportunities: 24,
  activeOpportunities: 8,
  totalVolunteers: 142,
  pendingVerifications: 12,
  averageRating: 4.7,
  totalHours: 1240,
}

const mockUpcoming = [
  { id: 1, title: 'Flood relief – Terai', date: '2026-07-05', location: 'Terai', volunteersNeeded: 15 },
  { id: 2, title: 'Medical camp – Kathmandu', date: '2026-07-12', location: 'Kathmandu', volunteersNeeded: 8 },
]

const mockRecentApplications = [
  { id: 1, volunteer: 'Rajesh Sharma', opportunity: 'Flood relief – Terai', appliedAt: '2 hours ago', status: 'pending' },
  { id: 2, volunteer: 'Anita Thapa', opportunity: 'Medical camp – Kathmandu', appliedAt: '1 day ago', status: 'pending' },
  { id: 3, volunteer: 'Sita Gurung', opportunity: 'Flood relief – Terai', appliedAt: '3 days ago', status: 'pending' },
]

const mockPendingVerifications = [
  { id: 1, volunteer: 'Mohan Rai', skills: 'First Aid, Search & Rescue', appliedAt: '2 days ago' },
  { id: 2, volunteer: 'Krishna Basnet', skills: 'Psychosocial, Translator', appliedAt: '5 days ago' },
]

// ── MAIN COMPONENT ──
export default function NgoDashboard() {
  const router = useRouter()
  const [stats] = useState(mockStats)
  const [animatedStats, setAnimatedStats] = useState({
    opportunities: 0,
    active: 0,
    volunteers: 0,
    pending: 0,
  })

  // ── Animate counters on mount ──
  useEffect(() => {
    const duration = 1500
    const start = performance.now()
    const targets = {
      opportunities: stats.totalOpportunities,
      active: stats.activeOpportunities,
      volunteers: stats.totalVolunteers,
      pending: stats.pendingVerifications,
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
  }, [stats])

  // ── Helpers ──
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // ── Functional handlers ──
  const handleCreateOpportunity = () => router.push('/ngo/opportunities/create')
  const handleViewAllUpcoming = () => router.push('/ngo/opportunities/upcoming')
  const handleViewAllApplications = () => router.push('/ngo/applications')
  const handleViewAllVerifications = () => router.push('/ngo/volunteers/verify')
  const handleManageVolunteers = () => router.push('/ngo/volunteers')
  const handleViewReports = () => router.push('/ngo/reports')
  const handleDetails = (id: number) => router.push(`/ngo/opportunities/${id}`)
  const handleReviewApplication = (id: number) => router.push(`/ngo/applications/${id}`)
  const handleVerifyVolunteer = (id: number) => router.push(`/ngo/volunteers/verify/${id}`)

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4F46C8] to-[#7683D6] flex items-center justify-center text-white text-2xl font-bold">
              {mockNgo.organizationName.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Welcome, {mockNgo.organizationName}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(mockNgo.verificationStatus)}`}>
                  {mockNgo.verificationStatus === 'approved' ? '✓ Verified' : mockNgo.verificationStatus}
                </span>
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin size={14} /> {mockNgo.city}, {mockNgo.country}
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateOpportunity}
            className="flex items-center gap-2 bg-[#4F46C8] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#4338CA] transition"
          >
            <PlusCircle size={16} /> New Opportunity
          </button>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FileText}
            label="Total Opportunities"
            value={animatedStats.opportunities}
            sub={`${stats.activeOpportunities} active`}
            color="text-[#4F46C8]"
            bg="bg-[#EEF0FF]"
          />
          <StatCard
            icon={Users}
            label="Volunteers"
            value={animatedStats.volunteers}
            sub="accepted applications"
            color="text-green-700"
            bg="bg-green-50"
          />
          <StatCard
            icon={Clock}
            label="Pending Verifications"
            value={animatedStats.pending}
            sub="volunteers to review"
            color="text-amber-700"
            bg="bg-amber-50"
          />
          <StatCard
            icon={Star}
            label="Avg. Rating"
            value={stats.averageRating}
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
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Needs {item.volunteersNeeded}</span>
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

            {/* Recent Applications */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ClipboardList size={20} className="text-[#4F46C8]" /> Recent Applications
                </h2>
                <button
                  onClick={handleViewAllApplications}
                  className="text-sm font-semibold text-[#4F46C8] hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>
              <div className="bg-white border border-black/5 rounded-xl divide-y divide-black/5 shadow-sm">
                {mockRecentApplications.map((app) => (
                  <div key={app.id} className="flex items-center gap-4 p-4">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <UserCheck size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{app.volunteer}</p>
                      <p className="text-xs text-gray-500">{app.opportunity} · {app.appliedAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Pending</span>
                      <button
                        onClick={() => handleReviewApplication(app.id)}
                        className="text-sm text-[#4F46C8] hover:underline"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-8">

            {/* Quick Stats */}
            <section className="bg-white border border-black/5 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <BarChart3 size={16} className="text-[#4F46C8]" /> Quick Overview
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="text-gray-600">Total hours contributed</span>
                  <span className="font-bold text-gray-900">{stats.totalHours}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="text-gray-600">Active volunteers</span>
                  <span className="font-bold text-gray-900">{stats.totalVolunteers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Opportunities</span>
                  <span className="font-bold text-gray-900">{stats.totalOpportunities}</span>
                </div>
              </div>
              <button
                onClick={handleViewReports}
                className="mt-4 w-full text-center text-sm font-medium text-[#4F46C8] bg-[#EEF0FF] px-3 py-1.5 rounded-lg hover:bg-[#E0E5FF] transition"
              >
                View full reports
              </button>
            </section>

            {/* Pending Verifications */}
            <section className="bg-white border border-black/5 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <UserCheck size={16} className="text-amber-500" /> Pending Verifications
                <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {stats.pendingVerifications}
                </span>
              </h3>
              <div className="space-y-3">
                {mockPendingVerifications.map((vol) => (
                  <div key={vol.id} className="border-l-2 border-amber-400 pl-3 py-1">
                    <p className="text-sm font-medium text-gray-800">{vol.volunteer}</p>
                    <p className="text-xs text-gray-500">{vol.skills}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Applied {vol.appliedAt}</p>
                    <button
                      onClick={() => handleVerifyVolunteer(vol.id)}
                      className="mt-1 text-xs font-medium text-[#4F46C8] hover:underline"
                    >
                      Review verification
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleViewAllVerifications}
                className="mt-4 w-full text-center text-sm font-medium text-[#4F46C8] hover:underline"
              >
                View all pending
              </button>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCreateOpportunity}
                className="flex flex-col items-center justify-center bg-white border border-black/5 rounded-xl p-3 shadow-sm hover:shadow-md transition"
              >
                <PlusCircle size={18} className="text-[#4F46C8] mb-1" />
                <span className="text-xs font-medium text-gray-700">New Opportunity</span>
              </button>
              <button
                onClick={handleManageVolunteers}
                className="flex flex-col items-center justify-center bg-white border border-black/5 rounded-xl p-3 shadow-sm hover:shadow-md transition"
              >
                <Users size={18} className="text-[#4F46C8] mb-1" />
                <span className="text-xs font-medium text-gray-700">Manage Volunteers</span>
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