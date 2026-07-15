'use client'

import { useEffect, useState } from 'react'
import {
  Bell,
  MapPin,
  Trash2,
  CheckCheck,
  AlertTriangle,
  Circle,
} from 'lucide-react'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  VolunteerNotification,
} from 'app/lib/notifications'

const urgencyStyles = {
  low: { text: 'text-[#4F46C8]', bg: 'bg-[#4F46C8]/10', dot: 'bg-[#4F46C8]' },
  medium: { text: 'text-[#7683D6]', bg: 'bg-[#7683D6]/10', dot: 'bg-[#7683D6]' },
  high: { text: 'text-[#B9455E]', bg: 'bg-[#B9455E]/10', dot: 'bg-[#B9455E]' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function VolunteerNotificationsPage() {
  const [notifications, setNotifications] = useState<VolunteerNotification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = () => setNotifications(getNotifications())

  useEffect(() => {
    load()
    const unsubscribe = subscribeToNotifications(load)
    return unsubscribe
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length
  const visible =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  return (
    <div className="min-h-screen bg-[#F0F1F3] flex justify-center p-6">
      <div className="w-full max-w-2xl">

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
              Stay updated on new volunteer opportunities.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1.5 text-sm font-medium text-[#4F46C8] hover:underline"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

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

        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="bg-white border border-[#CACDD3] rounded-2xl p-8 text-center text-sm text-[#6B7280]">
              No notifications yet. New tasks posted by NGOs will show up here.
            </div>
          )}

          {visible.map((n) => {
            const cfg = urgencyStyles[n.urgency_level]
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`relative flex gap-3 rounded-2xl border p-4 cursor-pointer transition shadow-sm ${
                  n.read
                    ? 'bg-white border-[#CACDD3]'
                    : 'bg-[#4F46C8]/5 border-[#4F46C8]/30'
                }`}
              >
                {!n.read && (
                  <Circle className="absolute top-4 right-4 h-2 w-2 fill-[#4F46C8] text-[#4F46C8]" />
                )}

                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                  <AlertTriangle className={`h-4 w-4 ${cfg.text}`} />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827]">{n.title}</p>
                  <p className="text-sm text-[#6B7280] mt-0.5">{n.message}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280]">
                    {n.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {n.location}
                      </span>
                    )}
                    <span className={`flex items-center gap-1 font-medium ${cfg.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {n.urgency_level}
                    </span>
                    <span>{timeAgo(n.created_at)}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(n.id)
                  }}
                  className="text-[#6B7280] hover:text-[#B9455E] transition self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}