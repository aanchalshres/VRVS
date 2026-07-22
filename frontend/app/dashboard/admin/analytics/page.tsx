"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/app/lib/api";

interface AnalyticsDashboard {
  users: { total: number; volunteers: number; ngos: number };
  tasks: { total: number; open: number; completed: number; cancelled: number; draft: number };
  applications: { total: number; pending: number; accepted: number; rejected: number; cancelled: number };
  service: { total_hours: number; completed_sessions: number; active_sessions: number };
  verification: { pending_ngos: number; verified_ngos: number; rejected_ngos: number };
  certificates: { total: number };
  reviews: { total: number; average_rating: number };
}

export default function AdminAnalyticsPage() {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiGet<any>("/admin/analytics/dashboard");
      setDashboard(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-5 h-5 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error || "Failed to load data."}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Analytics</h1>
          <p className="text-sm text-[#6B7280]">Platform overview and statistics</p>
        </div>

        {/* Users */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4">Users</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.users.total}</p>
              <p className="text-xs text-[#6B7280] mt-1">Total</p>
            </div>
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.users.volunteers}</p>
              <p className="text-xs text-[#6B7280] mt-1">Volunteers</p>
            </div>
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.users.ngos}</p>
              <p className="text-xs text-[#6B7280] mt-1">NGOs</p>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4">Tasks</h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Total", value: dashboard.tasks.total },
              { label: "Open", value: dashboard.tasks.open },
              { label: "Completed", value: dashboard.tasks.completed },
              { label: "Cancelled", value: dashboard.tasks.cancelled },
              { label: "Draft", value: dashboard.tasks.draft },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F0F1F3] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#111827]">{value}</p>
                <p className="text-xs text-[#6B7280] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4">Applications</h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Total", value: dashboard.applications.total },
              { label: "Pending", value: dashboard.applications.pending },
              { label: "Accepted", value: dashboard.applications.accepted },
              { label: "Rejected", value: dashboard.applications.rejected },
              { label: "Cancelled", value: dashboard.applications.cancelled },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F0F1F3] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#111827]">{value}</p>
                <p className="text-xs text-[#6B7280] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Service */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4">Service</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.service.total_hours}</p>
              <p className="text-xs text-[#6B7280] mt-1">Total Hours</p>
            </div>
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.service.completed_sessions}</p>
              <p className="text-xs text-[#6B7280] mt-1">Completed Sessions</p>
            </div>
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.service.active_sessions}</p>
              <p className="text-xs text-[#6B7280] mt-1">Active Sessions</p>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4">NGO Verification</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.verification.pending_ngos}</p>
              <p className="text-xs text-[#6B7280] mt-1">Pending</p>
            </div>
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.verification.verified_ngos}</p>
              <p className="text-xs text-[#6B7280] mt-1">Verified</p>
            </div>
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.verification.rejected_ngos}</p>
              <p className="text-xs text-[#6B7280] mt-1">Rejected</p>
            </div>
          </div>
        </div>

        {/* Certificates & Reviews */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
            <h2 className="text-base font-semibold text-[#111827] mb-4">Certificates</h2>
            <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#111827]">{dashboard.certificates.total}</p>
              <p className="text-xs text-[#6B7280] mt-1">Total Issued</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
            <h2 className="text-base font-semibold text-[#111827] mb-4">Reviews</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#111827]">{dashboard.reviews.total}</p>
                <p className="text-xs text-[#6B7280] mt-1">Total</p>
              </div>
              <div className="bg-[#F0F1F3] rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#111827]">{dashboard.reviews.average_rating}</p>
                <p className="text-xs text-[#6B7280] mt-1">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
