"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton, StatsCardSkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet, apiPost } from '@/app/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import {
  Search,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldX,
  FileText,
  Download,
  Eye,
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function VolunteerVerificationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPending = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGet<any>('/api/admin/volunteer-verification/pending');
      setProfiles(res.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter((p) =>
      (p.name?.toLowerCase() || '').includes(q) ||
      (p.email?.toLowerCase() || '').includes(q)
    );
  }, [profiles, searchQuery]);

  const handleRowClick = async (profile: any) => {
    setSelectedProfile(profile);
    setIsDetailModalOpen(true);
    setRejectionRemarks('');
  };

  const handleApprove = async () => {
    if (!selectedProfile) return;
    setActionLoading(true);
    try {
      await apiPost(`/api/admin/volunteer-verification/${selectedProfile.id}/approve`, {});
      setProfiles((prev) => prev.filter((p) => p.id !== selectedProfile.id));
      setIsDetailModalOpen(false);
      setSelectedProfile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProfile) return;
    setActionLoading(true);
    try {
      await apiPost(`/api/admin/volunteer-verification/${selectedProfile.id}/reject`, {
        remarks: rejectionRemarks || 'No reason provided',
      });
      setProfiles((prev) => prev.filter((p) => p.id !== selectedProfile.id));
      setIsDetailModalOpen(false);
      setSelectedProfile(null);
      setRejectionRemarks('');
    } catch (err: any) {
      setError(err.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: profiles.length,
    pending: profiles.filter((p) => (p.pending_documents_count ?? 0) > 0).length,
  }), [profiles]);

  const columns = [
    {
      key: 'name',
      header: 'Volunteer',
      render: (p: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#111827]">{p.name || 'Unknown'}</p>
            <p className="text-xs text-[#6B7280]">{p.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact',
      render: (p: any) => (
        <div className="flex items-center gap-1 text-sm text-[#6B7280]">
          <Mail className="w-3 h-3" />
          {p.email}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (p: any) => (
        <span className="text-sm text-[#6B7280]">{p.city || p.primary_location || '—'}</span>
      ),
    },
    {
      key: 'documents',
      header: 'Pending Docs',
      render: (p: any) => (
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-600">{p.pending_documents_count ?? 0}</span>
          <span className="text-xs text-[#6B7280]">/ {p.total_documents ?? 0}</span>
        </div>
      ),
    },
    {
      key: 'trust',
      header: 'Trust Score',
      render: (p: any) => (
        <span className="text-sm font-medium text-[#111827]">{p.trust_score ?? '—'}</span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (p: any) => (
        <span className="text-sm text-[#6B7280]">
          {p.joined_at ? new Date(p.joined_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Volunteer Verification</h1>
          <p className="text-sm text-[#6B7280] mt-1">Review and verify volunteer document submissions</p>
        </div>
        <Button variant="outline" onClick={fetchPending} className="gap-2" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <StatsCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-[#6B7280]">Pending Reviews</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-[#6B7280]">Total Requests</p>
            <p className="text-2xl font-bold text-[#111827] mt-1">{stats.total}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <Input placeholder="Search by name or email..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : filteredProfiles.length === 0 ? (
        <EmptyState type="search" title="No Pending Verifications"
          message="All volunteers have been verified. Great job!"
          actionLabel="Refresh" onAction={fetchPending} />
      ) : (
        <DataTable columns={columns} data={filteredProfiles}
          keyExtractor={(p: any) => String(p.id)}
          onRowClick={handleRowClick}
          emptyMessage="No pending verifications"
          showActions={false}
          itemsPerPage={10} />
      )}

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#111827]">
              {selectedProfile?.name || 'Volunteer Verification'}
            </DialogTitle>
            <DialogDescription>
              Review documents and approve or reject verification
            </DialogDescription>
          </DialogHeader>

          {selectedProfile ? (
            <div className="space-y-6 py-4">
              {/* Profile Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Name</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedProfile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Email</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedProfile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Location</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedProfile.city || selectedProfile.primary_location || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Joined</p>
                  <p className="text-sm font-medium text-[#111827] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedProfile.joined_at ? new Date(selectedProfile.joined_at).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              {/* Pending Documents */}
              {selectedProfile.pending_documents?.length > 0 && (
                <div className="border-t border-[#CACDD3] pt-4">
                  <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Pending Documents ({selectedProfile.pending_documents.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedProfile.pending_documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-[#F0F1F3] rounded-lg border border-[#CACDD3]">
                        <div>
                          <p className="text-sm font-medium text-[#111827]">
                            {doc.document_type?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Document'}
                          </p>
                          <p className="text-xs text-[#6B7280]">{doc.original_name || 'No filename'}</p>
                        </div>
                        <div className="flex gap-2">
                          {doc.file_path && (
                            <a href={doc.file_path} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#4F46C8] text-white rounded text-xs font-medium hover:bg-[#3730A3]">
                              <Eye className="w-3 h-3" /> View
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Remarks */}
              <div className="border-t border-[#CACDD3] pt-4">
                <label className="text-xs text-[#6B7280] mb-1 block">Rejection Remarks (required for reject)</label>
                <textarea
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  className="w-full p-3 rounded-md text-sm outline-none border border-[#CACDD3]"
                  style={{ color: '#111827' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#CACDD3] pt-4 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}
                  className="text-sm" disabled={actionLoading}>Close</Button>
                <Button variant="outline" onClick={handleReject}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-sm"
                  disabled={actionLoading}>
                  <XCircle className="w-4 h-4 mr-1" />
                  {actionLoading ? 'Processing...' : 'Reject'}
                </Button>
                <Button onClick={handleApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                  disabled={actionLoading}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {actionLoading ? 'Processing...' : 'Approve'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
