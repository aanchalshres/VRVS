'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  UserCheck,
  MapPin,
  CheckCheck,
  Trash2,
  Circle,
  Inbox,
} from 'lucide-react';

interface NgoNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'volunteer_applied' | string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  meta?: {
    volunteer_name?: string;
    task_id?: number;
    task_title?: string;
    application_status?: string;
    application_id?: number;
  };
}

const NOTIF_KEY = 'ngo_notifications';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Mirrors resolveNgoUserId from ApplyPage: the NGO side needs its own id
// to know which notifications belong to it. Stored the same way
// volunteer_profile_id is stored on the volunteer side.
function getCurrentNgoUserId(): number | null {
  const idStr = localStorage.getItem('ngo_user_id');
  if (!idStr) return null;
  const num = Number(idStr);
  return Number.isNaN(num) ? null : num;
}

export default function NgoNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NgoNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [ngoUserId, setNgoUserId] = useState<number | null>(null);

  const load = useCallback(() => {
    const all: NgoNotification[] = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
    const currentId = getCurrentNgoUserId();
    setNgoUserId(currentId);

    // If we can resolve the logged-in NGO's id, only show their notifications.
    // Otherwise (e.g. no auth wired up yet) fall back to showing everything
    // so the page still works during development.
    const scoped = currentId !== null ? all.filter((n) => n.user_id === currentId) : all;
    setNotifications(scoped);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('notifications:updated', load);
    window.addEventListener('storage', load); // cross-tab sync
    return () => {
      window.removeEventListener('notifications:updated', load);
      window.removeEventListener('storage', load);
    };
  }, [load]);

  const persist = (updated: NgoNotification[]) => {
    // Only rewrite the full storage key, preserving notifications
    // belonging to other NGOs when we're scoped to one.
    const all: NgoNotification[] = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
    const otherIds = new Set(updated.map((n) => n.id));
    const untouched = all.filter((n) => !otherIds.has(n.id));
    localStorage.setItem(NOTIF_KEY, JSON.stringify([...updated, ...untouched]));
    window.dispatchEvent(new Event('notifications:updated'));
  };

  const markAsRead = (id: number) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
    );
    setNotifications(updated);
    persist(updated);
  };

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    const updated = notifications.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? now }));
    setNotifications(updated);
    persist(updated);
  };

  const deleteOne = (id: number) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    persist(updated);
  };

  const goToApplication = (n: NgoNotification) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.meta?.task_id) {
      router.push(`/dashboard/ngo/applications?task_id=${n.meta.task_id}`);
    } else {
      router.push('/dashboard/ngo/applications');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const visible = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="min-h-screen bg-[#F0F1F3] flex justify-center p-6">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#4F46C8]" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs font-semibold bg-[#B9455E] text-white rounded-full px-2 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Volunteer applications and task activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-sm font-medium text-[#4F46C8] hover:underline"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                filter === f
                  ? 'bg-[#4F46C8] text-white border-[#4F46C8]'
                  : 'bg-white text-[#6B7280] border-[#CACDD3] hover:border-[#7683D6]'
              }`}
            >
              {f === 'all' ? 'All' : 'Unread'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="bg-white border border-[#CACDD3] rounded-2xl p-8 text-center">
              <Inbox className="h-8 w-8 text-[#CACDD3] mx-auto mb-2" />
              <p className="text-sm text-[#6B7280]">
                No notifications yet. When volunteers apply to your tasks, they'll show up here.
              </p>
            </div>
          )}

          {visible.map((n) => (
            <div
              key={n.id}
              onClick={() => goToApplication(n)}
              className={`relative flex gap-3 rounded-2xl border p-4 cursor-pointer transition shadow-sm ${
                n.is_read
                  ? 'bg-white border-[#CACDD3]'
                  : 'bg-[#4F46C8]/5 border-[#4F46C8]/30'
              }`}
            >
              {!n.is_read && (
                <Circle className="absolute top-4 right-4 h-2 w-2 fill-[#4F46C8] text-[#4F46C8]" />
              )}

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4F46C8]/10">
                <UserCheck className="h-4 w-4 text-[#4F46C8]" />
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{n.title}</p>
                <p className="text-sm text-[#6B7280] mt-0.5">{n.message}</p>

                <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280]">
                  {n.meta?.task_title && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {n.meta.task_title}
                    </span>
                  )}
                  {n.meta?.application_status && (
                    <span className="font-medium capitalize text-[#4F46C8]">
                      {n.meta.application_status}
                    </span>
                  )}
                  <span>{timeAgo(n.created_at)}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteOne(n.id);
                }}
                className="text-[#6B7280] hover:text-[#B9455E] transition self-start"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}