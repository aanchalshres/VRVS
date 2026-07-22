'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPost } from '@/app/lib/api';
import {
  ArrowLeft, CheckCircle, AlertCircle, Loader2,
  MapPin, Calendar, Clock, Users, Layers,
  Building2, Globe, Phone, Mail, Send,
  Hourglass, CheckCircle2, XCircle,
} from 'lucide-react';

interface TaskDetail {
  id: number;
  title: string;
  description: string;
  location: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  required_volunteers: number | null;
  filled_slots: number;
  remaining_slots: number;
  start_date: string | null;
  end_date: string | null;
  application_deadline: string | null;
  status: string;
  task_type: string;
  urgency_level: string;
  application_status: string;
  ngo: {
    organization_name: string;
    description: string | null;
    logo: string | null;
    website: string | null;
    office_location: string | null;
    city: string | null;
    country: string | null;
    user: {
      name: string;
      email: string;
      phone: string | null;
    };
  } | null;
  skills: { id: number; name: string }[];
  category: { id: number; name: string } | null;
}

const APP_STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  'Not Applied': { bg: 'bg-gray-100', text: 'text-gray-600', icon: null, label: 'Not Applied' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Hourglass, label: 'Pending Review' },
  Shortlisted: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock, label: 'Shortlisted' },
  Accepted: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Accepted' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  Withdrawn: { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle, label: 'Withdrawn' },
};

const TASK_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  Open: { bg: 'bg-green-100', text: 'text-green-700' },
  Ongoing: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Completed: { bg: 'bg-gray-100', text: 'text-gray-600' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

const URGENCY_STYLES: Record<string, { bg: string; text: string }> = {
  Low: { bg: 'bg-[#4F46C8]/10', text: 'text-[#4F46C8]' },
  Medium: { bg: 'bg-[#B45309]/10', text: 'text-[#B45309]' },
  High: { bg: 'bg-[#B91C1C]/10', text: 'text-[#B91C1C]' },
};

export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!taskId) return;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet<{ data: TaskDetail }>(`/volunteer/tasks/${taskId}`);
        setTask(res.data ?? null);
      } catch (err: any) {
        setError(err.message || 'Failed to load opportunity.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [taskId]);

  async function handleApply() {
    setSubmitting(true);
    setResult(null);
    try {
      await apiPost(`/volunteer/tasks/${taskId}/apply`, {});
      setResult({ success: true, message: 'Application submitted successfully!' });
      const res = await apiGet<{ data: TaskDetail }>(`/volunteer/tasks/${taskId}`);
      setTask(res.data ?? null);
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Failed to apply.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md">
          <AlertCircle size={36} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-semibold">Opportunity not found</p>
          <p className="text-sm text-[#6B7280] mt-1">{error || 'This opportunity may no longer be available.'}</p>
          <button
            onClick={() => router.push('/dashboard/volunteer/tasks')}
            className="mt-5 bg-[#4F46C8] hover:bg-[#3f39a8] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const taskStatusStyle = TASK_STATUS_STYLES[task.status] || TASK_STATUS_STYLES.Draft;
  const urgencyStyle = URGENCY_STYLES[task.urgency_level] || URGENCY_STYLES.Low;
  const appStatusStyle = APP_STATUS_STYLES[task.application_status] || APP_STATUS_STYLES['Not Applied'];
  const AppStatusIcon = appStatusStyle.icon;
  const canApply = task.application_status === 'Not Applied' && task.status === 'Open';
  const isFull = task.remaining_slots <= 0;

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      {result && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              result.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {result.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {result.message}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/volunteer/tasks')}
          className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 hover:text-[#111827] transition"
        >
          <ArrowLeft size={16} /> Back to Tasks
        </button>

        <div className="bg-white rounded-2xl border border-[#CACDD3] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[#111827]">{task.title}</h1>
              {task.ngo && (
                <p className="text-sm text-[#6B7280] flex items-center gap-1 mt-1">
                  <Building2 size={14} />
                  {task.ngo.organization_name}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${taskStatusStyle.bg} ${taskStatusStyle.text}`}>
                {task.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${urgencyStyle.bg} ${urgencyStyle.text}`}>
                {task.urgency_level} urgency
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {AppStatusIcon ? (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${appStatusStyle.bg} ${appStatusStyle.text}`}>
                <AppStatusIcon size={13} />
                {appStatusStyle.label}
              </span>
            ) : (
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${appStatusStyle.bg} ${appStatusStyle.text}`}>
                {appStatusStyle.label}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-[#6B7280] mt-4 leading-relaxed whitespace-pre-line">
              {task.description}
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {task.task_type && (
              <div className="flex items-center gap-2 text-sm text-[#111827]">
                <Layers size={16} className="text-[#6B7280] shrink-0" />
                <span className="capitalize">{task.task_type}</span>
              </div>
            )}
            {task.category && (
              <div className="flex items-center gap-2 text-sm text-[#111827]">
                <Layers size={16} className="text-[#6B7280] shrink-0" />
                {task.category.name}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-[#111827]">
              <Users size={16} className="text-[#6B7280] shrink-0" />
              {task.required_volunteers || 0} volunteers needed
              {task.filled_slots > 0 && (
                <span className="text-xs text-[#6B7280]">
                  ({task.filled_slots} filled
                  {task.remaining_slots > 0 ? `, ${task.remaining_slots} remaining` : ''})
                </span>
              )}
            </div>
            {(task.location || task.city || task.country) && (
              <div className="flex items-center gap-2 text-sm text-[#111827]">
                <MapPin size={16} className="text-[#6B7280] shrink-0" />
                {task.city || task.location}{task.country ? `, ${task.country}` : ''}
              </div>
            )}
            {task.start_date && (
              <div className="flex items-center gap-2 text-sm text-[#111827]">
                <Calendar size={16} className="text-[#6B7280] shrink-0" />
                {new Date(task.start_date).toLocaleDateString()}
                {task.end_date && ` - ${new Date(task.end_date).toLocaleDateString()}`}
              </div>
            )}
            {task.application_deadline && (
              <div className="flex items-center gap-2 text-sm text-[#111827]">
                <Clock size={16} className="text-[#6B7280] shrink-0" />
                Apply by {new Date(task.application_deadline).toLocaleDateString()}
              </div>
            )}
          </div>

          {task.skills && task.skills.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-medium text-[#6B7280] mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {task.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2.5 py-1 text-xs font-medium bg-[#4F46C8]/10 text-[#4F46C8] rounded-full"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.ngo && (
            <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
              <p className="text-sm font-semibold text-[#111827] mb-2">About the NGO</p>
              <div className="flex items-start gap-3">
                {task.ngo.logo && (
                  <img
                    src={task.ngo.logo}
                    alt={task.ngo.organization_name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111827]">{task.ngo.organization_name}</p>
                  {task.ngo.description && (
                    <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{task.ngo.description}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-[#6B7280]">
                    {task.ngo.user?.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {task.ngo.user.email}
                      </span>
                    )}
                    {task.ngo.user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {task.ngo.user.phone}
                      </span>
                    )}
                    {task.ngo.website && (
                      <span className="flex items-center gap-1">
                        <Globe size={12} />
                        {task.ngo.website}
                      </span>
                    )}
                    {task.ngo.office_location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {task.ngo.office_location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className={`mt-6 flex items-start gap-3 p-4 rounded-xl text-sm ${
              result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {result.success ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
              {result.message}
            </div>
          )}

          {!result && (
            <>
              {canApply && !isFull && (
                <button
                  onClick={handleApply}
                  disabled={submitting}
                  className="mt-6 w-full bg-[#4F46C8] hover:bg-[#3f39a8] disabled:bg-[#4F46C8]/50 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Applying...</>
                  ) : (
                    <><Send size={18} /> Apply Now</>
                  )}
                </button>
              )}
              {!canApply && task.application_status === 'Not Applied' && isFull && (
                <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600 text-center">
                  This opportunity is full.
                </div>
              )}
              {task.application_status === 'Pending' && (
                <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 text-center">
                  Your application is pending review.
                </div>
              )}
              {task.application_status === 'Accepted' && (
                <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 text-center">
                  You have been accepted for this opportunity.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
