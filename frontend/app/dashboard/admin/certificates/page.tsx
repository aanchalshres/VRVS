"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton, StatsCardSkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet } from '@/app/lib/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Search, Filter, RefreshCw, Award, User, Calendar } from 'lucide-react';

export default function CertificatesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [certs, setCerts] = useState<any[]>([]);
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
      const [certsRes, statsRes] = await Promise.all([
        apiGet<any>('/api/admin/certificates'),
        apiGet<any>('/api/admin/certificates/stats').catch(() => null),
      ]);
      setCerts(certsRes.data ?? []);
      setStats(statsRes?.data ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => certs.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (c.volunteer_name?.toLowerCase() || '').includes(q) ||
      (c.task_title?.toLowerCase() || '').includes(q) ||
      (c.issue_number?.toLowerCase() || '').includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  }), [certs, searchQuery, statusFilter]);

  const handleRowClick = async (c: any) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await apiGet<any>(`/api/admin/certificates/${c.id}`);
      setSelected(res.data ?? res);
    } catch { setSelected(c); }
    finally { setDetailLoading(false); }
  };

  const statCards = stats ? [
    { label: 'Total Issued', value: stats.total ?? stats.total_issued ?? 0, color: 'text-[#111827]' },
    { label: 'Pending', value: stats.pending ?? 0, color: 'text-amber-600' },
    { label: 'Verified', value: stats.verified ?? 0, color: 'text-emerald-600' },
  ] : [];

  const statusOpts = ['all', 'issued', 'pending', 'verified', 'revoked'];

  const columns = [
    { key: 'issue', header: 'Issue #', render: (c: any) => <span className="text-sm font-mono text-[#4F46C8]">{c.issue_number || `CERT-${c.id}`}</span> },
    { key: 'volunteer', header: 'Volunteer', render: (c: any) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"><User className="w-3.5 h-3.5 text-white" /></div>
        <span className="text-sm text-[#111827]">{c.volunteer_name || 'Unknown'}</span>
      </div>
    )},
    { key: 'task', header: 'Task', render: (c: any) => <span className="text-sm text-[#111827]">{c.task_title}</span> },
    { key: 'status', header: 'Status', render: (c: any) => <StatusBadge status={c.status || 'unknown'} /> },
    { key: 'issued_on', header: 'Issued', render: (c: any) => (
      <div className="flex items-center gap-1 text-sm text-[#6B7280]"><Calendar className="w-3 h-3" />{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : (c.created_at ? new Date(c.created_at).toLocaleDateString() : '—')}</div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#111827]">Certificate Management</h1><p className="text-sm text-[#6B7280]">Manage volunteer completion certificates</p></div>
        <Button variant="outline" onClick={fetchData} className="gap-2" disabled={isLoading}><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh</Button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <StatsCardSkeleton key={i} />)}</div>
      ) : statCards.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">{statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-[#6B7280]">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}</div>
      ) : null}
      <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
        <div className="flex gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input placeholder="Search by volunteer, task, or issue number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><Filter className="w-4 h-4 mr-2 text-[#6B7280]" /><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{statusOpts.map((s) => (<SelectItem key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? <TableSkeleton rows={5} columns={5} /> : filtered.length === 0 ? (
        <EmptyState type="search" title="No Certificates" message="No certificates match your criteria." actionLabel="Clear Filters" onAction={() => { setSearchQuery(''); setStatusFilter('all'); }} />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(c: any) => String(c.id)} onRowClick={handleRowClick} emptyMessage="No certificates" showActions={false} itemsPerPage={10} />
      )}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Certificate Details</DialogTitle><DialogDescription>Completion certificate information</DialogDescription></DialogHeader>
          {detailLoading ? (
            <div className="space-y-4 py-4">{[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}</div>
          ) : selected ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#6B7280] mb-1">Volunteer</p><p className="text-sm font-medium text-[#111827]">{selected.volunteer?.name || selected.volunteer_name}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Issue Number</p><p className="text-sm font-mono text-[#4F46C8]">{selected.issue_number || `CERT-${selected.id}`}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Task</p><p className="text-sm font-medium text-[#111827]">{selected.task?.title || selected.task_title}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">NGO</p><p className="text-sm font-medium text-[#111827]">{selected.task?.ngo?.organization_name || selected.ngo_name}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Status</p><StatusBadge status={selected.status || 'unknown'} /></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Issued At</p><p className="text-sm text-[#6B7280]">{selected.issued_at ? new Date(selected.issued_at).toLocaleString() : (selected.created_at ? new Date(selected.created_at).toLocaleString() : '—')}</p></div>
                {selected.expires_at && <div><p className="text-xs text-[#6B7280] mb-1">Expires</p><p className="text-sm text-[#6B7280]">{new Date(selected.expires_at).toLocaleDateString()}</p></div>}
              </div>
              {selected.hours_completed && <div className="bg-[#F0F1F3] rounded-lg p-4 text-center"><p className="text-2xl font-bold text-[#4F46C8]">{selected.hours_completed}</p><p className="text-xs text-[#6B7280]">Hours Completed</p></div>}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
