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
import { ConfirmationModal } from '@/app/components/ui-custom/ConfirmationModal';
import { Search, Filter, RefreshCw, Star, Trash2, User } from 'lucide-react';

export default function ReviewsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [revRes, statsRes] = await Promise.all([
        apiGet<any>('/api/admin/reviews'),
        apiGet<any>('/api/admin/reviews/stats').catch(() => null),
      ]);
      setReviews(revRes.data ?? []);
      setStats(statsRes?.data ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (r.reviewer_name?.toLowerCase() || '').includes(q) ||
      (r.reviewee_name?.toLowerCase() || '').includes(q) ||
      (r.comment?.toLowerCase() || '').includes(q);
    const matchRating = ratingFilter === 'all' || String(r.rating) === ratingFilter;
    return matchSearch && matchRating;
  }), [reviews, searchQuery, ratingFilter]);

  const handleRowClick = async (r: any) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await apiGet<any>(`/api/admin/reviews/${r.id}`);
      setSelected(res.data ?? res);
    } catch { setSelected(r); }
    finally { setDetailLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/admin/reviews/${deleteTarget.id}`);
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      if (selected?.id === deleteTarget.id) setIsDetailOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  const ratingOpts = ['all', '5', '4', '3', '2', '1'];

  const statCards = stats ? [
    { label: 'Total Reviews', value: stats.total ?? stats.total_reviews ?? 0, color: 'text-[#111827]' },
    { label: 'Avg Rating', value: typeof stats.average_rating === 'number' ? stats.average_rating.toFixed(1) : (stats.avg_rating?.toFixed(1) ?? '—'), color: 'text-amber-500' },
    { label: '5-Star', value: stats.five_star ?? stats.rating_5 ?? 0, color: 'text-emerald-600' },
    { label: 'Flagged', value: stats.flagged ?? 0, color: 'text-red-600' },
  ] : [];

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
    ))}</div>
  );

  const columns = [
    { key: 'reviewer', header: 'Reviewer', render: (r: any) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#4F46C8] flex items-center justify-center"><User className="w-3.5 h-3.5 text-white" /></div>
        <span className="text-sm text-[#111827]">{r.reviewer_name || 'Unknown'}</span>
      </div>
    )},
    { key: 'rating', header: 'Rating', render: (r: any) => renderStars(r.rating) },
    { key: 'comment', header: 'Comment', render: (r: any) => (
      <span className="text-sm text-[#6B7280] truncate max-w-[200px] inline-block">{r.comment || '—'}</span>
    )},
    { key: 'target', header: 'Target', render: (r: any) => <span className="text-sm text-[#111827]">{r.reviewee_name || '—'}</span> },
    { key: 'actions', header: 'Actions', render: (r: any) => (
      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}>
        <Trash2 className="w-4 h-4" />
      </Button>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#111827]">Ratings &amp; Reviews</h1><p className="text-sm text-[#6B7280]">Moderate user-submitted reviews across the platform</p></div>
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
            <Input placeholder="Search by reviewer, target, or comment..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-36"><Filter className="w-4 h-4 mr-2 text-[#6B7280]" /><SelectValue placeholder="Rating" /></SelectTrigger>
            <SelectContent>{ratingOpts.map((r) => (<SelectItem key={r} value={r}>{r === 'all' ? 'All Ratings' : `${r} Star${r !== '1' ? 's' : ''}`}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? <TableSkeleton rows={5} columns={5} /> : filtered.length === 0 ? (
        <EmptyState type="search" title="No Reviews" message="No reviews match your criteria." actionLabel="Clear Filters" onAction={() => { setSearchQuery(''); setRatingFilter('all'); }} />
      ) : (
        <DataTable columns={columns} data={filtered} keyExtractor={(r: any) => String(r.id)} onRowClick={handleRowClick} emptyMessage="No reviews" showActions={false} itemsPerPage={10} />
      )}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Review Details</DialogTitle><DialogDescription>Review information</DialogDescription></DialogHeader>
          {detailLoading ? (
            <div className="space-y-4 py-4">{[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}</div>
          ) : selected ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#6B7280] mb-1">Reviewer</p><p className="text-sm font-medium text-[#111827]">{selected.reviewer?.name || selected.reviewer_name}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Reviewer Role</p><p className="text-sm text-[#6B7280]">{selected.reviewer_role || (selected.reviewer?.role || '—')}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Target</p><p className="text-sm font-medium text-[#111827]">{selected.reviewee?.name || selected.reviewee_name}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Rating</p><div className="flex gap-1">{renderStars(selected.rating)}<span className="text-sm text-[#6B7280] ml-1">({selected.rating}/5)</span></div></div>
                <div className="col-span-2"><p className="text-xs text-[#6B7280] mb-1">Comment</p><p className="text-sm p-3 bg-[#F0F1F3] rounded-lg">{selected.comment || 'No comment'}</p></div>
                <div><p className="text-xs text-[#6B7280] mb-1">Created</p><p className="text-sm text-[#6B7280]">{selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}</p></div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                <Button variant="destructive" onClick={() => { setIsDetailOpen(false); setDeleteTarget(selected); }} className="gap-2"><Trash2 className="w-4 h-4" />Remove Review</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Remove Review"
        message={`Are you sure you want to permanently remove this review? This action cannot be undone.`}
      />
    </div>
  );
}
