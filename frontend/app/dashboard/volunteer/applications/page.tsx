'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Clock, CheckCircle2, XCircle, Hourglass, Inbox, Trash2 } from 'lucide-react';

interface ApplicationRecord {
  id: number;
  opportunity_id: number;
  volunteer_profile_id: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  applied_at: string;
  reviewed_by: number | null;
  reviewed_at: string | null;
  applicant: {
    fullName: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Hourglass, label: 'Pending Review' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Approved' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle, label: 'Withdrawn' },
};

export default function VolunteerApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [taskTitles, setTaskTitles] = useState<Record<number, string>>({});

  const currentVolunteerId = () => {
    const raw = localStorage.getItem('volunteer_profile_id');
    return raw ? Number(raw) : null;
  };

  const loadApplications = () => {
    try {
      const stored: ApplicationRecord[] = JSON.parse(
        localStorage.getItem('opportunity_applications') || '[]'
      );

      const myId = currentVolunteerId();

      // Only show applications belonging to the logged-in volunteer.
      // Without this filter, every applicant's records show up for everyone.
      const mine = myId !== null
        ? stored.filter((a) => a.volunteer_profile_id === myId)
        : stored;

      // De-duplicate defensively in case the apply flow ever fires twice
      // (double click, double-mounted effect, etc). Two records for the
      // same opportunity + volunteer are the same application, even if
      // they ended up with different ids — keep the earliest one and
      // report its original applied_at date.
      const byOpportunity = new Map<number, ApplicationRecord>();
      mine
        .slice()
        .sort((a, b) => new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime())
        .forEach((a) => {
          if (!byOpportunity.has(a.opportunity_id)) {
            byOpportunity.set(a.opportunity_id, a);
          }
        });
      const deduped = Array.from(byOpportunity.values()).sort(
        (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
      );

      setApplications(deduped);

      const allTasks = JSON.parse(localStorage.getItem('ngo_tasks') || '[]');
      const titleMap: Record<number, string> = {};
      allTasks.forEach((t: any) => {
        titleMap[t.id] = t.title;
      });
      setTaskTitles(titleMap);
    } catch {
      setApplications([]);
    }
  };

  useEffect(() => {
    loadApplications();
    window.addEventListener('applications:updated', loadApplications);
    window.addEventListener('storage', loadApplications);
    return () => {
      window.removeEventListener('applications:updated', loadApplications);
      window.removeEventListener('storage', loadApplications);
    };
  }, []);

  // Dev-only helper to wipe stale test data accumulated during testing.
  const clearAllApplications = () => {
    if (!confirm('Clear ALL stored applications (volunteer + NGO side)? This cannot be undone.')) return;
    localStorage.removeItem('opportunity_applications');
    localStorage.removeItem('ngo_applications');
    localStorage.removeItem('ngo_notifications');
    window.dispatchEvent(new Event('applications:updated'));
    window.dispatchEvent(new Event('notifications:updated'));
  };

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-[#111827]">My Applications</h1>

          {/* Remove this button once you're done testing / before shipping */}
          {applications.length > 0 && (
            <button
              onClick={clearAllApplications}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
              title="Dev only: clear stale test data"
            >
              <Trash2 size={13} />
              Clear test data
            </button>
          )}
        </div>
        <p className="text-[#6B7280] text-sm mb-6">
          Track the status of every opportunity you've applied to.
        </p>

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
              const status = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
              const StatusIcon = status.icon;
              const title = taskTitles[app.opportunity_id] || `Opportunity #${app.opportunity_id}`;
              // Fall back to updated_at if reviewed_at wasn't set for some
              // reason, so the "reviewed on" line doesn't just disappear.
              const reviewedDate = app.reviewed_at || app.updated_at;

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
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                      {/* Once the NGO has acted on this application, show when. */}
                      {app.status !== 'pending' && app.status !== 'withdrawn' && reviewedDate && (
                        <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                          <StatusIcon size={12} />
                          {status.label} on {new Date(reviewedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${status.bg} ${status.text}`}
                  >
                    <StatusIcon size={13} />
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}