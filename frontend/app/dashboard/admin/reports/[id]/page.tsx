"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ReportDetail = {
  id: number;
  reported_by: number;
  against_user_id: number | null;
  opportunity_id: number | null;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "rejected";
  resolved_by: number | null;
  resolved_at: string | null;
  resolution_notes: string | null;
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

export default function ReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then((res) => res.json())
      .then(setReport);
  }, [params.id]);

  const updateStatus = async (status: "resolved" | "rejected" | "reviewing") => {
    setSubmitting(true);
    await fetch(`/api/reports/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolution_notes: notes }),
    });
    setSubmitting(false);
    router.push("/dashboard/admin/reports");
  };

  if (!report) {
    return (
      <div style={{ background: COLORS.background, minHeight: "100vh" }} className="p-6">
        <p style={{ color: COLORS.textSecondary }}>Loading report...</p>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.background, minHeight: "100vh" }} className="p-6">
      <button
        onClick={() => router.back()}
        className="text-sm mb-4"
        style={{ color: COLORS.secondaryCTA }}
      >
        ← Back to Reports
      </button>

      <div
        className="rounded-lg p-6 max-w-2xl"
        style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 style={{ color: COLORS.textPrimary }} className="text-xl font-semibold">
            Report #{report.id}
          </h1>
          <span
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{
              background:
                report.status === "open"
                  ? "#EF4444"
                  : report.status === "reviewing"
                  ? COLORS.softSection
                  : report.status === "resolved"
                  ? "#22C55E"
                  : COLORS.textSecondary,
            }}
          >
            {report.status}
          </span>
        </div>

        {/* Details grid */}
        <div
          className="grid grid-cols-2 gap-4 p-4 rounded-md mb-5"
          style={{ background: COLORS.background, border: `1px solid ${COLORS.border}` }}
        >
          <div>
            <p style={{ color: COLORS.textSecondary }} className="text-xs mb-1">Reported By</p>
            <p style={{ color: COLORS.textPrimary }} className="text-sm">User #{report.reported_by}</p>
          </div>
          <div>
            <p style={{ color: COLORS.textSecondary }} className="text-xs mb-1">Against User</p>
            <p style={{ color: COLORS.textPrimary }} className="text-sm">
              {report.against_user_id ? `User #${report.against_user_id}` : "—"}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.textSecondary }} className="text-xs mb-1">Opportunity</p>
            <p style={{ color: COLORS.textPrimary }} className="text-sm">
              {report.opportunity_id ? `#${report.opportunity_id}` : "—"}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.textSecondary }} className="text-xs mb-1">Created At</p>
            <p style={{ color: COLORS.textPrimary }} className="text-sm">
              {new Date(report.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-5">
          <p style={{ color: COLORS.textSecondary }} className="text-xs mb-1">Reason</p>
          <p
            style={{ color: COLORS.textPrimary, background: COLORS.background, border: `1px solid ${COLORS.border}` }}
            className="text-sm p-3 rounded-md"
          >
            {report.reason}
          </p>
        </div>

        {/* Already resolved info */}
        {report.status === "resolved" || report.status === "rejected" ? (
          <div className="mb-5">
            <p style={{ color: COLORS.textSecondary }} className="text-xs mb-1">Resolution Notes</p>
            <p
              style={{ color: COLORS.textPrimary, background: COLORS.softSection }}
              className="text-sm p-3 rounded-md"
            >
              {report.resolution_notes || "No notes provided"}
            </p>
            <p style={{ color: COLORS.textSecondary }} className="text-xs mt-2">
              Resolved by Admin #{report.resolved_by} on{" "}
              {report.resolved_at && new Date(report.resolved_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <>
            {/* Resolution form */}
            <div className="mb-5">
              <label style={{ color: COLORS.textSecondary }} className="text-xs mb-1 block">
                Resolution Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add notes about how this report was handled..."
                className="w-full p-3 rounded-md text-sm outline-none"
                style={{
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textPrimary,
                }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                disabled={submitting}
                onClick={() => updateStatus("reviewing")}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  background: "#fff",
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                Mark as Reviewing
              </button>
              <button
                disabled={submitting}
                onClick={() => updateStatus("resolved")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: COLORS.primaryCTA }}
              >
                Resolve
              </button>
              <button
                disabled={submitting}
                onClick={() => updateStatus("rejected")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: COLORS.secondaryCTA }}
              >
                Reject
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}