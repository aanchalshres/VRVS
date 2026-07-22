"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton, StatsCardSkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet, apiDelete } from '@/app/lib/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Search, Filter, RefreshCw, Briefcase, User, Star, Calendar } from 'lucide-react';

export default function ApplicationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [appRes, statsRes] = await Promise.all([
        apiGet<any>('/api/admin/applications'),
        apiGet<any>('/api/admin/applications/stats').catch(() => null),
      ]);
      setApps(appRes.data ?? []);
      setStats(statsRes?.data ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => apps.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (a.volunteer_name?.toLowerCase() || '').includes(q) ||
      (a.task_title?.toLowerCase() || '').includes(q) ||
      (a.ngo_name?.toLowerCase() || '').includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  }), [apps, searchQuery, statusFilter]);

  const handleRowClick = async (a: any) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await apiGet<any>(`/api/admin/applications/${a.id}`);
      setSelected(res.data ?? res);
    } catch { setSelected(a); }
    finally { setDetailLoading(false); }
  };

  const statusOpts = ['all', 'Pending', 'Accepted', 'Rejected', 'Cancelled'];
  const statCards = stats ? [
    { label: 'Total', value: stats.total, color: 'text-[#111827]' },
    { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
    { label: 'Accepted', value: stats.accepted, color: 'text-emerald-600' },
    { label: 'Rejected', value: stats.rejected, color: 'text-red-600' },
  ] : [];

  const columns = [
    { key: 'task', header: 'Opportunity', render: (a: any) => (
      <div><p className="text-sm font-medium text-[#111827]">{a.task_title}</p><p className="text-xs text-[#6B7280]">{a.ngo_name}</p></div>
    )},
    { key: 'volunteer', header: 'Volunteer', render: (a: any) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#4F46C8] flex items-center justify-center"><User className="w-3.5 h-3.5 text-white" /></div>
        <span className="text-sm text-[#111827]">{a.volunteer_name || 'Unknown'}</span>
      </div>
    )},
    { key: 'status', header: 'Status', render: (a: any) => <StatusBadge status={a.status?.toLowerCase() || 'unknown'} /> },
    { key: 'score', header: 'Score', render: (a: any) => (
      <div className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /><span className="text-sm text-[#6B7280]">{a.recommendation_score?.toFixed(2) ?? '—'}</span></div>
    )},
    { key: 'applied', header: 'Applied', render: (a: any) => (
      <div className="flex items-center gap-1 text-sm text-[#6B7280]"><Calendar className="w-3 h-3" />{a.applied_at ? new Date(a.applied_at).toLocaleDateString() : '—'}</div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#111827]">Applications</h1><p className="text-sm text-[#6B7280]">All volunteer applications across the platform</p></div>
        <Button variant="outline" onClick={fetchData} className="gap-2" disabled={isLoading}><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh</Button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}</div>
      ) : statCards.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">{statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-[#6B7280]">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}</div>
      ) : null}
      <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
        <div className="flex gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input placeholder="Search by volunteer, task, or NGO..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><Filter className="w-4 h-4 mr-2 text-[#6B7280]" /><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{statusOpts.map((s) => (<SelectItem key={s} value={s}>{s === 'all' ? 'All Status' : s}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? <TableSkeleton rows={5} columns={5} /> : filtered.length === 0 ? (
        <EmptyState type="search" title="No Applications" message="No applications match your criteria." actionLabel="Clear Filters" onAction={() => { setSearchQuery(''); setStatusFilter('all'); }} />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(a: any) => String(a.id)} onRowClick={handleRowClick} emptyMessage="No applications" showActions={false} itemsPerPage={10} />
      )}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Application Details</DialogTitle><DialogDescription>Volunteer application information</DialogDescription></DialogHeader>
          {detailLoading ? (
            <div className="space-y-4 py-4">{[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}</div>
          ) : selected ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#6B7280] mb-1">Task</p><p className="text-sm font-medium text-[#111827]">{selected.task?.title || selected.task_title}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">NGO</p><p className="text-sm font-medium text-[#111827]">{selected.task?.ngo?.organization_name || selected.ngo_name}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Volunteer</p><p className="text-sm font-medium text-[#111827]">{selected.volunteer?.name || selected.volunteer_name}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Email</p><p className="text-sm font-medium text-[#111827]">{selected.volunteer?.email || selected.volunteer_email}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Status</p><StatusBadge status={(selected.status || '').toLowerCase()} /></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Applied</p><p className="text-sm text-[#6B7280]">{selected.applied_at ? new Date(selected.applied_at).toLocaleString() : '—'}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Score</p><p className="text-sm text-[#6B7280]">{selected.recommendation_score?.toFixed(2) ?? '—'}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Reviewed By</p><p className="text-sm text-[#6B7280]">{selected.reviewed_by || 'Not reviewed'}</p></div>
              </div>
              {selected.remarks && <div><p className="text-xs text-[#6B7280] mb-1">Remarks</p><p className="text-sm p-3 bg-[#F0F1F3] rounded-lg">{selected.remarks}</p></div>}
              {selected.volunteer?.skills?.length > 0 && (
                <div><p className="text-xs text-[#6B7280] mb-1">Volunteer Skills</p><div className="flex flex-wrap gap-2">{selected.volunteer.skills.map((s: any) => (
                  <span key={s.id} className="px-2 py-1 bg-[#E8EAFB] text-[#4F46C8] rounded-full text-xs">{s.name}</span>
                ))}</div></div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
