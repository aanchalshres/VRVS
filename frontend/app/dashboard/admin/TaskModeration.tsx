"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Task } from '@/app/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTable } from '@/app/components/ui-custom/DataTable';
import { StatusBadge } from '@/app/components/ui-custom/StatusBadge';
import { ConfirmationModal } from '@/app/components/ui-custom/ConfirmationModal';
import { EmptyState } from '@/app/components/ui-custom/EmptyState';
import { TableSkeleton, StatsCardSkeleton } from '@/app/components/ui-custom/Skeleton';
import { apiGet, apiDelete } from '@/app/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Search,
  Filter,
  Trash2,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Tag,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';

const statusMap: Record<string, string> = {
  'Open': 'active',
  'active': 'active',
  'Draft': 'pending',
  'pending': 'pending',
  'Completed': 'completed',
  'completed': 'completed',
  'Cancelled': 'removed',
  'cancelled': 'removed',
};

function mapTask(raw: any): Task {
  return {
    id: String(raw.id),
    title: raw.title,
    ngoId: String(raw.ngo?.id ?? ''),
    ngoName: raw.ngo?.organization_name ?? 'Unknown',
    category: raw.category?.name ?? '',
    district: raw.city ?? raw.location ?? '',
    description: raw.description ?? '',
    quota: raw.required_volunteers ?? 0,
    filledQuota: raw.applications?.filter((a: any) => a.status === 'Accepted').length ?? 0,
    status: (statusMap[raw.status] ?? 'pending') as Task['status'],
    createdAt: raw.created_at ?? '',
    startDate: raw.start_date ? raw.start_date.split('T')[0] : '',
    endDate: raw.end_date ? raw.end_date.split('T')[0] : '',
  };
}

export function TaskModeration() {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGet<any>('/api/admin/task-moderation');
      const data = res.data ?? res ?? [];
      setTasks(Array.isArray(data) ? data.map(mapTask) : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(tasks.map(t => t.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [tasks]);

  const districts = useMemo(() => {
    const set = new Set(tasks.map(t => t.district).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.ngoName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      const matchesDistrict = districtFilter === 'all' || task.district === districtFilter;
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchesSearch && matchesCategory && matchesDistrict && matchesStatus;
    });
  }, [tasks, searchQuery, categoryFilter, districtFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      active: tasks.filter((t) => t.status === 'active').length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      removed: tasks.filter((t) => t.status === 'removed').length,
    };
  }, [tasks]);

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleView = (task: Task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTask) return;
    setIsProcessing(true);
    try {
      await apiDelete(`/api/admin/tasks/${selectedTask.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDistrictFilter('all');
    setStatusFilter('all');
  };

  const columns = [
    {
      key: 'title',
      header: 'Task',
      render: (task: Task) => (
        <div>
          <p className="text-sm font-medium text-[#111827]">{task.title}</p>
          <p className="text-xs text-[#6B7280]">{task.ngoName}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (task: Task) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#9FA8DA] text-[#4F46C8]">
          <Tag className="w-3 h-3" />
          {task.category}
        </span>
      ),
    },
    {
      key: 'district',
      header: 'District',
      render: (task: Task) => (
        <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
          <MapPin className="w-4 h-4 text-[#6B7280]" />
          {task.district}
        </div>
      ),
    },
    {
      key: 'quota',
      header: 'Quota',
      render: (task: Task) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${task.filledQuota >= task.quota ? 'text-emerald-600' : 'text-[#111827]'}`}>
              {task.filledQuota}
            </span>
            <span className="text-sm text-[#6B7280]">/</span>
            <span className="text-sm text-[#6B7280]">{task.quota}</span>
          </div>
          <div className="w-16 h-1.5 bg-[#AAB2C8] rounded-full overflow-hidden ml-2">
            <div
              className={`h-full rounded-full transition-all ${task.filledQuota / task.quota >= 0.8 ? 'bg-emerald-500' : 'bg-sahayogi-blue'}`}
              style={{ width: `${(task.filledQuota / task.quota) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (task: Task) => <StatusBadge status={task.status} />,
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Task Moderation</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Monitor and moderate volunteer tasks across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={clearFilters} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E8EAFB] flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#4F46C8]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Tasks</p>
                <p className="text-2xl font-bold text-[#111827]">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Removed</p>
                <p className="text-2xl font-bold text-red-600">{stats.removed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input
              placeholder="Search by task title or NGO name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Tag className="w-4 h-4 mr-2 text-[#6B7280]" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-40">
                <MapPin className="w-4 h-4 mr-2 text-[#6B7280]" />
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === 'all' ? 'All Districts' : d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2 text-[#6B7280]" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          type="search"
          title="No Tasks Found"
          message="No tasks match your search criteria. Try adjusting your filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredTasks}
          keyExtractor={(task) => (task as Task).id}
          onView={handleView}
          onDelete={handleDelete}
          emptyMessage="No tasks found matching your criteria"
          showActions={true}
          actionType="task"
          itemsPerPage={10}
        />
      )}

      {/* View Task Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#111827]">
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Posted by {selectedTask?.ngoName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-[#9FA8DA] text-[#4F46C8]">
                <Tag className="w-4 h-4" />
                {selectedTask?.category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-[#AAB2C8] text-[#111827]">
                <MapPin className="w-4 h-4" />
                {selectedTask?.district}
              </span>
              {selectedTask?.status && <StatusBadge status={selectedTask.status} />}
            </div>

            <div className="bg-[#F0F1F3] rounded-lg p-4">
              <p className="text-sm text-[#111827]">{selectedTask?.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#CACDD3] rounded-lg p-4">
                <p className="text-sm text-[#6B7280]">Volunteer Quota</p>
                <p className="text-lg font-semibold text-[#111827] mt-1">
                  {selectedTask?.filledQuota} / {selectedTask?.quota}
                </p>
                <div className="w-full h-2 bg-[#AAB2C8] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#4F46C8] rounded-full"
                    style={{
                      width: `${((selectedTask?.filledQuota || 0) / (selectedTask?.quota || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="bg-white border border-[#CACDD3] rounded-lg p-4">
                <p className="text-sm text-[#6B7280]">Date Range</p>
                <p className="text-sm font-medium text-[#111827] mt-1">
                  {selectedTask?.startDate} to {selectedTask?.endDate}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsDeleteModalOpen(true);
                }}
                className="flex-1 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone and will remove the task from the platform.`}
        confirmText="Delete"
        type="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
