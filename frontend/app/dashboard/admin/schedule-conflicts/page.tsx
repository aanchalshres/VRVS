"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/app/lib/api";
import { AlertTriangle, ShieldCheck, Search, Filter, RefreshCw, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

interface ConflictItem {
  id: number;
  volunteer_profile_id: number;
  task_id: number;
  conflicting_task_id: number;
  conflict_type: string;
  conflict_score: number;
  overlap_minutes: number;
  travel_time_minutes: number;
  travel_distance_km: number | null;
  buffer_violation: boolean;
  detected_at: string;
  resolution: string | null;
  resolved_at: string | null;
  notes: string | null;
  volunteer_profile: { id: number; user: { name: string; email: string } } | null;
  task: { id: number; title: string; start_date: string | null; end_date: string | null } | null;
  conflicting_task: { id: number; title: string; start_date: string | null; end_date: string | null } | null;
}

export default function AdminScheduleConflictsPage() {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [filterType, setFilterType] = useState("");
  const [filterResolved, setFilterResolved] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resolving, setResolving] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterResolved) params.set("resolved", filterResolved);

      const [conflictsRes, analyticsRes] = await Promise.all([
        apiGet<any>(`/api/admin/schedule/conflicts?${params}`),
        apiGet<any>("/api/admin/schedule/analytics").catch(() => null),
      ]);
      setConflicts(conflictsRes.data || []);
      setAnalytics(analyticsRes?.data || null);
    } catch {
      toast.error("Failed to load conflicts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleResolve = async (id: number, resolution: string) => {
    setResolving(id);
    try {
      const res = await apiPost<any>(`/api/admin/schedule/conflicts/${id}/resolve`, { resolution });
      toast.success(res.data?.message || "Conflict resolved");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve");
    } finally {
      setResolving(null);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" });
  };

  const getConflictColor = (type: string) => {
    switch (type) {
      case "complete_conflict": return "text-red-700 bg-red-100";
      case "major_overlap": return "text-orange-700 bg-orange-100";
      case "partial_overlap": return "text-yellow-700 bg-yellow-100";
      case "minor_conflict": return "text-blue-700 bg-blue-100";
      default: return "text-green-700 bg-green-100";
    }
  };

  const resolutionOptions = [
    { value: "warn_volunteer", label: "Warn Volunteer" },
    { value: "warn_ngo", label: "Warn NGO" },
    { value: "manual_override", label: "Manual Override" },
    { value: "suggest_alternative", label: "Suggest Alternative" },
    { value: "reject", label: "Reject" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Schedule Conflict Management</h1>
          <p className="text-sm text-[#6B7280] mt-1">Detect and resolve scheduling conflicts across volunteers</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-[#CACDD3] rounded-lg text-sm hover:bg-[#F0F1F3] transition-colors disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Total Detected</p>
            <p className="text-xl font-bold text-[#111827] mt-1">{analytics.total_detected}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Unresolved</p>
            <p className="text-xl font-bold text-red-600 mt-1">{analytics.unresolved}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Type Breakdown</p>
            <div className="text-xs mt-1 space-y-0.5">
              {Object.entries(analytics.by_type || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-[#6B7280] capitalize">{type.replace(/_/g, " ")}</span>
                  <span className="font-medium">{String(count)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Resolved</p>
            <div className="text-xs mt-1 space-y-0.5">
              {Object.entries(analytics.by_resolution || {}).map(([res, count]) => (
                <div key={res} className="flex justify-between">
                  <span className="text-[#6B7280] capitalize">{res.replace(/_/g, " ")}</span>
                  <span className="font-medium">{String(count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#CACDD3] p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input type="text" placeholder="Search by volunteer or task..." className="w-full pl-10 pr-3 py-2 border border-[#CACDD3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="border border-[#CACDD3] rounded-lg px-3 py-2 text-sm">
          <option value="">All Types</option>
          <option value="complete_conflict">Complete Conflict</option>
          <option value="major_overlap">Major Overlap</option>
          <option value="partial_overlap">Partial Overlap</option>
          <option value="minor_conflict">Minor Conflict</option>
        </select>
        <select value={filterResolved} onChange={(e) => setFilterResolved(e.target.value)}
          className="border border-[#CACDD3] rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="false">Unresolved</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      {/* Conflicts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-6 h-6 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
        </div>
      ) : conflicts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#CACDD3] p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-[#111827]">No conflicts detected</p>
          <p className="text-xs text-[#6B7280] mt-1">All volunteers have clear schedules</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conflicts.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-[#CACDD3] overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F0F1F3] transition-colors text-left">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getConflictColor(c.conflict_type)}`}>
                    {c.conflict_type.replace(/_/g, " ")}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">
                      {c.volunteer_profile?.user?.name || "Unknown"} <span className="text-[#6B7280] font-normal">×</span> {c.task?.title || "Task"}
                    </p>
                    <p className="text-xs text-[#6B7280]">{formatDate(c.detected_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {c.resolution ? (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Resolved</span>
                  ) : (
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Unresolved</span>
                  )}
                  <span className="text-xs font-medium text-[#6B7280]">{Math.round(c.conflict_score * 100)}</span>
                  {expandedId === c.id ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                </div>
              </button>
              {expandedId === c.id && (
                <div className="px-4 pb-4 pt-2 border-t border-[#CACDD3] bg-[#F0F1F3]/30">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                    <div><span className="text-[#6B7280]">Volunteer:</span> <span className="font-medium">{c.volunteer_profile?.user?.name || "—"}</span></div>
                    <div><span className="text-[#6B7280]">Primary Task:</span> <span className="font-medium">{c.task?.title || "—"}</span></div>
                    <div><span className="text-[#6B7280]">Conflicting Task:</span> <span className="font-medium">{c.conflicting_task?.title || "—"}</span></div>
                    <div><span className="text-[#6B7280]">Overlap:</span> <span className="font-medium">{c.overlap_minutes}m</span></div>
                    <div><span className="text-[#6B7280]">Travel:</span> <span className="font-medium">{c.travel_time_minutes}m{c.travel_distance_km !== null ? ` (${c.travel_distance_km} km)` : ""}</span></div>
                    <div><span className="text-[#6B7280]">Buffer Violation:</span> <span className={`font-medium ${c.buffer_violation ? "text-red-600" : "text-green-600"}`}>{c.buffer_violation ? "Yes" : "No"}</span></div>
                  </div>
                  {!c.resolution && (
                    <div className="flex gap-2 flex-wrap">
                      {resolutionOptions.map((opt) => (
                        <button key={opt.value} onClick={() => handleResolve(c.id, opt.value)} disabled={resolving === c.id}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50
                            ${opt.value === "reject" ? "border-red-200 text-red-700 hover:bg-red-50"
                              : opt.value === "manual_override" ? "border-orange-200 text-orange-700 hover:bg-orange-50"
                              : "border-[#CACDD3] text-[#6B7280] hover:bg-[#F0F1F3]"}`}>
                          {resolving === c.id ? "..." : opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {c.resolution && (
                    <div className="text-xs text-[#6B7280]">
                      Resolved as: <span className="font-medium capitalize">{c.resolution.replace(/_/g, " ")}</span>
                      {c.resolved_at && <> at {formatDate(c.resolved_at)}</>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
