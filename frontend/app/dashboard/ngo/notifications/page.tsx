'use client'
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '@/app/lib/api'
import { Bell, UserCheck, CheckCheck, Trash2, Circle, Inbox } from 'lucide-react'

interface NgoNotification {
  id: number
  user_id: number
  title: string
  message: string
  type: string
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
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

export default function NgoNotificationsPage() {
  const [notifications, setNotifications] = useState<NgoNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = async () => {
    try {
      setLoading(true)
      const res = await apiGet<{ data: NgoNotification[] }>('/api/ngo/notifications')
      setNotifications(res.data)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const markAsRead = async (id: number) => {
    try {
      await apiPost(`/api/ngo/notifications/${id}/read`, {})
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)))
    } catch {}
  }

  const markAllAsRead = async () => {
    try {
      await apiPost('/api/ngo/notifications/read-all', {})
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() })))
    } catch {}
  }

  const deleteOne = async (id: number) => {
    try {
      await apiDelete(`/api/ngo/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const visible = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#4F46C8]" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs font-semibold bg-red-500 text-white rounded-full px-2 py-0.5">{unreadCount} new</span>
              )}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">Volunteer applications and task activity.</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-1.5 text-sm font-medium text-[#4F46C8] hover:underline">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'unread'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${filter === f ? 'bg-[#4F46C8] text-white border-[#4F46C8]' : 'bg-white text-[#6B7280] border-gray-200 hover:border-[#7683D6]'}`}>
              {f === 'all' ? 'All' : 'Unread'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
          </div>
        ) : (
          <div className="space-y-3">
            {visible.length === 0 && (
              <div className="bg-white border border-black/5 rounded-2xl p-8 text-center">
                <Inbox className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-[#6B7280]">No notifications yet.</p>
              </div>
            )}
            {visible.map((n) => (
              <div key={n.id} className={`relative flex gap-3 rounded-2xl border p-4 shadow-sm ${n.is_read ? 'bg-white border-black/5' : 'bg-[#4F46C8]/5 border-[#4F46C8]/30'}`}>
                {!n.is_read && <Circle className="absolute top-4 right-4 h-2 w-2 fill-[#4F46C8] text-[#4F46C8]" />}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4F46C8]/10">
                  <UserCheck className="h-4 w-4 text-[#4F46C8]" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-[#6B7280] mt-0.5">{n.message}</p>
                  <p className="text-xs text-[#6B7280] mt-2">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markAsRead(n.id)} className="text-xs text-[#4F46C8] hover:underline self-start shrink-0">
                    Read
                  </button>
                )}
                <button onClick={() => deleteOne(n.id)} className="text-[#6B7280] hover:text-red-500 transition self-start shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
