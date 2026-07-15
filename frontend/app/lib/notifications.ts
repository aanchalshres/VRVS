// lib/notifications.ts

export type NotificationType = 'new_task' | 'task_updated' | 'task_cancelled'

export interface VolunteerNotification {
  id: number
  task_id: number
  type: NotificationType
  title: string
  message: string
  location: string | null
  urgency_level: 'low' | 'medium' | 'high'
  read: boolean
  created_at: string
}

const NOTIF_KEY = 'volunteer_notifications'
const NOTIF_EVENT = 'notifications-updated'

export function getNotifications(): VolunteerNotification[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]')
  } catch {
    return []
  }
}

function saveNotifications(notifications: VolunteerNotification[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications))
  window.dispatchEvent(new Event(NOTIF_EVENT))
}

export function addNotification(params: {
  task_id: number
  title: string
  location: string | null
  urgency_level: 'low' | 'medium' | 'high'
  type?: NotificationType
}) {
  const existing = getNotifications()

  const newNotification: VolunteerNotification = {
    id: Date.now(),
    task_id: params.task_id,
    type: params.type || 'new_task',
    title: params.title,
    message: `A new ${params.urgency_level} urgency task "${params.title}" was posted${
      params.location ? ` in ${params.location}` : ''
    }.`,
    location: params.location,
    urgency_level: params.urgency_level,
    read: false,
    created_at: new Date().toISOString(),
  }

  saveNotifications([newNotification, ...existing])
  return newNotification
}

export function markAsRead(id: number) {
  const updated = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  )
  saveNotifications(updated)
}

export function markAllAsRead() {
  const updated = getNotifications().map((n) => ({ ...n, read: true }))
  saveNotifications(updated)
}

export function deleteNotification(id: number) {
  const updated = getNotifications().filter((n) => n.id !== id)
  saveNotifications(updated)
}

export function clearAllNotifications() {
  saveNotifications([])
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length
}

export function subscribeToNotifications(callback: () => void) {
  window.addEventListener(NOTIF_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(NOTIF_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}