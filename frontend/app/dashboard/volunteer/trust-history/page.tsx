"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/app/lib/api";
import { TrendingUp, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface TrustHistoryItem {
  id: number;
  previous_score: number | null;
  new_score: number;
  score_change: number;
  change_reason: string | null;
  components_snapshot: Record<string, number> | null;
  triggered_by: string | null;
  created_at: string;
}

interface PaginatedResponse {
  data: TrustHistoryItem[];
  current_page: number;
  last_page: number;
  total: number;
}

function getScoreColor(score: number) {
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.6) return "text-yellow-600";
  if (score >= 0.4) return "text-orange-600";
  return "text-red-600";
}

function getScoreBg(score: number) {
  if (score >= 0.8) return "bg-green-100";
  if (score >= 0.6) return "bg-yellow-100";
  if (score >= 0.4) return "bg-orange-100";
  return "bg-red-100";
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NP", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function VolunteerTrustHistoryPage() {
  const [trustData, setTrustData] = useState<{ trust_score: number; components: Record<string, number> } | null>(null);
  const [history, setHistory] = useState<PaginatedResponse | null>(null);
  const [loadingScore, setLoadingScore] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const fetchScore = async () => {
    setLoadingScore(true);
    try {
      const res = await apiGet<any>("/volunteer/trust/score");
      setTrustData(res.data);
    } catch {
      setTrustData(null);
    } finally {
      setLoadingScore(false);
    }
  };

  const fetchHistory = async (p: number) => {
    setLoadingHistory(true);
    try {
      const res = await apiGet<any>(`/volunteer/trust/history?page=${p}`);
      setHistory(res.data);
    } catch {
      setHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchScore();
    fetchHistory(page);
  }, [page]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await apiPost("/volunteer/trust/recalculate", {});
      await fetchScore();
      await fetchHistory(1);
      setPage(1);
    } catch {
      // ignore
    } finally {
      setRecalculating(false);
    }
  };

  const componentLabels: Record<string, string> = {
    attendance: "Attendance", completion: "Completion", ratings: "Ratings",
    verification: "Verification", response_rate: "Response Rate", account_activity: "Activity",
    penalties: "Penalties",
  };

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#111827]">Trust Score</h1>
          <button onClick={handleRecalculate} disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46C8] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
            {recalculating ? "Recalculating..." : "Recalculate"}
          </button>
        </div>

        {/* Current Score Card */}
        <div className="bg-white rounded-2xl border border-[#CACDD3] p-6">
          {loadingScore ? (
            <div className="h-32 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
            </div>
          ) : !trustData ? (
            <p className="text-sm text-[#6B7280]">Trust score unavailable</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6">
              <div className={`flex items-center gap-4 ${getScoreBg(trustData.trust_score)} rounded-xl p-5 min-w-[160px]`}>
                <span className={`text-4xl font-bold ${getScoreColor(trustData.trust_score)}`}>
                  {Math.round(trustData.trust_score * 100)}
                </span>
                <div>
                  <p className={`text-lg font-semibold ${getScoreColor(trustData.trust_score)}`}>
                    {trustData.trust_score >= 0.8 ? "Excellent" : trustData.trust_score >= 0.6 ? "Good" : trustData.trust_score >= 0.4 ? "Fair" : "Low"}
                  </p>
                  <p className="text-xs text-[#6B7280]">out of 100</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(trustData.components).map(([key, value]) => (
                  <div key={key} className="bg-[#F0F1F3] rounded-lg p-3">
                    <p className="text-xs text-[#6B7280] mb-1">{componentLabels[key] || key}</p>
                    <p className={`text-sm font-semibold ${getScoreColor(value as number)}`}>
                      {Math.round((value as number) * 100)}
                    </p>
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, Math.max(0, (value as number) * 100))}%`,
                        backgroundColor: key === "penalties" ? "#EF4444" : "#4F46C8",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Timeline */}
        <div className="bg-white rounded-2xl border border-[#CACDD3] p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4">Score History</h2>
          {loadingHistory ? (
            <div className="h-32 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
            </div>
          ) : !history || history.data.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No history yet. Recalculate your score to see changes.</p>
          ) : (
            <div className="space-y-3">
              {history.data.map((item) => (
                <div key={item.id} className="border border-[#CACDD3] rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F0F1F3] transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${item.score_change > 0 ? "bg-green-100 text-green-700" : item.score_change < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                        {item.score_change > 0 ? "+" : ""}{Math.round(item.score_change * 100)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">
                          {item.change_reason || item.triggered_by || "Score updated"}
                        </p>
                        <p className="text-xs text-[#6B7280]">{formatDateTime(item.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${getScoreColor(item.new_score)}`}>
                        {Math.round(item.new_score * 100)}
                      </span>
                      {expandedId === item.id ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                    </div>
                  </button>
                  {expandedId === item.id && item.components_snapshot && (
                    <div className="px-4 pb-3 pt-1 border-t border-[#CACDD3] bg-[#F0F1F3]/50">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {Object.entries(item.components_snapshot).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-[#6B7280]">{componentLabels[key] || key}: </span>
                            <span className="font-medium text-[#111827]">{Math.round((value as number) * 100)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {history && history.last_page > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#CACDD3]">
              <p className="text-xs text-[#6B7280]">Page {history.current_page} of {history.last_page}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 text-xs font-medium border border-[#CACDD3] rounded-lg disabled:opacity-40 hover:bg-[#F0F1F3]">
                  Previous
                </button>
                <button disabled={page >= history.last_page} onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 text-xs font-medium border border-[#CACDD3] rounded-lg disabled:opacity-40 hover:bg-[#F0F1F3]">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
