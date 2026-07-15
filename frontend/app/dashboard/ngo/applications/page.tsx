'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import {
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Inbox,
  Trash2,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Applicant {
  fullName: string;
  email: string;
  phone: string;
  address?: string | null;
  age?: number | null;
  gender?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  occupation?: string | null;
  experienceLevel?: string | null;
  availability?: string[];
  skills?: string[];
  motivation?: string | null;
  previousExperience?: string | null;
  medicalConditions?: string | null;
  hasTransport?: string | null;
}

interface NgoApplicationRecord {
  id: number;
  task_id: number;
  volunteer_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  applied_at: string;
  applicant?: Applicant;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Hourglass, label: 'Pending' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Approved' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle, label: 'Withdrawn' },
};

export default function NgoApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<NgoApplicationRecord[]>([]);
  const [taskTitles, setTaskTitles] = useState<Record<number, string>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadApplications = () => {
    try {
      const allTasks = JSON.parse(localStorage.getItem('ngo_tasks') || '[]');

      const titleMap: Record<number, string> = {};
      allTasks.forEach((t: any) => {
        titleMap[t.id] = t.title;
      });
      setTaskTitles(titleMap);

      const stored: NgoApplicationRecord[] = JSON.parse(
        localStorage.getItem('ngo_applications') || '[]'
      );

      // Tasks that actually carry an owner field. If a task predates the
      // owner field being added, or the field is missing for any reason,
      // it's excluded from the "resolvable" set below rather than
      // silently failing the String() comparison.
      const tasksWithOwner = allTasks.filter((t: any) => {
        const owner = t.created_by ?? t.ngo_user_id ?? t.user_id;
        return owner !== undefined && owner !== null;
      });

      let scoped: NgoApplicationRecord[];

      if (tasksWithOwner.length > 0 && user?.id) {
        // We can resolve ownership — scope applications to tasks owned
        // by the logged-in NGO user.
        const myIds = new Set<number>(
          tasksWithOwner
            .filter((t: any) => {
              const owner = t.created_by ?? t.ngo_user_id ?? t.user_id;
              return String(owner) === String(user.id);
            })
            .map((t: any) => t.id)
        );
        scoped = stored.filter((a) => myIds.has(a.task_id));
      } else {
        // No ownership data available yet (e.g. legacy tasks, or user
        // not loaded on first render). Show everything rather than
        // silently hiding applications that just applied.
        scoped = stored;
      }

      // De-duplicate defensively in case a race condition ever writes
      // the same application twice (keeps the first occurrence of each id).
      const seen = new Set<number>();
      const deduped = scoped.filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });

      setApplications(deduped);
    } catch {
      setApplications([]);
    }
  };

  // Normalizes a string for loose comparison (trims, lowercases, collapses
  // whitespace) so "John Doe " vs "john doe" still match.
  const norm = (v: unknown): string | null => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim().toLowerCase().replace(/\s+/g, ' ');
    return s.length > 0 ? s : null;
  };

  const updateStatus = (id: number, status: NgoApplicationRecord['status']) => {
    try {
      const allApplications: NgoApplicationRecord[] = JSON.parse(
        localStorage.getItem('ngo_applications') || '[]'
      );

      // Grab the record being updated so we have task_id + applicant info
      // to fall back on if ids don't line up on the volunteer side.
      const target = allApplications.find((a) => a.id === id);

      const updatedAll = allApplications.map((a) => (a.id === id ? { ...a, status } : a));
      localStorage.setItem('ngo_applications', JSON.stringify(updatedAll));

      // Update local (scoped) view immediately
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

      // Also reflect the decision on the volunteer-facing record.
      const volunteerApps = JSON.parse(localStorage.getItem('opportunity_applications') || '[]');
      const nowIso = new Date().toISOString();

      let matchIndex = -1;
      let matchReason = 'none';

      if (target) {
        const targetTaskId = target.task_id;
        const targetEmail = norm(target.applicant?.email);
        const targetPhone = norm(target.applicant?.phone);
        const targetName = norm(target.volunteer_name) ?? norm(target.applicant?.fullName);

        // Try several possible "link to same task" field names, since we
        // don't know for certain what the apply-flow actually wrote.
        const taskFieldCandidates = ['opportunity_id', 'task_id', 'taskId', 'opportunityId'];
        // Try several possible "link to same applicant" field names/shapes.
        const applicantEmailCandidates = ['email', 'applicant.email', 'applicant_email'];
        const applicantPhoneCandidates = ['phone', 'applicant.phone', 'applicant_phone'];
        const applicantNameCandidates = [
          'fullName',
          'applicant.fullName',
          'volunteer_name',
          'name',
          'applicantName',
        ];

        const getPath = (obj: any, path: string) =>
          path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

        // Strategy 1: exact id match (fast path, works if stores share ids).
        matchIndex = volunteerApps.findIndex((a: any) => a.id === id);
        if (matchIndex !== -1) matchReason = 'id';

        // Strategy 2: same task (any known field name) + same email.
        if (matchIndex === -1 && targetEmail) {
          matchIndex = volunteerApps.findIndex((a: any) => {
            const taskMatches = taskFieldCandidates.some((f) => {
              const v = getPath(a, f);
              return v !== undefined && String(v) === String(targetTaskId);
            });
            const emailMatches = applicantEmailCandidates.some(
              (f) => norm(getPath(a, f)) === targetEmail
            );
            return taskMatches && emailMatches;
          });
          if (matchIndex !== -1) matchReason = 'task+email';
        }

        // Strategy 3: same task + same phone.
        if (matchIndex === -1 && targetPhone) {
          matchIndex = volunteerApps.findIndex((a: any) => {
            const taskMatches = taskFieldCandidates.some((f) => {
              const v = getPath(a, f);
              return v !== undefined && String(v) === String(targetTaskId);
            });
            const phoneMatches = applicantPhoneCandidates.some(
              (f) => norm(getPath(a, f)) === targetPhone
            );
            return taskMatches && phoneMatches;
          });
          if (matchIndex !== -1) matchReason = 'task+phone';
        }

        // Strategy 4: same task + same name, only among still-pending
        // records (avoids re-matching something already decided).
        if (matchIndex === -1 && targetName) {
          matchIndex = volunteerApps.findIndex((a: any) => {
            if (a.status !== 'pending') return false;
            const taskMatches = taskFieldCandidates.some((f) => {
              const v = getPath(a, f);
              return v !== undefined && String(v) === String(targetTaskId);
            });
            const nameMatches = applicantNameCandidates.some(
              (f) => norm(getPath(a, f)) === targetName
            );
            return taskMatches && nameMatches;
          });
          if (matchIndex !== -1) matchReason = 'task+name';
        }

        // Strategy 5: last resort — same email/name anywhere, regardless
        // of task field naming, only if still pending and unambiguous.
        if (matchIndex === -1 && (targetEmail || targetName)) {
          const candidates = volunteerApps
            .map((a: any, i: number) => ({ a, i }))
            .filter(({ a }: any) => a.status === 'pending')
            .filter(({ a }: any) => {
              const emailMatches =
                targetEmail && applicantEmailCandidates.some((f) => norm(getPath(a, f)) === targetEmail);
              const nameMatches =
                targetName && applicantNameCandidates.some((f) => norm(getPath(a, f)) === targetName);
              return emailMatches || nameMatches;
            });
          if (candidates.length === 1) {
            matchIndex = candidates[0].i;
            matchReason = 'identity-only';
          }
        }
      }

      if (matchIndex !== -1) {
        volunteerApps[matchIndex] = {
          ...volunteerApps[matchIndex],
          status,
          reviewed_at: nowIso,
          updated_at: nowIso,
        };
        localStorage.setItem('opportunity_applications', JSON.stringify(volunteerApps));
        window.dispatchEvent(new Event('applications:updated'));
      } else {
        // Couldn't find a matching volunteer-side record by any strategy.
        // Log the two records side by side so the actual field mismatch
        // is visible in devtools instead of failing silently.
        console.warn(
          '[applications] Could not sync approval to volunteer side. ' +
            'No matching record found in opportunity_applications for:',
          target,
          'Checked against:',
          volunteerApps
        );
      }
    } catch (err) {
      console.error('[applications] updateStatus failed:', err);
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
  }, [user?.id]);

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
          <h1 className="text-2xl font-bold text-[#111827]">Applications</h1>

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
          Review and manage volunteer applications for your tasks.
        </p>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#CACDD3] p-10 text-center">
            <Inbox size={36} className="mx-auto text-[#6B7280] mb-3" />
            <p className="text-[#111827] font-medium mb-1">No applications yet</p>
            <p className="text-[#6B7280] text-sm">
              Applications will appear here as volunteers apply to your tasks.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const status = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
              const StatusIcon = status.icon;
              const title = taskTitles[app.task_id] || `Task #${app.task_id}`;
              const isExpanded = expandedId === app.id;
              const applicant = app.applicant;

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-[#CACDD3] p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
                        <User size={18} className="text-[#4F46C8]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#111827] truncate">{app.volunteer_name}</p>
                        <p className="text-xs text-[#6B7280] truncate">Applied for: {title}</p>
                        <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${status.bg} ${status.text}`}
                    >
                      <StatusIcon size={13} />
                      {status.label}
                    </span>
                  </div>

                  {applicant && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#4F46C8] hover:text-[#3f39a8] mb-2"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Hide details' : 'View application details'}
                    </button>
                  )}

                  {isExpanded && applicant && (
                    <div className="bg-[#F0F1F3] rounded-xl p-4 mb-4 text-sm space-y-2.5">
                      <div className="flex items-center gap-2 text-[#111827]">
                        <Mail size={13} className="text-[#4F46C8]" />
                        {applicant.email}
                      </div>
                      <div className="flex items-center gap-2 text-[#111827]">
                        <Phone size={13} className="text-[#4F46C8]" />
                        {applicant.phone}
                      </div>
                      {applicant.address && (
                        <p className="text-[#6B7280]">Address: <span className="text-[#111827]">{applicant.address}</span></p>
                      )}
                      <div className="flex flex-wrap gap-4 text-[#6B7280]">
                        {applicant.age && <span>Age: <span className="text-[#111827]">{applicant.age}</span></span>}
                        {applicant.gender && <span>Gender: <span className="text-[#111827] capitalize">{applicant.gender}</span></span>}
                        {applicant.occupation && <span>Occupation: <span className="text-[#111827]">{applicant.occupation}</span></span>}
                        {applicant.experienceLevel && <span>Experience: <span className="text-[#111827]">{applicant.experienceLevel}</span></span>}
                        {applicant.hasTransport && <span>Own transport: <span className="text-[#111827]">{applicant.hasTransport}</span></span>}
                      </div>
                      {applicant.availability && applicant.availability.length > 0 && (
                        <p className="text-[#6B7280]">Availability: <span className="text-[#111827]">{applicant.availability.join(', ')}</span></p>
                      )}
                      {applicant.skills && applicant.skills.length > 0 && (
                        <p className="text-[#6B7280]">Skills: <span className="text-[#111827]">{applicant.skills.join(', ')}</span></p>
                      )}
                      {applicant.motivation && (
                        <p className="text-[#6B7280]">Motivation: <span className="text-[#111827]">{applicant.motivation}</span></p>
                      )}
                      {applicant.previousExperience && (
                        <p className="text-[#6B7280]">Previous experience: <span className="text-[#111827]">{applicant.previousExperience}</span></p>
                      )}
                      {applicant.medicalConditions && (
                        <p className="text-[#6B7280]">Medical conditions: <span className="text-[#111827]">{applicant.medicalConditions}</span></p>
                      )}
                      {(applicant.emergencyContact || applicant.emergencyPhone) && (
                        <p className="text-[#6B7280]">
                          Emergency contact: <span className="text-[#111827]">{applicant.emergencyContact || '—'} {applicant.emergencyPhone ? `(${applicant.emergencyPhone})` : ''}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {app.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-[#CACDD3]">
                      <button
                        onClick={() => updateStatus(app.id, 'approved')}
                        className="flex-1 bg-[#4F46C8] hover:bg-[#3f39a8] text-white text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'rejected')}
                        className="flex-1 bg-white border border-[#CACDD3] hover:bg-[#B9C0D4]/20 text-[#111827] text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}