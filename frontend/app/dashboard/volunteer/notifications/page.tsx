'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '@/app/lib/api'
import {
  Bell,
  MapPin,
  Trash2,
  CheckCheck,
  AlertTriangle,
  Circle,
} from 'lucide-react'

interface NotificationItem {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  read_at: string | null
  created_at: string
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = async () => {
    try {
      const res = await apiGet<{ data: NotificationItem[] }>('/volunteer/notifications')
      setNotifications(res.data ?? [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await apiPost(`/volunteer/notifications/${id}/read`, {})
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      )
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await apiPost('/volunteer/notifications/read-all', {})
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/volunteer/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const visible = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading notifications...</p>
        </div>
      </div>
    )
  }

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
              onClick={handleMarkAllRead}
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

          {visible.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
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
                <AlertTriangle className="h-4 w-4 text-[#4F46C8]" />
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{n.title}</p>
                <p className="text-sm text-[#6B7280] mt-0.5">{n.message}</p>

                <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280]">
                  <span>{timeAgo(n.created_at)}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(n.id)
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
  )
}
