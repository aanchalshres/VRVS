'use client'
import { useEffect, useState } from 'react'
import { apiGet } from '@/app/lib/api'
import {
  BarChart3, Users, FileText, Clock, CheckCircle2, XCircle,
  Activity, Briefcase, TrendingUp
} from 'lucide-react'

interface ReportData {
  overview: {
    total_volunteers_served: number
    active_volunteers: number
    total_applications: number
    accepted_applications: number
    rejected_applications: number
    cancelled_applications: number
    active_opportunities: number
    completed_opportunities: number
    total_hours: number
  }
  monthly_stats: {
    month: string
    total: number
    accepted: number
    rejected: number
    pending: number
  }[]
  opportunity_stats: {
    id: number
    title: string
    status: string
    category: string | null
    required_volunteers: number
    total_applications: number
    accepted_applications: number
    pending_applications: number
  }[]
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiGet<{ data: ReportData }>('/api/ngo/reports')
        setData(res.data)
      } catch (err: any) {
        setError(err.message || 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>
  }

  if (!data) return null

  const { overview, monthly_stats, opportunity_stats } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-[#6B7280]">Overview of your organization's impact</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Volunteers Served" value={overview.total_volunteers_served} color="text-[#4F46C8]" bg="bg-[#EEF0FF]" />
        <StatCard icon={Activity} label="Active Volunteers" value={overview.active_volunteers} color="text-green-700" bg="bg-green-50" />
        <StatCard icon={FileText} label="Total Applications" value={overview.total_applications} color="text-blue-700" bg="bg-blue-50" />
        <StatCard icon={CheckCircle2} label="Accepted" value={overview.accepted_applications} color="text-green-700" bg="bg-green-50" />
        <StatCard icon={XCircle} label="Rejected" value={overview.rejected_applications} color="text-red-700" bg="bg-red-50" />
        <StatCard icon={Briefcase} label="Active Opps" value={overview.active_opportunities} color="text-[#4F46C8]" bg="bg-[#EEF0FF]" />
        <StatCard icon={CheckCircle2} label="Completed Opps" value={overview.completed_opportunities} color="text-purple-700" bg="bg-purple-50" />
        <StatCard icon={Clock} label="Total Hours" value={overview.total_hours} color="text-amber-700" bg="bg-amber-50" />
      </div>

      {monthly_stats.length > 0 && (
        <div className="bg-white border border-black/5 rounded-xl p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#4F46C8]" /> Monthly Application Trends
          </h2>
          <div className="space-y-2">
            {monthly_stats.map((m) => {
              const total = m.total || 1
              const acceptPct = Math.round((m.accepted / total) * 100)
              const rejectPct = Math.round((m.rejected / total) * 100)
              const pendingPct = Math.round((m.pending / total) * 100)
              return (
                <div key={m.month} className="text-sm">
                  <div className="flex justify-between text-[#6B7280] mb-1">
                    <span className="font-medium">{m.month}</span>
                    <span>{m.total} applications</span>
                  </div>
                  <div className="flex h-5 rounded-full overflow-hidden bg-gray-100">
                    <div style={{ width: `${acceptPct}%` }} className="bg-green-500 transition-all" title={`Accepted: ${m.accepted}`} />
                    <div style={{ width: `${rejectPct}%` }} className="bg-red-400 transition-all" title={`Rejected: ${m.rejected}`} />
                    <div style={{ width: `${pendingPct}%` }} className="bg-amber-400 transition-all" title={`Pending: ${m.pending}`} />
                  </div>
                  <div className="flex gap-3 text-xs text-[#6B7280] mt-0.5">
                    <span>✓ {m.accepted} accepted</span>
                    <span>✗ {m.rejected} rejected</span>
                    <span>○ {m.pending} pending</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-white border border-black/5 rounded-xl p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase size={16} className="text-[#4F46C8]" /> Opportunity Breakdown
        </h2>
        <div className="space-y-2">
          {opportunity_stats.length === 0 && (
            <p className="text-sm text-[#6B7280]">No opportunities yet.</p>
          )}
          {opportunity_stats.map((o) => (
            <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{o.title}</p>
                <p className="text-xs text-[#6B7280]">{o.category || 'No category'} • {o.status}</p>
              </div>
              <div className="flex gap-4 text-xs text-[#6B7280] shrink-0">
                <span>{o.total_applications} apps</span>
                <span className="text-green-600">{o.accepted_applications} accepted</span>
                <span className="text-amber-600">{o.pending_applications} pending</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
        <Icon size={16} className={color} />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-[#6B7280]">{label}</p>
    </div>
  )
}
