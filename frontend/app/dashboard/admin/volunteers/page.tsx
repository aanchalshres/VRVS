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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import {
  Search,
  Filter,
  Users,
  MapPin,
  RefreshCw,
  Star,
  Clock,
  Award,
  Mail,
  Phone,
  Calendar,
  Shield,
  BookOpen,
} from 'lucide-react';

export default function VolunteersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [docFilter, setDocFilter] = useState<string>('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVolunteers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGet<any>('/api/admin/volunteers');
      setVolunteers(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load volunteers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v) => {
      const matchesSearch =
        (v.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.city?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesAvailability = availabilityFilter === 'all' || v.availability === availabilityFilter;
      const matchesDoc = docFilter === 'all' || v.document_status === docFilter;
      return matchesSearch && matchesAvailability && matchesDoc;
    });
  }, [volunteers, searchQuery, availabilityFilter, docFilter]);

  const stats = useMemo(() => ({
    total: volunteers.length,
    verified: volunteers.filter((v) => v.document_status === 'verified').length,
    pending: volunteers.filter((v) => v.document_status === 'pending').length,
    available: volunteers.filter((v) => v.availability === 'Available').length,
  }), [volunteers]);

  const handleRowClick = async (volunteer: any) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await apiGet<any>(`/api/admin/volunteers/${volunteer.id}`);
      setSelectedVolunteer(res.data ?? res);
    } catch (err: any) {
      setSelectedVolunteer(volunteer);
    } finally {
      setDetailLoading(false);
    }
  };

  const docStatusColor: Record<string, string> = {
    verified: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    none: 'bg-gray-100 text-gray-600',
  };

  const availabilityColor: Record<string, string> = {
    Available: 'text-emerald-600',
    Unavailable: 'text-red-600',
    Busy: 'text-amber-600',
  };

  const columns = [
    {
      key: 'name',
      header: 'Volunteer',
      render: (v: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#4F46C8] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#111827]">{v.name || 'Unknown'}</p>
            <p className="text-xs text-[#6B7280]">{v.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      render: (v: any) => (
        <div className="flex items-center gap-1 text-sm text-[#6B7280]">
          <MapPin className="w-3 h-3" />
          {v.city || v.primary_location || '—'}
        </div>
      ),
    },
    {
      key: 'availability',
      header: 'Status',
      render: (v: any) => (
        <span className={`text-sm font-medium ${availabilityColor[v.availability] || 'text-gray-500'}`}>
          {v.availability || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'documents',
      header: 'Documents',
      render: (v: any) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${docStatusColor[v.document_status] || 'bg-gray-100 text-gray-600'}`}>
          {v.document_status ? v.document_status.charAt(0).toUpperCase() + v.document_status.slice(1) : 'None'}
        </span>
      ),
    },
    {
      key: 'hours',
      header: 'Hours',
      render: (v: any) => (
        <div className="flex items-center gap-1 text-sm text-[#6B7280]">
          <Clock className="w-3 h-3" />
          {v.total_service_hours ?? 0}
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (v: any) => (
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-3 h-3 text-amber-400" />
          {v.average_rating ? v.average_rating.toFixed(1) : '—'}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Volunteer Management</h1>
          <p className="text-sm text-[#6B7280] mt-1">View and manage all registered volunteers</p>
        </div>
        <Button variant="outline" onClick={fetchVolunteers} className="gap-2" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-[#6B7280]">Total Volunteers</p>
            <p className="text-2xl font-bold text-[#111827] mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-[#6B7280]">Document Verified</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.verified}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-[#6B7280]">Pending Docs</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-[#6B7280]">Available</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.available}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input placeholder="Search by name, email, or city..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-3">
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-36">
                <Filter className="w-4 h-4 mr-2 text-[#6B7280]" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Busy">Busy</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={docFilter} onValueChange={setDocFilter}>
              <SelectTrigger className="w-36">
                <Shield className="w-4 h-4 mr-2 text-[#6B7280]" />
                <SelectValue placeholder="Documents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : filteredVolunteers.length === 0 ? (
        <EmptyState type="search" title="No Volunteers Found"
          message="No volunteers match your search criteria."
          actionLabel="Clear Filters" onAction={() => { setSearchQuery(''); setAvailabilityFilter('all'); setDocFilter('all'); }} />
      ) : (
        <DataTable columns={columns} data={filteredVolunteers}
          keyExtractor={(v: any) => String(v.id)}
          onRowClick={handleRowClick}
          emptyMessage="No volunteers found"
          showActions={false}
          itemsPerPage={10} />
      )}

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#111827]">
              {selectedVolunteer?.name || 'Volunteer Details'}
            </DialogTitle>
            <DialogDescription>Volunteer profile and service summary</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-4">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}
            </div>
          ) : selectedVolunteer ? (
            <div className="space-y-6 py-4">
              {/* Profile Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Name</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedVolunteer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Email</p>
                  <p className="text-sm font-medium text-[#111827] flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {selectedVolunteer.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Phone</p>
                  <p className="text-sm font-medium text-[#111827] flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedVolunteer.phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Location</p>
                  <p className="text-sm font-medium text-[#111827] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedVolunteer.city || selectedVolunteer.primary_location || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Joined</p>
                  <p className="text-sm font-medium text-[#111827] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {selectedVolunteer.joined_at ? new Date(selectedVolunteer.joined_at).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Availability</p>
                  <p className={`text-sm font-medium ${availabilityColor[selectedVolunteer.availability] || 'text-gray-500'}`}>
                    {selectedVolunteer.availability || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Skills */}
              {selectedVolunteer.skills?.length > 0 && (
                <div className="border-t border-[#CACDD3] pt-4">
                  <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#4F46C8]" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVolunteer.skills.map((s: any) => (
                      <span key={s.id} className="px-3 py-1 bg-[#E8EAFB] text-[#4F46C8] rounded-full text-xs font-medium">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Summary */}
              <div className="border-t border-[#CACDD3] pt-4">
                <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" /> Service Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#F0F1F3] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#111827]">{selectedVolunteer.total_service_hours ?? 0}</p>
                    <p className="text-xs text-[#6B7280]">Total Hours</p>
                  </div>
                  <div className="bg-[#F0F1F3] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#111827]">{selectedVolunteer.service_summary?.completed_activities ?? 0}</p>
                    <p className="text-xs text-[#6B7280]">Completed</p>
                  </div>
                  <div className="bg-[#F0F1F3] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#111827]">{selectedVolunteer.average_rating ? selectedVolunteer.average_rating.toFixed(1) : '—'}</p>
                    <p className="text-xs text-[#6B7280]">Avg Rating</p>
                  </div>
                </div>
              </div>

              {/* Recent Applications */}
              {selectedVolunteer.applications?.length > 0 && (
                <div className="border-t border-[#CACDD3] pt-4">
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Recent Applications</h3>
                  <div className="space-y-2">
                    {selectedVolunteer.applications.slice(0, 5).map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-[#F0F1F3] rounded-lg">
                        <span className="text-sm text-[#111827]">{app.task_title || `Task #${app.task_id}`}</span>
                        <StatusBadge status={app.status?.toLowerCase() || 'unknown'} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
