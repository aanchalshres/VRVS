"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton } from '@/app/components/ui-custom/Skeleton';
import { ConfirmationModal } from '@/app/components/ui-custom/ConfirmationModal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/app/lib/api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Search, RefreshCw, Plus, User, Shield, ToggleLeft, ToggleRight, Trash2, Eye, EyeOff } from 'lucide-react';

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGet<any>('/api/admin/admin-users');
      setAdmins(res.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => admins.filter((a) => {
    const q = searchQuery.toLowerCase();
    return a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.phone?.includes(q);
  }), [admins, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
    setIsFormOpen(true);
  };

  const openEdit = (admin: any) => {
    setEditing(admin);
    setForm({ name: admin.name, email: admin.email, phone: admin.phone || '', password: '', password_confirmation: '' });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
      if (!payload.password) { delete payload.password; delete payload.password_confirmation; }
      if (editing) {
        await apiPut(`/api/admin/admin-users/${editing.id}`, payload);
      } else {
        await apiPost('/api/admin/admin-users', payload);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save admin');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (admin: any) => {
    try {
      await apiPost(`/api/admin/admin-users/${admin.id}/toggle-status`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/admin/admin-users/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete admin');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowClick = (a: any) => {
    setSelected(a);
    setIsDetailOpen(true);
  };

  const columns = [
    { key: 'name', header: 'Admin', render: (a: any) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#4F46C8] flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
        <div><p className="text-sm font-medium text-[#111827]">{a.name}</p><p className="text-xs text-[#6B7280]">{a.email}</p></div>
      </div>
    )},
    { key: 'phone', header: 'Phone', render: (a: any) => <span className="text-sm text-[#6B7280]">{a.phone || '—'}</span> },
    { key: 'status', header: 'Status', render: (a: any) => a.is_active ? <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Active</span> : <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Suspended</span> },
    { key: 'last_login', header: 'Last Login', render: (a: any) => <span className="text-xs text-[#6B7280]">{a.last_login_at ? new Date(a.last_login_at).toLocaleString() : 'Never'}</span> },
    { key: 'actions', header: 'Actions', render: (a: any) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(a); }} title="Edit"><Shield className="w-3.5 h-3.5 text-[#4F46C8]" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleToggleStatus(a); }} title={a.is_active ? 'Suspend' : 'Activate'}>{a.is_active ? <ToggleRight className="w-3.5 h-3.5 text-amber-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-emerald-500" />}</Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); setDeleteTarget(a); }} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#111827]">Admin Users</h1><p className="text-sm text-[#6B7280]">Manage administrator accounts</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="gap-2" disabled={isLoading}><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh</Button>
          <Button onClick={openCreate} className="gap-2 bg-[#4F46C8] hover:bg-[#4338CA] text-white"><Plus className="w-4 h-4" />New Admin</Button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}
      <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <Input placeholder="Search by name, email, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
      </div>
      {isLoading ? <TableSkeleton rows={5} columns={5} /> : filtered.length === 0 ? (
        <EmptyState type="search" title="No Admin Users" message="No admin users found." actionLabel="Clear Search" onAction={() => setSearchQuery('')} />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(a: any) => String(a.id)} onRowClick={handleRowClick} emptyMessage="No admins" showActions={false} itemsPerPage={10} />
      )}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader><DialogTitle>{editing ? 'Edit Admin' : 'Create New Admin'}</DialogTitle><DialogDescription>{editing ? 'Update admin account details' : 'Create a new administrator account'}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Email</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Phone</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-[#6B7280] mb-1">{editing ? 'New Password (leave blank to keep current)' : 'Password'}</label>
              <div className="relative"><Input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pr-10" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
            <div><label className="block text-sm font-medium text-[#6B7280] mb-1">Confirm Password</label><Input type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} /></div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#4F46C8] hover:bg-[#4338CA] text-white">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader><DialogTitle>Admin Details</DialogTitle><DialogDescription>Administrator account information</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#4F46C8] flex items-center justify-center"><User className="w-6 h-6 text-white" /></div>
                <div><p className="text-lg font-semibold text-[#111827]">{selected.name}</p><p className="text-sm text-[#6B7280]">{selected.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[#6B7280]">Phone</p><p className="text-[#111827] font-medium">{selected.phone || '—'}</p></div>
                <div><p className="text-[#6B7280]">Role</p><p className="text-[#111827] font-medium capitalize">{selected.role}</p></div>
                <div><p className="text-[#6B7280]">Status</p>{selected.is_active ? <span className="text-emerald-600 font-medium">Active</span> : <span className="text-red-600 font-medium">Suspended</span>}</div>
                <div><p className="text-[#6B7280]">Last Login</p><p className="text-[#111827] font-medium">{selected.last_login_at ? new Date(selected.last_login_at).toLocaleString() : 'Never'}</p></div>
                <div><p className="text-[#6B7280]">Created</p><p className="text-[#111827] font-medium">{selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—'}</p></div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => { setIsDetailOpen(false); openEdit(selected); }}><Shield className="w-3 h-3 mr-1" />Edit</Button>
                <Button variant="outline" size="sm" onClick={() => { handleToggleStatus(selected); }}>{selected.is_active ? <ToggleRight className="w-3 h-3 mr-1" /> : <ToggleLeft className="w-3 h-3 mr-1" />}{selected.is_active ? 'Suspend' : 'Activate'}</Button>
                <Button variant="destructive" size="sm" onClick={() => { setIsDetailOpen(false); setDeleteTarget(selected); }}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmationModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Admin" message={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be undone.`} />
    </div>
  );
}
