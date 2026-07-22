"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet } from '@/app/lib/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { Search, Filter, RefreshCw, Clock, User, Activity } from 'lucide-react';

export default function ActivityLogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ per_page: '30', page: String(page) });
      if (searchQuery) params.set('search', searchQuery);
      if (moduleFilter !== 'all') params.set('module', moduleFilter);
      if (actionFilter !== 'all') params.set('action', actionFilter);
      const res = await apiGet<any>(`/api/admin/activity-logs?${params}`);
      setLogs(res.data ?? []);
      setPagination({
        currentPage: res.current_page ?? 1,
        lastPage: res.last_page ?? 1,
        total: res.total ?? 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [modRes, actRes] = await Promise.all([
        apiGet<any>('/api/admin/activity-logs/modules'),
        apiGet<any>('/api/admin/activity-logs/actions'),
      ]);
      setModules(modRes.data ?? []);
      setActions(actRes.data ?? []);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    fetchFilters();
  }, []);

  const handleSearch = () => fetchData(1);

  const actionLabels: Record<string, string> = {
    verified_ngo: 'Verified NGO',
    rejected_ngo: 'Rejected NGO',
    suspended_ngo: 'Suspended NGO',
    activated_ngo: 'Activated NGO',
    deleted_ngo: 'Deleted NGO',
    verified_volunteer: 'Verified Volunteer',
    created_admin: 'Created Admin',
    updated_admin: 'Updated Admin',
    suspended_admin: 'Suspended Admin',
    activated_admin: 'Activated Admin',
    deleted_admin: 'Deleted Admin',
    resolved_report: 'Resolved Report',
    removed_review: 'Removed Review',
    updated_settings: 'Updated Settings',
    exported_data: 'Exported Data',
    changed_password: 'Changed Password',
    issued: 'Issued',
  };

  const columns = [
    { key: 'user', header: 'Admin', render: (l: any) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#4F46C8] flex items-center justify-center"><User className="w-3.5 h-3.5 text-white" /></div>
        <span className="text-sm text-[#111827]">{l.user?.name || 'System'}</span>
      </div>
    )},
    { key: 'action', header: 'Action', render: (l: any) => (
      <span className="text-xs px-2 py-1 rounded-full bg-[#E8EAFB] text-[#4F46C8] whitespace-nowrap">{actionLabels[l.action] || l.action}</span>
    )},
    { key: 'module', header: 'Module', render: (l: any) => (
      <span className="text-xs capitalize text-[#6B7280]">{l.module || '—'}</span>
    )},
    { key: 'description', header: 'Description', render: (l: any) => <span className="text-sm text-[#111827]">{l.description || '—'}</span> },
    { key: 'time', header: 'Timestamp', render: (l: any) => (
      <div className="flex items-center gap-1 text-sm text-[#6B7280] whitespace-nowrap"><Clock className="w-3 h-3" />{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</div>
    )},
    { key: 'ip', header: 'IP', render: (l: any) => <span className="text-xs font-mono text-[#9CA3AF]">{l.ip_address || '—'}</span> },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#111827]">Activity Log</h1><p className="text-sm text-[#6B7280]">{pagination ? `${pagination.total} recorded activities` : 'Track administrative actions'}</p></div>
        <Button variant="outline" onClick={() => fetchData(pagination?.currentPage)} className="gap-2" disabled={isLoading}><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh</Button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}
      <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
        <div className="flex gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input placeholder="Search activities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pl-10" /></div>
          <Select value={moduleFilter} onValueChange={(v) => { setModuleFilter(v); fetchData(1); }}>
            <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2 text-[#6B7280]" /><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Modules</SelectItem>{modules.map((m) => (<SelectItem key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); fetchData(1); }}>
            <SelectTrigger className="w-40"><Activity className="w-4 h-4 mr-2 text-[#6B7280]" /><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Actions</SelectItem>{actions.map((a) => (<SelectItem key={a} value={a}>{actionLabels[a] || a.replace(/_/g, ' ')}</SelectItem>))}</SelectContent>
          </Select>
          <Button variant="secondary" onClick={handleSearch}>Search</Button>
        </div>
      </div>
      {isLoading ? <TableSkeleton rows={10} columns={6} /> : logs.length === 0 ? (
        <EmptyState type="search" title="No Activities" message="No activity logs found matching your criteria." actionLabel="Clear Filters" onAction={() => { setSearchQuery(''); setModuleFilter('all'); setActionFilter('all'); fetchData(1); }} />
      ) : (
        <DataTable columns={columns} data={logs} keyExtractor={(l: any) => String(l.id)} emptyMessage="No activities" showActions={false} itemsPerPage={30} />
      )}
    </div>
  );
}
