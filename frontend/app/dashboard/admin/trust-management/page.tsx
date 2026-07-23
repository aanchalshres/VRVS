"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "@/app/lib/api";
import { Search, RefreshCw, TrendingUp, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface VolunteerSummary {
  id: number;
  user: { id: number; name: string; email: string };
  trust_score: number | null;
  trust_score_components: Record<string, number> | null;
  trust_updated_at: string | null;
}

interface TrustHistoryItem {
  id: number;
  previous_score: number | null;
  new_score: number;
  score_change: number;
  change_reason: string | null;
  created_at: string;
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-gray-600";
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.6) return "text-yellow-600";
  if (score >= 0.4) return "text-orange-600";
  return "text-red-600";
}

function getScoreBg(score: number | null) {
  if (score === null) return "bg-gray-100";
  if (score >= 0.8) return "bg-green-100";
  if (score >= 0.6) return "bg-yellow-100";
  if (score >= 0.4) return "bg-orange-100";
  return "bg-red-100";
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-NP", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminTrustManagementPage() {
  const [volunteers, setVolunteers] = useState<VolunteerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerSummary | null>(null);
  const [history, setHistory] = useState<TrustHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [recalculateAllLoading, setRecalculateAllLoading] = useState(false);
  const [recalculatingId, setRecalculatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<any>(`/admin/volunteers?per_page=50`);
      setVolunteers(res.data?.data || res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVolunteers(); }, [fetchVolunteers]);

  const fetchHistory = async (profileId: number) => {
    setLoadingHistory(true);
    try {
      const res = await apiGet<any>(`/admin/trust/volunteer/${profileId}/history`);
      setHistory(res.data?.data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectVolunteer = async (v: VolunteerSummary) => {
    setSelectedVolunteer(v);
    await fetchHistory(v.id);
  };

  const handleRecalculate = async (profileId: number) => {
    setRecalculatingId(profileId);
    try {
      await apiPost(`/admin/trust/volunteer/${profileId}/recalculate`, {});
      await fetchVolunteers();
      if (selectedVolunteer?.id === profileId) {
        await fetchHistory(profileId);
      }
    } catch (err: any) {
      setError(err.message || "Recalculation failed");
    } finally {
      setRecalculatingId(null);
    }
  };

  const handleRecalculateAll = async () => {
    if (!confirm("Recalculate trust scores for ALL volunteers? This may take a moment.")) return;
    setRecalculateAllLoading(true);
    try {
      const res = await apiPost("/admin/trust/recalculate-all", {});
      await fetchVolunteers();
      alert(res.message || "Recalculation complete");
    } catch (err: any) {
      setError(err.message || "Bulk recalculation failed");
    } finally {
      setRecalculateAllLoading(false);
    }
  };

  const filtered = volunteers.filter((v) =>
    v.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const componentLabels: Record<string, string> = {
    attendance: "Attend", completion: "Complete", ratings: "Ratings",
    verification: "Verify", response_rate: "Response", account_activity: "Activity",
    penalties: "Penalties",
  };

  const statsVolunteersWithScore = volunteers.filter((v) => v.trust_score !== null).length;
  const avgScore = statsVolunteersWithScore > 0
    ? volunteers.reduce((sum, v) => sum + (v.trust_score ?? 0), 0) / volunteers.length
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#111827]">Trust Score Management</h1>
        <button onClick={handleRecalculateAll} disabled={recalculateAllLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46C8] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${recalculateAllLoading ? "animate-spin" : ""}`} />
          {recalculateAllLoading ? "Recalculating All..." : "Recalculate All"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#CACDD3] p-5">
          <p className="text-sm text-[#6B7280]">Volunteers with Scores</p>
          <p className="text-2xl font-bold text-[#111827] mt-1">{statsVolunteersWithScore} / {volunteers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#CACDD3] p-5">
          <p className="text-sm text-[#6B7280]">Average Trust Score</p>
          <p className={`text-2xl font-bold mt-1 ${getScoreColor(avgScore)}`}>{Math.round(avgScore * 100)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#CACDD3] p-5">
          <p className="text-sm text-[#6B7280]">Last Updated</p>
          <p className="text-2xl font-bold text-[#111827] mt-1 text-sm pt-1">{(new Date()).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Volunteer List */}
        <div className="bg-white rounded-xl border border-[#CACDD3] overflow-hidden">
          <div className="p-4 border-b border-[#CACDD3]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input type="text" placeholder="Search volunteers..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#CACDD3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-[#6B7280]">
                <span className="w-5 h-5 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin inline-block mr-2" />
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6B7280]">No volunteers found</div>
            ) : (
              filtered.map((v) => (
                <div key={v.id}
                  className={`flex items-center justify-between px-4 py-3 border-b border-[#CACDD3] last:border-b-0 cursor-pointer hover:bg-[#F0F1F3] transition-colors
                    ${selectedVolunteer?.id === v.id ? "bg-[#EEF2FF]" : ""}`}
                  onClick={() => handleSelectVolunteer(v)}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{v.user?.name || "Unknown"}</p>
                    <p className="text-xs text-[#6B7280] truncate">{v.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-bold ${getScoreColor(v.trust_score)}`}>
                      {v.trust_score !== null ? Math.round(v.trust_score * 100) : "—"}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleRecalculate(v.id); }} disabled={recalculatingId === v.id}
                      className="p-1.5 rounded-lg hover:bg-[#E0E3EB] transition-colors disabled:opacity-40" title="Recalculate">
                      <RefreshCw className={`w-3.5 h-3.5 text-[#6B7280] ${recalculatingId === v.id ? "animate-spin" : ""}`} />
                    </button>
                    <ChevronRightIcon />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          {!selectedVolunteer ? (
            <div className="h-64 flex flex-col items-center justify-center text-[#6B7280]">
              <TrendingUp className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">Select a volunteer to view details</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">{selectedVolunteer.user?.name}</h2>
                <p className="text-xs text-[#6B7280]">{selectedVolunteer.user?.email}</p>
              </div>

              <div className={`flex items-center gap-4 ${getScoreBg(selectedVolunteer.trust_score)} rounded-xl p-4`}>
                <span className={`text-3xl font-bold ${getScoreColor(selectedVolunteer.trust_score)}`}>
                  {selectedVolunteer.trust_score !== null ? Math.round(selectedVolunteer.trust_score * 100) : "—"}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${getScoreColor(selectedVolunteer.trust_score)}`}>
                    {selectedVolunteer.trust_score !== null
                      ? (selectedVolunteer.trust_score >= 0.8 ? "Excellent" : selectedVolunteer.trust_score >= 0.6 ? "Good" : selectedVolunteer.trust_score >= 0.4 ? "Fair" : "Low")
                      : "Not scored"}
                  </p>
                  <p className="text-xs text-[#6B7280]">Updated: {formatDate(selectedVolunteer.trust_updated_at)}</p>
                </div>
              </div>

              {/* Components */}
              {selectedVolunteer.trust_score_components && (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedVolunteer.trust_score_components).map(([key, value]) => (
                    <div key={key} className="bg-[#F0F1F3] rounded-lg p-2.5">
                      <p className="text-xs text-[#6B7280]">{componentLabels[key] || key}</p>
                      <p className={`text-sm font-semibold ${getScoreColor(value as number)}`}>
                        {Math.round((value as number) * 100)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* History */}
              <div>
                <h3 className="text-sm font-semibold text-[#111827] mb-3">Recent Changes</h3>
                {loadingHistory ? (
                  <div className="py-4 text-center">
                    <span className="w-4 h-4 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin inline-block" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-xs text-[#6B7280]">No history recorded</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {history.slice(0, 10).map((h) => (
                      <div key={h.id} className="flex items-center justify-between bg-[#F0F1F3] rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs font-medium text-[#111827]">{h.change_reason || h.triggered_by || "Update"}</p>
                          <p className="text-xs text-[#6B7280]">{formatDate(h.created_at)}</p>
                        </div>
                        <span className={`text-xs font-bold ${getScoreColor(h.new_score)}`}>
                          {h.score_change > 0 ? "+" : ""}{Math.round(h.score_change * 100)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
