"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/app/lib/api";
import { Search, AlertTriangle, ShieldCheck, Calendar, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";

interface Conflict {
  has_conflict: boolean;
  conflict_type: string;
  conflict_score: number;
  overlap_minutes: number;
  travel_time_minutes: number;
  travel_distance_km: number | null;
  buffer_violation: boolean;
  conflicting_task: { id: number; title: string; start_date: string | null; end_date: string | null };
}

export default function NGOSchedulePage() {
  const [volunteerId, setVolunteerId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [result, setResult] = useState<Conflict[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [volunteerSchedule, setVolunteerSchedule] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerId.trim() || !taskId.trim()) {
      toast.error("Enter both volunteer profile ID and task ID");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await apiPost<any>("/api/ngo/schedule/check-conflict", {
        volunteer_profile_id: Number(volunteerId),
        task_id: Number(taskId),
      });
      setResult(res.data.conflicts || []);
      if (res.data.conflicts?.length === 0) {
        toast.success("No conflicts detected");
      }
    } catch (err: any) {
      toast.error(err.message || "Check failed");
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    if (!volunteerId.trim()) { toast.error("Enter volunteer profile ID first"); return; }
    setScheduleLoading(true);
    try {
      const res = await apiGet<any>(`/api/ngo/schedule/volunteer/${volunteerId}`);
      setVolunteerSchedule(res.data?.commitments || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load schedule");
    } finally {
      setScheduleLoading(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "Flexible";
    return new Date(d).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" });
  };

  const getConflictColor = (type: string) => {
    switch (type) {
      case "complete_conflict": return "bg-red-50 border-red-200 text-red-700";
      case "major_overlap": return "bg-orange-50 border-orange-200 text-orange-700";
      case "partial_overlap": return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "minor_conflict": return "bg-blue-50 border-blue-200 text-blue-700";
      default: return "bg-green-50 border-green-200 text-green-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">Schedule Conflict Check</h1>
        <p className="text-sm text-[#6B7280] mt-1">Check volunteer schedules before accepting or assigning tasks</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conflict Check */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">Check for Conflicts</h2>
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Volunteer Profile ID</label>
              <input type="number" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)}
                placeholder="Enter volunteer profile ID"
                className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Task ID</label>
              <input type="number" value={taskId} onChange={(e) => setTaskId(e.target.value)}
                placeholder="Enter task ID"
                className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#4F46C8] hover:bg-[#4338CA] text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking...</>
                : <><AlertTriangle className="w-4 h-4" /> Check for Conflicts</>}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">Results</h2>
          {result === null ? (
            <p className="text-sm text-[#6B7280]">Run a conflict check to see results</p>
          ) : result.length === 0 ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-4">
              <ShieldCheck className="w-5 h-5" />
              <p className="text-sm font-medium">No conflicts detected</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium">{result.length} conflict(s) detected</p>
              {result.map((c, idx) => (
                <div key={idx} className={`border rounded-lg overflow-hidden ${getConflictColor(c.conflict_type)}`}>
                  <button onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium capitalize">{c.conflict_type.replace(/_/g, " ")}</span>
                      <span className="text-xs">Score: {Math.round(c.conflict_score * 100)}</span>
                    </div>
                    {expandedIdx === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedIdx === idx && (
                    <div className="px-3 pb-2 pt-1 border-t border-inherit text-xs space-y-1">
                      <p>Conflicts with: <strong>{c.conflicting_task?.title}</strong></p>
                      {c.overlap_minutes > 0 && <p>Overlap: {c.overlap_minutes} min</p>}
                      <p>Travel time: ~{c.travel_time_minutes} min{c.travel_distance_km !== null ? ` (${c.travel_distance_km} km)` : ""}</p>
                      {c.buffer_violation && <p className="font-medium">Buffer time violated</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Volunteer Schedule Preview */}
      <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#111827]">Volunteer Schedule Preview</h2>
          <button onClick={loadSchedule} disabled={scheduleLoading}
            className="text-xs text-[#4F46C8] hover:text-[#4338CA] font-medium">
            {scheduleLoading ? "Loading..." : "Load Schedule"}
          </button>
        </div>
        {volunteerSchedule.length === 0 ? (
          <p className="text-sm text-[#6B7280]">Enter a volunteer ID and click "Load Schedule"</p>
        ) : (
          <div className="space-y-2">
            {volunteerSchedule.map((s: any) => (
              <div key={s.task_id} className="flex items-center gap-3 p-3 rounded-lg border border-[#CACDD3]">
                <Calendar className="w-4 h-4 text-[#4F46C8] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#111827] truncate">{s.title}</p>
                  <p className="text-xs text-[#6B7280]">{formatDate(s.start_date)}{s.end_date && s.end_date !== s.start_date ? ` — ${formatDate(s.end_date)}` : ""}</p>
                </div>
                <span className="text-xs text-[#6B7280] capitalize">{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
