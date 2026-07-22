'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/app/lib/api';
import {
  Briefcase, Clock, MapPin, Inbox, AlertCircle,
  Calendar, Building2, Phone, Mail, Globe, Users,
  LogIn, LogOut, CheckCircle2, Timer,
} from 'lucide-react';

interface AssignedTaskSkill {
  id: number;
  name: string;
}

interface AssignedTaskCategory {
  id: number;
  name: string;
}

interface AssignedTaskNgoUser {
  name: string;
  email: string;
  phone: string | null;
}

interface AssignedTaskNgo {
  organization_name: string;
  office_location: string | null;
  website: string | null;
  user: AssignedTaskNgoUser;
}

interface AssignedTask {
  id: number;
  task_id: number;
  task: {
    id: number;
    title: string;
    description: string;
    location: string | null;
    city: string | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    required_volunteers: number | null;
    ngo: AssignedTaskNgo | null;
    skills: AssignedTaskSkill[];
    category: AssignedTaskCategory | null;
  } | null;
}

interface ServiceLog {
  id: number;
  volunteer_profile_id: number;
  task_id: number;
  check_in_time: string | null;
  check_out_time: string | null;
  hours: string | number | null;
  participation_status: 'assigned' | 'active' | 'completed' | 'absent';
  feedback: string | null;
  created_at: string;
  task: {
    id: number;
    title: string;
    ngo: { organization_name: string } | null;
  } | null;
}

export default function VolunteerParticipationsPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<ServiceLog[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksRes, attendanceRes, hoursRes] = await Promise.all([
        apiGet<{ data: AssignedTask[] }>('/volunteer/assigned-tasks'),
        apiGet<{ data: ServiceLog[] }>('/volunteer/attendance'),
        apiGet<{ total_hours: number }>('/volunteer/attendance/hours'),
      ]);
      setTasks(tasksRes.data ?? []);
      setAttendanceLogs(attendanceRes.data ?? []);
      setTotalHours(hoursRes.total_hours ?? 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function getServiceLogForTask(taskId: number): ServiceLog | null {
    const taskLogs = attendanceLogs.filter((l) => l.task_id === taskId);
    if (taskLogs.length === 0) return null;
    return taskLogs.reduce((latest, log) =>
      new Date(log.check_in_time || log.created_at) > new Date(latest.check_in_time || latest.created_at) ? log : latest
    );
  }

  async function handleCheckIn(taskId: number) {
    setActionLoading(taskId);
    setToast(null);
    try {
      await apiPost('/volunteer/attendance/check-in', { task_id: taskId });
      setToast({ message: 'Checked in successfully!', type: 'success' });
      await loadData();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to check in.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCheckOut(taskId: number) {
    setActionLoading(taskId);
    setToast(null);
    try {
      const res = await apiPost<{ message: string; hours: number }>('/volunteer/attendance/check-out', { task_id: taskId });
      setToast({ message: `Checked out! Hours: ${res.hours}`, type: 'success' });
      await loadData();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to check out.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-medium">Failed to load</p>
          <p className="text-sm text-[#6B7280] mt-1">{error}</p>
          <button
            onClick={loadData}
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
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">My Participations</h1>
            <p className="text-[#6B7280] text-sm mt-1">
              Check in to your assigned tasks and track your hours.
            </p>
          </div>
          {totalHours > 0 && (
            <div className="flex items-center gap-2 bg-white border border-[#CACDD3] rounded-xl px-4 py-2.5">
              <Timer size={18} className="text-[#4F46C8]" />
              <span className="text-sm font-semibold text-[#111827]">{totalHours} hrs</span>
            </div>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#CACDD3] p-10 text-center">
            <Inbox size={36} className="mx-auto text-[#6B7280] mb-3" />
            <p className="text-[#111827] font-medium mb-1">No assigned tasks yet</p>
            <p className="text-[#6B7280] text-sm mb-5">
              Once your applications are accepted, your assigned tasks will appear here.
            </p>
            <button
              onClick={() => router.push('/dashboard/volunteer/tasks')}
              className="bg-[#4F46C8] hover:bg-[#3f39a8] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              Browse Tasks
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-10">
              {tasks.map((app) => {
                const task = app.task;
                if (!task) return null;
                const ngo = task.ngo;
                const log = getServiceLogForTask(task.id);
                const isCheckedIn = log?.participation_status === 'active';
                const isCompleted = log?.participation_status === 'completed';

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-[#CACDD3] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
                          <Briefcase size={18} className="text-[#4F46C8]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#111827]">{task.title}</p>
                          {ngo && (
                            <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                              <Building2 size={12} />
                              {ngo.organization_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${
                          isCheckedIn
                            ? 'bg-green-100 text-green-700'
                            : isCompleted
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isCheckedIn ? 'Checked In' : isCompleted ? 'Completed' : 'Assigned'}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-[#6B7280] mt-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#6B7280]">
                      {task.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(task.start_date).toLocaleDateString()}
                          {task.end_date && ` - ${new Date(task.end_date).toLocaleDateString()}`}
                        </span>
                      )}
                      {(task.location || task.city) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {task.city || task.location}
                        </span>
                      )}
                    </div>

                    {log && (
                      <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-1 text-xs text-[#6B7280]">
                        {log.check_in_time && (
                          <p className="flex items-center gap-1">
                            <LogIn size={12} />
                            Check-in: {new Date(log.check_in_time).toLocaleString()}
                          </p>
                        )}
                        {log.check_out_time && (
                          <p className="flex items-center gap-1">
                            <LogOut size={12} />
                            Check-out: {new Date(log.check_out_time).toLocaleString()}
                          </p>
                        )}
                        {isCompleted && log.hours && (
                          <p className="flex items-center gap-1 text-blue-600 font-medium">
                            <Clock size={12} />
                            Hours: {log.hours}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      {!isCheckedIn && !isCompleted && (
                        <button
                          onClick={() => handleCheckIn(task.id)}
                          disabled={actionLoading === task.id}
                          className="flex items-center gap-1.5 bg-[#4F46C8] hover:bg-[#3f39a8] disabled:bg-[#4F46C8]/50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                          {actionLoading === task.id ? (
                            <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                          ) : (
                            <><LogIn size={14} /> Check In</>
                          )}
                        </button>
                      )}
                      {isCheckedIn && (
                        <button
                          onClick={() => handleCheckOut(task.id)}
                          disabled={actionLoading === task.id}
                          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                          {actionLoading === task.id ? (
                            <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                          ) : (
                            <><LogOut size={14} /> Check Out</>
                          )}
                        </button>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium px-4 py-2">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {attendanceLogs.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#111827] mb-4">Attendance History</h2>
                <div className="bg-white rounded-2xl border border-[#CACDD3] divide-y divide-[#E5E7EB]">
                  {attendanceLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#111827]">
                          {log.task?.title || `Task #${log.task_id}`}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {log.task?.ngo?.organization_name || 'NGO'}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-[#6B7280]">
                          {log.check_in_time && (
                            <span className="flex items-center gap-1">
                              <LogIn size={11} />
                              {new Date(log.check_in_time).toLocaleString()}
                            </span>
                          )}
                          {log.check_out_time && (
                            <span className="flex items-center gap-1">
                              <LogOut size={11} />
                              {new Date(log.check_out_time).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {log.hours && Number(log.hours) > 0 && (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            {log.hours}h
                          </span>
                        )}
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            log.participation_status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : log.participation_status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : log.participation_status === 'absent'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {log.participation_status.charAt(0).toUpperCase() + log.participation_status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
