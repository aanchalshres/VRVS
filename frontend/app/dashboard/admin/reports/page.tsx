"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/app/lib/api";

type Report = {
  id: number;
  reported_by: number;
  against_user_id: number | null;
  task_id: number | null;
  reason: string;
  status: "open" | "reviewed" | "resolved" | "rejected";
  created_at: string;
};

const COLORS = {
  primaryCTA: "#4F46C8",
  secondaryCTA: "#7683D6",
  background: "#F0F1F3",
  border: "#CACDD3",
  softSection: "#B9C0D4",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
};

const statusColors: Record<string, string> = {
  open: "#EF4444",
  reviewed: COLORS.softSection,
  resolved: "#22C55E",
  rejected: COLORS.textSecondary,
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ data: Report[] }>('/api/admin/reports')
      .then((res) => {
        const data = res.data ?? res;
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load reports');
        setLoading(false);
      });
  }, []);

  const filtered =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div
      style={{ background: COLORS.background, minHeight: "100vh" }}
      className="p-6"
    >
      <h1
        style={{ color: COLORS.textPrimary }}
        className="text-2xl font-semibold mb-1"
      >
        Reports
      </h1>
      <p style={{ color: COLORS.textSecondary }} className="text-sm mb-5">
        Complaints and reports submitted by users
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {["all", "open", "reviewed", "resolved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition"
            style={{
              background: filter === s ? COLORS.primaryCTA : "#fff",
              color: filter === s ? "#fff" : COLORS.textSecondary,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: `1px solid ${COLORS.border}`, background: "#fff" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: COLORS.softSection }}>
              <th className="p-3 text-left" style={{ color: COLORS.textPrimary }}>ID</th>
              <th className="p-3 text-left" style={{ color: COLORS.textPrimary }}>Reason</th>
              <th className="p-3 text-left" style={{ color: COLORS.textPrimary }}>Status</th>
              <th className="p-3 text-left" style={{ color: COLORS.textPrimary }}>Created</th>
              <th className="p-3 text-left" style={{ color: COLORS.textPrimary }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-4 text-center" style={{ color: COLORS.textSecondary }}>
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center" style={{ color: COLORS.textSecondary }}>
                  No reports found
                </td>
              </tr>
            )}

            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-t"
                style={{ borderColor: COLORS.border }}
              >
                <td className="p-3" style={{ color: COLORS.textSecondary }}>
                  #{r.id}
                </td>
                <td className="p-3 max-w-xs truncate" style={{ color: COLORS.textPrimary }}>
                  {r.reason}
                </td>
                <td className="p-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: statusColors[r.status] }}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3" style={{ color: COLORS.textSecondary }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/dashboard/admin/reports/${r.id}`}
                    className="px-3 py-1.5 rounded text-xs font-medium text-white"
                    style={{ background: COLORS.secondaryCTA }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
