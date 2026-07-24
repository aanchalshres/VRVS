"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/app/lib/api";
import { Calendar, Clock, MapPin, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ScheduleItem {
  task_id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  application_id: number;
}

interface Conflict {
  has_conflict: boolean;
  conflict_type: string;
  conflict_score: number;
  overlap_minutes: number;
  gap_minutes: number | null;
  travel_time_minutes: number;
  travel_distance_km: number | null;
  buffer_violation: boolean;
  conflicting_task_id: number;
  conflicting_task: {
    id: number;
    title: string;
    start_date: string | null;
    end_date: string | null;
  };
}

export default function VolunteerSchedulePage() {
  const [data, setData] = useState<{ commitments: ScheduleItem[]; internal_conflicts: Conflict[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedConflict, setExpandedConflict] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>("/volunteer/schedule/commitments");
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScanConflicts = async () => {
    setScanning(true);
    try {
      const res = await apiGet<any>("/volunteer/schedule");
      setData({ commitments: res.data.schedule || [], internal_conflicts: res.data.internal_conflicts || [] });
    } catch {
    } finally {
      setScanning(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "Flexible";
    return new Date(d).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-NP", { hour: "2-digit", minute: "2-digit" });
  };

  const getConflictColor = (type: string) => {
    switch (type) {
      case "complete_conflict": return "bg-red-100 text-red-700 border-red-200";
      case "major_overlap": return "bg-orange-100 text-orange-700 border-orange-200";
      case "partial_overlap": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "minor_conflict": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getConflictLabel = (type: string) => {
    switch (type) {
      case "complete_conflict": return "Complete Conflict";
      case "major_overlap": return "Major Overlap";
      case "partial_overlap": return "Partial Overlap";
      case "minor_conflict": return "Minor Conflict";
      case "no_conflict": return "No Conflict";
      default: return type;
    }
  };

  const today = new Date();
  const upcoming = (data?.commitments || []).filter((s) => {
    if (!s.start_date) return false;
    return new Date(s.start_date) >= today;
  }).sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime());

  const past = (data?.commitments || []).filter((s) => {
    if (!s.start_date) return false;
    return new Date(s.start_date) < today;
  });

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#111827]">My Schedule</h1>
            <p className="text-sm text-[#6B7280] mt-1">View your commitments and detect scheduling conflicts</p>
          </div>
          <button onClick={handleScanConflicts} disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46C8] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning..." : "Scan for Conflicts"}
          </button>
        </div>

        {/* Conflict Alerts */}
        {data?.internal_conflicts && data.internal_conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-semibold text-red-700">
                {data.internal_conflicts.length} scheduling conflict{data.internal_conflicts.length > 1 ? "s" : ""} detected
              </p>
            </div>
            <div className="space-y-2">
              {data.internal_conflicts.map((c, idx) => (
                <div key={idx} className={`border rounded-lg overflow-hidden ${getConflictColor(c.conflict_type)}`}>
                  <button onClick={() => setExpandedConflict(expandedConflict === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{getConflictLabel(c.conflict_type)}</span>
                      <span className="text-xs opacity-75">Score: {Math.round(c.conflict_score * 100)}</span>
                    </div>
                    {expandedConflict === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedConflict === idx && (
                    <div className="px-3 pb-2 pt-1 border-t border-inherit text-xs space-y-1">
                      <p>Conflicts with: <strong>{c.conflicting_task.title}</strong></p>
                      {c.overlap_minutes > 0 && <p>Overlap: {c.overlap_minutes} minutes</p>}
                      {c.gap_minutes !== null && c.gap_minutes > 0 && <p>Gap: {c.gap_minutes} minutes</p>}
                      {c.travel_time_minutes > 0 && <p>Travel time: ~{c.travel_time_minutes} min</p>}
                      {c.travel_distance_km !== null && <p>Distance: {c.travel_distance_km} km</p>}
                      {c.buffer_violation && <p className="text-red-600 font-medium">Buffer time violated</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Commitments */}
        <div className="bg-white rounded-2xl border border-[#CACDD3] p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4F46C8]" /> Upcoming ({upcoming.length})
          </h2>
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No upcoming commitments</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((s) => (
                <Link key={s.task_id}
                  href={`/dashboard/volunteer/tasks/${s.task_id}`}
                  className="flex items-start gap-3 p-3 rounded-xl border border-[#CACDD3] hover:bg-[#F0F1F3] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#4F46C8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{s.title}</p>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(s.start_date)}</span>
                      {s.end_date && s.end_date !== s.start_date && (
                        <span>– {formatDate(s.end_date)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Past Commitments */}
        {past.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#CACDD3] p-6">
            <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6B7280]" /> Past ({past.length})
            </h2>
            <div className="space-y-2">
              {past.map((s) => (
                <div key={s.task_id} className="flex items-center gap-3 p-2 rounded-lg text-sm text-[#6B7280]">
                  <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                  <span className="truncate">{s.title}</span>
                  <span className="shrink-0 text-xs">{formatDate(s.start_date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Info */}
        {(data?.commitments || []).length > 0 && (
          <div className="text-xs text-[#6B7280] text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Schedule conflicts are automatically checked when you apply for tasks
          </div>
        )}
      </div>
    </div>
  );
}
