"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { StatsCard } from '@/app/components/ui-custom/StatsCard';
import { ActivityTimeline } from '@/app/components/ui-custom/ActivityTimeline';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { ConfirmationModal } from '@/app/components/ui-custom/ConfirmationModal';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { StatsCardSkeleton, ActivitySkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet, apiDelete } from '@/app/lib/api';
import {
  Users,
  Heart,
  Building2,
  Clock,
  ClipboardList,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  FileCheck,
  Trash2,
  Briefcase,
  ClockAlert,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, activitiesRes, ngoRes] = await Promise.all([
        apiGet<any>('/api/admin/stats').catch(() => null),
        apiGet<any>('/api/admin/activities?limit=10').catch(() => null),
        apiGet<any>('/api/admin/recent-ngos').catch(() => null),
      ]);

      setStats(statsRes?.data ?? null);
      setActivities(activitiesRes?.data ?? []);
      setNgos(ngoRes?.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleDeleteTask = async (task: any) => {
    try {
      await apiDelete(`/api/admin/tasks/${task.id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const mappedActivities = activities.map((a: any) => ({
    id: String(a.id),
    type: a.action?.toLowerCase()?.replace(/\s+/g, '-') || 'activity',
    message: a.description || `${a.action} by ${a.user_name || 'system'}`,
    timestamp: a.created_at,
    createdAt: a.created_at,
  }));

  const ngoColumns = [
    {
      key: 'organizationName',
      header: 'Organization',
      render: (ngo: any) => (
        <div>
          <p className="text-sm font-medium text-[#111827]">{ngo.organization_name}</p>
          <p className="text-xs text-[#6B7280]">{ngo.user?.name || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'registrationNumber',
      header: 'Reg. Number',
      render: (ngo: any) => (
        <span className="text-sm text-[#6B7280] font-mono">{ngo.registration_number || '—'}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (ngo: any) => (
        <span className="text-sm text-[#6B7280]">{ngo.office_location || '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (ngo: any) => (
        <span className="text-sm text-[#6B7280]">
          {ngo.created_at ? new Date(ngo.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          }) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827]">Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Welcome back! Here&apos;s what&apos;s happening on Sahayogi.</p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => router.push('/dashboard/admin/ngo-verification')}
            className="gap-2 text-white"
            style={{ backgroundColor: "#4F46C8" }}
          >
            <FileCheck className="w-4 h-4" />
            Verify NGOs
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <StatsCardSkeleton key={i} />)}
          </div>
        </>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Total Users" value={stats.total_users ?? 0} icon={Users}
              iconBgStyle={{ backgroundColor: "#E8EAFB" }} iconStyle={{ color: "#4F46C8" }} />
            <StatsCard title="Total Volunteers" value={stats.total_volunteers ?? 0} icon={Heart}
              iconBgColor="bg-red-100" iconColor="text-red-600" />
            <StatsCard title="Total NGOs" value={stats.total_ngos ?? 0} icon={Building2}
              iconBgColor="bg-purple-100" iconColor="text-purple-600" />
            <StatsCard title="Pending Verifications" value={stats.pending_ngos ?? 0} icon={Clock}
              iconBgColor="bg-amber-100" iconColor="text-amber-600" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Active Tasks" value={stats.active_tasks ?? 0} icon={Briefcase}
              iconBgColor="bg-emerald-100" iconColor="text-emerald-600" />
            <StatsCard title="Total Applications" value={stats.total_applications ?? 0} icon={ClipboardList}
              iconBgColor="bg-blue-100" iconColor="text-blue-600" />
            <StatsCard title="Service Hours" value={stats.total_service_hours ?? 0} icon={ClockAlert}
              iconBgColor="bg-indigo-100" iconColor="text-indigo-600" />
          </div>
        </>
      ) : null}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          {isLoading ? (
            <ActivitySkeleton count={5} />
          ) : (
            <ActivityTimeline activities={mappedActivities} />
          )}
        </div>

        {/* Pending NGO Approvals */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-[#CACDD3] shadow-sm">
            <div className="p-6 border-b border-[#CACDD3] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#111827]">Pending NGO Approvals</h3>
                <p className="text-sm text-[#6B7280] mt-1">NGOs awaiting verification</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/admin/ngo-verification')}
                className="gap-1"
                style={{ color: "#4F46C8" }}
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-[#AAB2C8] rounded animate-pulse" />
                  ))}
                </div>
              ) : ngos.length === 0 ? (
                <EmptyState type="ngos" title="No Pending NGOs"
                  message="All NGOs have been verified. Great job!"
                  actionLabel="View All NGOs"
                  onAction={() => router.push('/dashboard/admin/ngo-verification')} />
              ) : (
                <DataTable columns={ngoColumns} data={ngos}
                  keyExtractor={(ngo: any) => String(ngo.id)}
                  emptyMessage="No pending NGOs"
                  showActions={false}
                  itemsPerPage={3} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
