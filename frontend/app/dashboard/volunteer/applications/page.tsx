'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/app/lib/api';
import { Briefcase, Clock, CheckCircle2, XCircle, Hourglass, Inbox, AlertCircle, ArrowLeft } from 'lucide-react';

interface TaskSummary {
  id: number;
  title: string;
  ngo: {
    organization_name: string;
  } | null;
}

interface ApplicationRecord {
  id: number;
  task_id: number;
  volunteer_profile_id: number;
  status: string;
  applied_at: string;
  reviewed_by: number | null;
  reviewed_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  task: TaskSummary | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Hourglass, label: 'Pending Review' },
  Shortlisted: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock, label: 'Shortlisted' },
  Accepted: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Accepted' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  Withdrawn: { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle, label: 'Withdrawn' },
};

export default function VolunteerApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<number | null>(null);

  async function loadApplications() {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet<{ data: ApplicationRecord[] }>('/volunteer/applications');
      setApplications(res.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleWithdraw(id: number) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawing(id);
    try {
      await apiPost(`/volunteer/applications/${id}/withdraw`, {});
      await loadApplications();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-medium">Failed to load applications</p>
          <p className="text-sm text-[#6B7280] mt-1">{error}</p>
          <button
            onClick={loadApplications}
            className="mt-4 bg-[#4F46C8] hover:bg-[#3f39a8] text-white px-5 py-2 rounded-xl font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">My Applications</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Track the status of every opportunity you've applied to.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#CACDD3] p-10 text-center">
            <Inbox size={36} className="mx-auto text-[#6B7280] mb-3" />
            <p className="text-[#111827] font-medium mb-1">No applications yet</p>
            <p className="text-[#6B7280] text-sm mb-5">
              Browse open tasks and apply to start volunteering.
            </p>
            <button
              onClick={() => router.push('/dashboard/volunteer/tasks')}
              className="bg-[#4F46C8] hover:bg-[#3f39a8] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              Browse Tasks
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const status = STATUS_STYLES[app.status] || STATUS_STYLES.Pending;
              const StatusIcon = status.icon;
              const title = app.task?.title || `Task #${app.task_id}`;
              const ngoName = app.task?.ngo?.organization_name || 'NGO';
              const reviewedDate = app.reviewed_at || app.updated_at;
              const canWithdraw = app.status === 'Pending' || app.status === 'Shortlisted';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-[#CACDD3] p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
                      <Briefcase size={18} className="text-[#4F46C8]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111827] truncate">{title}</p>
                      <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        Applied {new Date(app.applied_at || app.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">NGO: {ngoName}</p>
                      {app.status !== 'Pending' && app.status !== 'Withdrawn' && reviewedDate && (
                        <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                          <StatusIcon size={12} />
                          {status.label} on {new Date(reviewedDate).toLocaleDateString()}
                        </p>
                      )}
                      {app.remarks && app.status === 'Rejected' && (
                        <p className="text-xs text-red-500 mt-1 italic">Remark: {app.remarks}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawing === app.id}
                        className="text-xs text-gray-500 hover:text-red-600 underline underline-offset-2 disabled:opacity-50"
                      >
                        {withdrawing === app.id ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    )}
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}
                    >
                      <StatusIcon size={13} />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
