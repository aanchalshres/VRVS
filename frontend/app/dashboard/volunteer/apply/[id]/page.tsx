'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPost } from '@/app/lib/api';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TaskDetail {
  id: number;
  title: string;
  description: string;
  location: string | null;
  required_volunteers?: number;
  status: string;
  ngo: {
    organization_name: string;
  } | null;
}

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    async function load() {
      try {
        setLoading(true);
        const res = await apiGet<{ data: TaskDetail }>(`/volunteer/tasks/${taskId}`);
        setTask(res.data ?? null);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Failed to load task.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [taskId]);

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);
    try {
      await apiPost(`/volunteer/tasks/${taskId}/apply`, {});
      setResult({ success: true, message: 'Application submitted successfully!' });
      setTimeout(() => router.push('/dashboard/volunteer/applications'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to apply.';
      setResult({ success: false, message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#4F46C8]" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md">
          <AlertCircle size={36} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-semibold">Task not found</p>
          <p className="text-sm text-[#6B7280] mt-1">{error || 'This task may no longer be available.'}</p>
          <button onClick={() => router.push('/dashboard/volunteer/tasks')}
            className="mt-5 bg-[#4F46C8] text-white px-5 py-2.5 rounded-xl font-medium">
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 hover:text-[#111827] transition">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl border border-[#CACDD3] p-6">
          <h1 className="text-xl font-bold text-[#111827]">{task.title}</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {task.ngo?.organization_name || 'NGO'} &middot; {task.location || 'Remote'}
          </p>

          <p className="text-sm text-[#6B7280] mt-4">{task.description}</p>

          {result && (
            <div className={`mt-6 flex items-start gap-3 p-4 rounded-xl text-sm ${
              result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {result.success ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
              {result.message}
            </div>
          )}

          {!result && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-6 w-full bg-[#4F46C8] hover:bg-[#3f39a8] disabled:bg-[#4F46C8]/50 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting...</>
              ) : (
                'Submit Application'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
