"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet, apiPost, apiDelete } from '@/app/lib/api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Bell, CheckCheck, RefreshCw, Trash2, Mail, MailOpen, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGet<any>(`/api/admin/notifications?per_page=20&page=${page}`);
      setNotifications(res.data ?? []);
      setPagination({
        currentPage: res.current_page ?? 1,
        lastPage: res.last_page ?? 1,
        total: res.total ?? 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await apiPost(`/api/admin/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
    } catch { }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiPost('/api/admin/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    } catch { }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/api/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (selected?.id === id) setIsDetailOpen(false);
    } catch { }
  };

  const handleRowClick = async (n: any) => {
    setSelected(n);
    setIsDetailOpen(true);
    if (!n.is_read) handleMarkRead(n.id);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const columns = [
    { key: 'status', header: '', render: (n: any) => n.is_read ? <MailOpen className="w-4 h-4 text-[#6B7280]" /> : <Mail className="w-4 h-4 text-[#4F46C8]" /> },
    { key: 'title', header: 'Title', render: (n: any) => (
      <div><p className={`text-sm ${n.is_read ? 'text-[#6B7280]' : 'text-[#111827] font-medium'}`}>{n.title}</p><p className="text-xs text-[#9CA3AF] truncate max-w-xs">{n.message}</p></div>
    )},
    { key: 'type', header: 'Type', render: (n: any) => (
      <span className="text-xs px-2 py-1 rounded-full bg-[#E8EAFB] text-[#4F46C8]">{n.type}</span>
    )},
    { key: 'time', header: 'Time', render: (n: any) => (
      <div className="flex items-center gap-1 text-xs text-[#6B7280]"><Clock className="w-3 h-3" />{n.created_at ? new Date(n.created_at).toLocaleString() : '—'}</div>
    )},
    { key: 'actions', header: '', render: (n: any) => (
      <div className="flex gap-1">
        {!n.is_read && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }} title="Mark read"><CheckCheck className="w-3.5 h-3.5 text-[#4F46C8]" /></Button>}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#111827]">Notifications</h1><p className="text-sm text-[#6B7280]">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}</p></div>
        <div className="flex gap-2">
          {unreadCount > 0 && <Button variant="outline" onClick={handleMarkAllRead} className="gap-2"><CheckCheck className="w-4 h-4" />Mark All Read</Button>}
          <Button variant="outline" onClick={() => fetchData(currentPage)} className="gap-2" disabled={isLoading}><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh</Button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}
      {isLoading ? (
        <TableSkeleton rows={8} columns={4} />
      ) : notifications.length === 0 ? (
        <EmptyState type="generic" title="No Notifications" message="You have no notifications yet." />
      ) : (
        <DataTable columns={columns} data={notifications} keyExtractor={(n: any) => String(n.id)} onRowClick={handleRowClick} emptyMessage="No notifications" showActions={false} itemsPerPage={20} />
      )}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle><DialogDescription>Notification details</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-[#111827] bg-[#F0F1F3] p-4 rounded-lg">{selected.message}</p>
              <div className="flex justify-between text-xs text-[#6B7280]">
                <span>Type: {selected.type}</span>
                <span>{selected.created_at ? new Date(selected.created_at).toLocaleString() : ''}</span>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                {!selected.is_read && <Button variant="outline" size="sm" onClick={() => { handleMarkRead(selected.id); }}><CheckCheck className="w-3 h-3 mr-1" />Mark Read</Button>}
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selected.id)}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
