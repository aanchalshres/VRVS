"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton, StatsCardSkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet, apiPost } from '@/app/lib/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { Search, Filter, RefreshCw, Award, User, Calendar, ShieldCheck, ShieldX, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const [authStats, setAuthStats] = useState<any>(null);
  const [authStatuses, setAuthStatuses] = useState<Record<number, any>>({});
  const [revoking, setRevoking] = useState<number | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [certsRes, statsRes, authStatsRes] = await Promise.all([
        apiGet<any>('/api/admin/certificates'),
        apiGet<any>('/api/admin/certificates/stats').catch(() => null),
        apiGet<any>('/api/admin/certificates/auth-analytics').catch(() => null),
      ]);
      setCerts(certsRes.data ?? []);
      setStats(statsRes?.data ?? null);
      setAuthStats(authStatsRes?.data ?? null);

      const statuses: Record<number, any> = {};
      await Promise.all((certsRes.data || []).slice(0, 20).map(async (c: any) => {
        try {
          const res = await apiGet<any>(`/api/admin/certificates/${c.id}/verify`);
          statuses[c.id] = res;
        } catch { statuses[c.id] = null }
      }));
      setAuthStatuses(statuses);
    } catch (err: any) {
      setError(err.message || 'Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => certs.filter((c: any) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (c.volunteer_name?.toLowerCase() || '').includes(q) ||
      (c.task_title?.toLowerCase() || '').includes(q) ||
      (c.certificate_number?.toLowerCase() || '').includes(q);
    return matchSearch;
  }), [certs, searchQuery]);

  const handleRowClick = async (c: any) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setVerifyResult(null);
    try {
      const [certRes, verifyRes] = await Promise.all([
        apiGet<any>(`/api/admin/certificates/${c.id}`),
        apiGet<any>(`/api/admin/certificates/${c.id}/verify`).catch(() => null),
      ]);
      setSelected(certRes.data ?? certRes);
      setVerifyResult(verifyRes);
    } catch { setSelected(c); }
    finally { setDetailLoading(false); }
  };

  const handleRevoke = async () => {
    if (!selected || !revokeReason.trim()) return;
    setRevoking(selected.id);
    try {
      await apiPost(`/api/admin/certificates/${selected.id}/revoke`, { reason: revokeReason });
      toast.success('Certificate revoked');
      setShowRevokeDialog(false);
      setRevokeReason('');
      await fetchData();
      setVerifyResult((prev: any) => ({ ...prev, status: 'revoked', verified: false }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke');
    } finally {
      setRevoking(null);
    }
  };

  const handleRestore = async () => {
    if (!selected) return;
    try {
      await apiPost(`/api/admin/certificates/${selected.id}/restore`, {});
      toast.success('Certificate restored');
      await fetchData();
      setVerifyResult((prev: any) => ({ ...prev, status: 'authentic', verified: true }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore');
    }
  };

  const handleSetupAuth = async (id: number) => {
    try {
      const res = await apiPost<any>(`/api/admin/certificates/${id}/setup-auth`, {});
      toast.success('SHA-256 authentication enabled');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to setup auth');
    }
  };

  const statCards = stats ? [
    { label: 'Total Issued', value: stats.total ?? 0, color: 'text-[#111827]' },
    { label: 'Active (Auth)', value: authStats?.active ?? 0, color: 'text-green-600' },
    { label: 'Revoked', value: authStats?.revoked ?? 0, color: 'text-red-600' },
    { label: 'Total Verifications', value: authStats?.total_verifications ?? 0, color: 'text-[#4F46C8]' },
  ] : [];

  const columns = [
    { key: 'number', header: 'Certificate #', render: (c: any) => <span className="text-sm font-mono text-[#4F46C8]">{c.certificate_number}</span> },
    { key: 'volunteer', header: 'Volunteer', render: (c: any) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"><User className="w-3.5 h-3.5 text-white" /></div>
        <span className="text-sm text-[#111827]">{c.volunteer_name || 'Unknown'}</span>
      </div>
    )},
    { key: 'task', header: 'Task', render: (c: any) => <span className="text-sm text-[#111827]">{c.task_title}</span> },
    { key: 'auth', header: 'Auth', render: (c: any) => {
      const a = authStatuses[c.id];
      if (!a) return <span className="text-xs text-gray-400">—</span>;
      if (a.status === 'revoked') return <StatusBadge status="revoked" />;
      if (a.verified) return <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3" /> Verified</span>;
      if (a.status === 'tampered') return <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Tampered</span>;
      return <span className="text-xs text-gray-400">Pending</span>;
    }},
    { key: 'issued_on', header: 'Issued', render: (c: any) => (
      <div className="flex items-center gap-1 text-sm text-[#6B7280]"><Calendar className="w-3 h-3" />{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : (c.created_at ? new Date(c.created_at).toLocaleDateString() : '—')}</div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#111827]">Certificate Management</h1><p className="text-sm text-[#6B7280]">Manage volunteer completion certificates with SHA-256 authentication</p></div>
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
            <Input placeholder="Search by certificate #, volunteer, or task..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
        </div>
      </div>
      {isLoading ? <TableSkeleton rows={5} columns={5} /> : filtered.length === 0 ? (
        <EmptyState type="search" title="No Certificates" message="No certificates match your criteria." actionLabel="Clear Filters" onAction={() => setSearchQuery('')} />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(c: any) => String(c.id)} onRowClick={handleRowClick} emptyMessage="No certificates" showActions={false} itemsPerPage={10} />
      )}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Certificate Details</DialogTitle><DialogDescription>Completion certificate with authentication status</DialogDescription></DialogHeader>
          {detailLoading ? (
            <div className="space-y-4 py-4">{[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}</div>
          ) : selected ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#6B7280] mb-1">Volunteer</p><p className="text-sm font-medium text-[#111827]">{selected.volunteer?.name || selected.volunteer_name}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Certificate #</p><p className="text-sm font-mono text-[#4F46C8]">{selected.certificate_number}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Task</p><p className="text-sm font-medium text-[#111827]">{selected.task?.title || selected.task_title}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">NGO</p><p className="text-sm font-medium text-[#111827]">{selected.task?.ngo?.organization_name || selected.ngo_name}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Issued At</p><p className="text-sm text-[#6B7280]">{selected.issued_at ? new Date(selected.issued_at).toLocaleString() : (selected.created_at ? new Date(selected.created_at).toLocaleString() : '—')}</p></div>
              </div>

              {/* Verification Result */}
              {verifyResult && (
                <div className={`rounded-xl p-4 border ${verifyResult.status === 'authentic' ? 'bg-green-50 border-green-200' : verifyResult.status === 'revoked' ? 'bg-red-50 border-red-200' : verifyResult.status === 'tampered' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    {verifyResult.status === 'authentic' ? <ShieldCheck className="w-5 h-5 text-green-600" /> : verifyResult.status === 'revoked' ? <ShieldX className="w-5 h-5 text-red-600" /> : <Shield className="w-5 h-5 text-gray-600" />}
                    <span className={verifyResult.status === 'authentic' ? 'text-green-700' : verifyResult.status === 'revoked' ? 'text-red-700' : 'text-gray-700'}>
                      {verifyResult.status === 'authentic' ? 'Authentic' : verifyResult.status === 'revoked' ? 'Revoked' : verifyResult.status === 'tampered' ? 'Tampered' : verifyResult.status === 'expired' ? 'Expired' : 'Not Found'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">{verifyResult.message}</p>
                  {verifyResult.reason && <p className="text-xs text-red-600 mt-1">Reason: {verifyResult.reason}</p>}
                </div>
              )}

              <div className="flex gap-2">
                {(!verifyResult || verifyResult.status === 'authentic') && (
                  <Button variant="destructive" size="sm" onClick={() => setShowRevokeDialog(true)} className="gap-1">
                    <ShieldX className="w-4 h-4" /> Revoke
                  </Button>
                )}
                {verifyResult?.status === 'revoked' && (
                  <Button variant="outline" size="sm" onClick={handleRestore} className="gap-1">
                    <ShieldCheck className="w-4 h-4" /> Restore
                  </Button>
                )}
                {!verifyResult && (
                  <Button variant="outline" size="sm" onClick={() => handleSetupAuth(selected.id)} className="gap-1">
                    <Shield className="w-4 h-4" /> Enable Auth
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader><DialogTitle>Revoke Certificate</DialogTitle><DialogDescription>Enter a reason for revocation</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <textarea value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Reason for revocation..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRevokeDialog(false)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={handleRevoke} disabled={revoking !== null || !revokeReason.trim()}>
                {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {revoking ? 'Revoking...' : 'Revoke Certificate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
