"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { apiGet, apiPut, apiPost } from '@/app/lib/api';
import { User, Lock, Bell, Settings, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});
  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, notifRes, sysRes] = await Promise.all([
        apiGet<any>('/api/admin/settings/profile'),
        apiGet<any>('/api/admin/settings/notification-preferences').catch(() => ({ data: {} })),
        apiGet<any>('/api/admin/settings?group=system').catch(() => ({ data: {} })),
      ]);
      const p = profileRes.data;
      setProfile(p);
      setProfileForm({ name: p.name || '', email: p.email || '', phone: p.phone || '' });
      setNotifPrefs(notifRes.data ?? {});
      setSystemSettings(sysRes.data ?? {});
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiPut('/api/admin/settings/profile', profileForm);
      setProfile(res.data);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiPost('/api/admin/settings/change-password', passwordForm);
      setSuccess('Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifPrefs = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiPut('/api/admin/settings/notification-preferences', { preferences: notifPrefs });
      setSuccess('Notification preferences saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiPut('/api/admin/settings', { group: 'system', settings: systemSettings });
      setSuccess('System settings saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const notifOptions = [
    { key: 'new_ngo_registration', label: 'New NGO Registration' },
    { key: 'ngo_verified', label: 'NGO Verification Updates' },
    { key: 'volunteer_verified', label: 'Volunteer Verification Updates' },
    { key: 'report_submitted', label: 'New Reports Submitted' },
    { key: 'system_events', label: 'System Events' },
  ];

  if (isLoading) {
    return <div className="p-6 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#111827]">Settings</h1><p className="text-sm text-[#6B7280]">Manage your account and system preferences</p></div>
        <Button variant="outline" onClick={fetchData} className="gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700 text-sm">{success}</div>}
      <Card>
        <CardHeader><CardTitle>Settings</CardTitle><CardDescription>Configure your admin account preferences</CardDescription></CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
              <TabsTrigger value="password"><Lock className="w-4 h-4 mr-2" />Password</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
              <TabsTrigger value="system"><Settings className="w-4 h-4 mr-2" />System</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Name</label><Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Email</label><Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Phone</label><Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-2"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Profile'}</Button>
            </TabsContent>

            <TabsContent value="password" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Current Password</label>
                  <div className="relative"><Input type={showPassword ? 'text' : 'password'} value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="pr-10" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">New Password</label>
                  <div className="relative"><Input type={showNewPassword ? 'text' : 'password'} value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="pr-10" />
                    <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Confirm New Password</label>
                  <Input type="password" value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} /></div>
              </div>
              <Button onClick={handleChangePassword} disabled={saving || !passwordForm.current_password || !passwordForm.new_password} className="gap-2"><Lock className="w-4 h-4" />{saving ? 'Changing...' : 'Change Password'}</Button>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-3">{notifOptions.map((opt) => (
                <label key={opt.key} className="flex items-center justify-between p-3 bg-[#F0F1F3] rounded-lg cursor-pointer">
                  <span className="text-sm text-[#111827]">{opt.label}</span>
                  <input type="checkbox" checked={notifPrefs[opt.key] ?? true} onChange={(e) => setNotifPrefs({ ...notifPrefs, [opt.key]: e.target.checked })} className="w-4 h-4 text-[#4F46C8] rounded" />
                </label>
              ))}</div>
              <Button onClick={handleSaveNotifPrefs} disabled={saving} className="gap-2"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Preferences'}</Button>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Platform Name</label>
                  <Input value={systemSettings.platform_name ?? ''} onChange={(e) => setSystemSettings({ ...systemSettings, platform_name: e.target.value })} placeholder="Sahayogi" /></div>
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Support Email</label>
                  <Input value={systemSettings.support_email ?? ''} onChange={(e) => setSystemSettings({ ...systemSettings, support_email: e.target.value })} placeholder="support@sahayogi.com" /></div>
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Max Applications per Task</label>
                  <Input type="number" value={systemSettings.max_applications ?? ''} onChange={(e) => setSystemSettings({ ...systemSettings, max_applications: e.target.value })} placeholder="50" /></div>
                <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Maintenance Mode</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={(systemSettings.maintenance_mode ?? 'false') === 'true'} onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_mode: e.target.checked ? 'true' : 'false' })} className="w-4 h-4 text-[#4F46C8]" /><span className="text-sm text-[#111827]">Enable maintenance mode</span></label></div>
              </div>
              <Button onClick={handleSaveSystem} disabled={saving} className="gap-2"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save System Settings'}</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
