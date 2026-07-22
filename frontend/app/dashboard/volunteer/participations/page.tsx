'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/app/lib/api';
import {
  Briefcase, Clock, MapPin, Inbox, AlertCircle,
  Calendar, Building2, Phone, Mail, Globe, Users,
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
  status: string;
  applied_at: string;
  reviewed_at: string | null;
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

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  Accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Assigned' },
};

export default function VolunteerAssignedTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAssignedTasks() {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet<{ data: AssignedTask[] }>('/volunteer/assigned-tasks');
      setTasks(res.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignedTasks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading assigned tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-medium">Failed to load assigned tasks</p>
          <p className="text-sm text-[#6B7280] mt-1">{error}</p>
          <button
            onClick={loadAssignedTasks}
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
          <h1 className="text-2xl font-bold text-[#111827]">My Assigned Tasks</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Tasks you have been accepted to participate in.
          </p>
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
          <div className="space-y-4">
            {tasks.map((app) => {
              const task = app.task;
              if (!task) return null;
              const statusStyle = STATUS_STYLES['Accepted'];
              const ngo = task.ngo;

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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
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
                    {task.required_volunteers && (
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {task.required_volunteers} volunteers needed
                      </span>
                    )}
                  </div>

                  {task.skills && task.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {task.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-0.5 text-xs font-medium bg-[#4F46C8]/10 text-[#4F46C8] rounded-full"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {ngo && (
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                      <p className="text-xs font-medium text-[#111827] mb-1.5">NGO Contact</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#6B7280]">
                        {ngo.user?.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {ngo.user.email}
                          </span>
                        )}
                        {ngo.user?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {ngo.user.phone}
                          </span>
                        )}
                        {ngo.office_location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {ngo.office_location}
                          </span>
                        )}
                        {ngo.website && (
                          <span className="flex items-center gap-1">
                            <Globe size={12} />
                            {ngo.website}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {app.reviewed_at && (
                    <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-2">
                      <Clock size={12} />
                      Assigned on {new Date(app.reviewed_at).toLocaleDateString()}
                    </p>
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
