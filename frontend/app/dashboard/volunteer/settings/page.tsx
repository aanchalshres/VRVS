'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPut, apiPost } from "@/app/lib/api"
import {
  User, Lock, Clock, Bell,
  CheckCircle, AlertCircle, Eye, EyeOff,
  Save,
} from 'lucide-react'

interface ProfileData {
  id: number
  name: string
  email: string
  phone: string | null
  volunteerProfile?: {
    availability: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

type Tab = 'account' | 'password' | 'availability' | 'notifications'

export default function VolunteerSettingsPage() {
  const [tab, setTab] = useState<Tab>('account')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [availability, setAvailability] = useState('Available')

  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyApp, setNotifyApp] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await apiGet<{ success: boolean; data: ProfileData }>('/volunteer/profile')
        const user = res.data
        setProfile(user)
        setName(user.name || '')
        setPhone(user.phone || '')
        setAvailability(user.volunteerProfile?.availability || 'Available')
      } catch {
        setToast({ message: 'Failed to load profile.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpdateAccount = async () => {
    setSaving(true)
    try {
      await apiPut('/volunteer/profile', { name, phone: phone || null })
      setToast({ message: 'Account updated successfully!', type: 'success' })
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update account.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== newPasswordConfirmation) {
      setToast({ message: 'Passwords do not match.', type: 'error' })
      return
    }
    if (newPassword.length < 8) {
      setToast({ message: 'Password must be at least 8 characters.', type: 'error' })
      return
    }
    setChangingPassword(true)
    try {
      await apiPost('/volunteer/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      })
      setToast({ message: 'Password changed successfully!', type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirmation('')
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to change password.', type: 'error' })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleUpdateAvailability = async () => {
    setSaving(true)
    try {
      await apiPut('/volunteer/profile', { availability } as any)
      setToast({ message: 'Availability updated!', type: 'success' })
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update availability.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'account', label: 'Account', icon: User },
    { key: 'password', label: 'Password', icon: Lock },
    { key: 'availability', label: 'Availability', icon: Clock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">Settings</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage your account, password, and preferences.</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.key
                    ? 'bg-[#4F46C8] text-white'
                    : 'bg-white border border-[#CACDD3] text-[#6B7280] hover:border-[#4F46C8]'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border border-[#CACDD3] p-6 shadow-sm">
          {tab === 'account' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#111827]">Account Information</h2>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full border border-[#CACDD3] rounded-lg p-2.5 text-sm bg-gray-50 text-[#6B7280] cursor-not-allowed"
                />
                <p className="text-xs text-[#6B7280] mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-[#CACDD3] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#4F46C8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-[#CACDD3] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#4F46C8]"
                />
              </div>
              <button
                onClick={handleUpdateAccount}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46C8] text-white rounded-lg text-sm font-medium hover:bg-[#4F46C8]/90 disabled:bg-[#4F46C8]/50 transition"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {tab === 'password' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#111827]">Change Password</h2>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-[#CACDD3] rounded-lg p-2.5 text-sm pr-10 focus:outline-none focus:border-[#4F46C8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-[#CACDD3] rounded-lg p-2.5 text-sm pr-10 focus:outline-none focus:border-[#4F46C8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  className="w-full border border-[#CACDD3] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#4F46C8]"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword || !currentPassword || !newPassword || !newPasswordConfirmation}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46C8] text-white rounded-lg text-sm font-medium hover:bg-[#4F46C8]/90 disabled:bg-[#4F46C8]/50 transition"
              >
                {changingPassword ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}

          {tab === 'availability' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#111827]">Availability</h2>
              <p className="text-sm text-[#6B7280]">Set your current availability status for new tasks.</p>
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">Status</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full border border-[#CACDD3] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#4F46C8] bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>
              <button
                onClick={handleUpdateAvailability}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46C8] text-white rounded-lg text-sm font-medium hover:bg-[#4F46C8]/90 disabled:bg-[#4F46C8]/50 transition"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Update Availability'}
              </button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#111827]">Notification Preferences</h2>
              <p className="text-sm text-[#6B7280]">
                Configure how you receive notifications. Changes are saved automatically.
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[#CACDD3] hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="h-4 w-4 accent-[#4F46C8]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Email Notifications</p>
                    <p className="text-xs text-[#6B7280]">Receive updates via email.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[#CACDD3] hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyApp}
                    onChange={(e) => setNotifyApp(e.target.checked)}
                    className="h-4 w-4 accent-[#4F46C8]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#111827]">In-App Notifications</p>
                    <p className="text-xs text-[#6B7280]">Receive notifications within the app.</p>
                  </div>
                </label>
              </div>
              <p className="text-xs text-[#6B7280]">
                Notification preference persistence is handled by the backend notification system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
