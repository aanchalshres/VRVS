'use client'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { apiGet } from '@/app/lib/api'

const OrgNavbar = ({ sidebarOpen }: { sidebarOpen?: boolean }) => {
  const { user } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const loadUnreadCount = async () => {
    try {
      const res = await apiGet<{ data: { unread_count: number } }>('/api/ngo/notifications/unread-count')
      setUnreadCount(res.data.unread_count)
    } catch {
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-16 flex items-center justify-end px-4 bg-gray-50/80 border-b border-gray-200">
      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => router.push('/dashboard/ngo/notifications')}
          className="relative p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6 text-gray-900" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => router.push('/dashboard/ngo/profile')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-[#4F46C8] transition-all cursor-pointer"
          title={user?.name || 'Profile'}
        >
          <div className="w-8 h-8 rounded-full bg-[#4F46C8] flex items-center justify-center text-white font-semibold text-xs">
            {getInitials(user?.name)}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-900 truncate max-w-25">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-[#6B7280] leading-none">
              {user?.role === 'ngo' ? 'NGO' : user?.role}
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}

export default OrgNavbar
