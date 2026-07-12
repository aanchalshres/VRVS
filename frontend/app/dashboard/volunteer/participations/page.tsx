'use client';

import { useEffect, useState } from 'react';

interface Participation {
  id: number;
  opportunity_id: number;
  volunteer_profile_id: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  participation_status: 'assigned' | 'active' | 'completed' | 'absent';
  hours_contributed: number | null;
  feedback: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: number;
  title: string;
}

export default function VolunteerParticipationsPage() {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [tasks, setTasks] = useState<Record<number, Task>>({});
  const [loading, setLoading] = useState(true);

  // Get current volunteer profile ID (from localStorage or auth)
  const volunteerProfileId = typeof window !== 'undefined'
    ? Number(localStorage.getItem('volunteer_profile_id')) || null
    : null;

  useEffect(() => {
    try {
      const allParts = JSON.parse(localStorage.getItem('participations') || '[]');
      // Filter for this volunteer
      const filtered = volunteerProfileId
        ? allParts.filter((p: Participation) => p.volunteer_profile_id === volunteerProfileId)
        : allParts; // fallback: show all if no profile id
      setParticipations(filtered);

      const allTasks = JSON.parse(localStorage.getItem('ngo_tasks') || '[]');
      const taskMap: Record<number, Task> = {};
      allTasks.forEach((t: Task) => { taskMap[t.id] = t; });
      setTasks(taskMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [volunteerProfileId]);

  const getTaskTitle = (oppId: number) => tasks[oppId]?.title || `Task #${oppId}`;

  const StatusBadge = ({ status }: { status: Participation['participation_status'] }) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      absent: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">Loading your participations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#4F46C8] mb-6">My Participation History</h1>

        {participations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-gray-500">You haven't participated in any opportunities yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participations.map((part) => (
              <div key={part.id} className="bg-white rounded-2xl shadow p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{getTaskTitle(part.opportunity_id)}</h3>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <StatusBadge status={part.participation_status} />
                      {part.check_in_time && (
                        <span className="text-sm text-gray-500">
                          Check-in: {new Date(part.check_in_time).toLocaleString()}
                        </span>
                      )}
                      {part.check_out_time && (
                        <span className="text-sm text-gray-500">
                          Check-out: {new Date(part.check_out_time).toLocaleString()}
                        </span>
                      )}
                      {part.hours_contributed !== null && (
                        <span className="text-sm text-gray-500">
                          Hours: {part.hours_contributed}
                        </span>
                      )}
                      {part.rating !== null && (
                        <span className="text-sm text-gray-500">
                          Rating: {part.rating} ⭐
                        </span>
                      )}
                    </div>
                    {part.feedback && (
                      <p className="text-sm text-gray-600 mt-2 italic">“{part.feedback}”</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}