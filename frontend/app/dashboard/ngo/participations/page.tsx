'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Participation {
  id: number;
  opportunity_id: number;
  volunteer_profile_id: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  participation_status: 'assigned' | 'active' | 'completed' | 'absent';
  hours_contributed: number | null;
  feedback: string | null;
  rating: number | null; // 1-5
  created_at: string;
  updated_at: string;
}

interface Task {
  id: number;
  title: string;
}

export default function NGOParticipationsPage() {
  const router = useRouter();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [tasks, setTasks] = useState<Record<number, Task>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    try {
      const parts = JSON.parse(localStorage.getItem('participations') || '[]');
      setParticipations(parts);

      const allTasks = JSON.parse(localStorage.getItem('ngo_tasks') || '[]');
      const taskMap: Record<number, Task> = {};
      allTasks.forEach((t: Task) => { taskMap[t.id] = t; });
      setTasks(taskMap);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a single field (or whole status)
  const updateParticipation = (partId: number, updates: Partial<Participation>) => {
    setActionLoading(partId);
    setError(null);
    setSuccess(null);

    try {
      const updated = participations.map((p) => {
        if (p.id === partId) {
          return {
            ...p,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      });
      localStorage.setItem('participations', JSON.stringify(updated));
      setParticipations(updated);
      setSuccess('Participation updated successfully!');
    } catch (err) {
      setError('Failed to update participation');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Quick actions
  const handleCheckIn = (partId: number) => {
    updateParticipation(partId, {
      check_in_time: new Date().toISOString(),
      participation_status: 'active',
    });
  };

  const handleCheckOut = (partId: number, hours?: number) => {
    const updates: Partial<Participation> = {
      check_out_time: new Date().toISOString(),
      participation_status: 'completed',
    };
    if (hours !== undefined) updates.hours_contributed = hours;
    updateParticipation(partId, updates);
  };

  const handleStatusChange = (partId: number, status: Participation['participation_status']) => {
    updateParticipation(partId, { participation_status: status });
  };

  const handleFeedbackRating = (partId: number, feedback: string, rating: number) => {
    updateParticipation(partId, { feedback, rating });
  };

  // Helper to get task title
  const getTaskTitle = (oppId: number) => tasks[oppId]?.title || `Task #${oppId}`;

  // Status badge
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
        <p className="text-gray-500">Loading participations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#4F46C8]">Volunteer Participations</h1>
          <button
            onClick={() => router.push('/dashboard/ngo/applications')}
            className="bg-[#4F46C8] text-white px-4 py-2 rounded-lg hover:bg-[#4338CA] transition"
          >
            View Applications
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-700">
            {success}
          </div>
        )}

        {participations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-gray-500">No participations yet. Approve applications to create them.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participations.map((part) => (
              <div key={part.id} className="bg-white rounded-2xl shadow p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{getTaskTitle(part.opportunity_id)}</h3>
                    <p className="text-sm text-gray-500">
                      Volunteer Profile #{part.volunteer_profile_id || 'N/A'} &nbsp;|&nbsp;
                      Applied: {new Date(part.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
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

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {part.participation_status === 'assigned' && (
                      <button
                        onClick={() => handleCheckIn(part.id)}
                        disabled={actionLoading === part.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        Check In
                      </button>
                    )}
                    {part.participation_status === 'active' && (
                      <>
                        <button
                          onClick={() => {
                            const hours = prompt('Enter hours contributed:', '2.5');
                            if (hours !== null && !isNaN(parseFloat(hours))) {
                              handleCheckOut(part.id, parseFloat(hours));
                            }
                          }}
                          disabled={actionLoading === part.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          Check Out
                        </button>
                        <button
                          onClick={() => handleStatusChange(part.id, 'absent')}
                          disabled={actionLoading === part.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          Mark Absent
                        </button>
                      </>
                    )}
                    {(part.participation_status === 'completed' || part.participation_status === 'absent') && (
                      <button
                        onClick={() => {
                          const feedback = prompt('Enter feedback:', part.feedback || '');
                          const rating = prompt('Enter rating (1-5):', part.rating?.toString() || '');
                          if (feedback !== null && rating !== null && !isNaN(parseInt(rating))) {
                            handleFeedbackRating(part.id, feedback, parseInt(rating));
                          }
                        }}
                        disabled={actionLoading === part.id}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        Add Feedback/Rating
                      </button>
                    )}
                    {part.participation_status === 'completed' && (
                      <button
                        onClick={() => handleStatusChange(part.id, 'assigned')}
                        disabled={actionLoading === part.id}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        Reopen
                      </button>
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