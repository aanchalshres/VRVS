"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/app/lib/api";
import { Award, Download, ShieldCheck, QrCode, Share2, ArrowLeft, Copy, CheckCircle } from "lucide-react";
import Link from "next/link";

interface AuthStatus {
  verification_count: number;
  last_verified_at: string | null;
  is_revoked: boolean;
  status: string;
}

interface QrData {
  qr_code_url: string | null;
  verification_url: string;
  certificate_number: string;
}

export default function CertificateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [cert, setCert] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [certRes, authRes, qrRes] = await Promise.all([
          apiGet<any>(`/volunteer/certificates/${id}`),
          apiGet<any>(`/volunteer/certificates/${id}/auth-status`).catch(() => null),
          apiGet<any>(`/volunteer/certificates/${id}/qr`).catch(() => null),
        ]);
        setCert(certRes.data);
        if (authRes?.data) setAuthStatus(authRes.data);
        if (qrRes?.data) setQrData(qrRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const copyUrl = () => {
    if (qrData?.verification_url) {
      navigator.clipboard.writeText(qrData.verification_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await apiGet<any>(`/volunteer/certificates/${id}/download`);
      const blob = new Blob([res.data.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${cert?.certificate_number || id}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#CACDD3] p-8 text-center">
          <p className="text-[#6B7280]">Certificate not found</p>
          <Link href="/dashboard/volunteer/certificates" className="text-[#4F46C8] text-sm mt-2 inline-block">Back to certificates</Link>
        </div>
      </div>
    );
  }

  const content = cert.content || {};
  const statusLabel = authStatus?.is_revoked ? "Revoked" : authStatus?.status === "active" ? "Active" : authStatus?.status || "Unknown";
  const statusColor = authStatus?.is_revoked ? "text-red-600 bg-red-100" : authStatus?.status === "active" ? "text-green-600 bg-green-100" : "text-gray-600 bg-gray-100";

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/dashboard/volunteer/certificates" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#4F46C8]">
          <ArrowLeft className="w-4 h-4" /> Back to certificates
        </Link>

        <div className="bg-white rounded-2xl border border-[#CACDD3] overflow-hidden">
          <div className="h-24 bg-[#4F46C8]" />
          <div className="px-6 pb-6 -mt-8">
            <div className="w-16 h-16 rounded-full bg-white border-4 border-[#E0E3EB] flex items-center justify-center">
              <Award className="w-8 h-8 text-[#4F46C8]" />
            </div>
            <div className="mt-4">
              <h1 className="text-xl font-semibold text-[#111827]">{content.task_title || cert.task?.title || "Certificate"}</h1>
              <p className="text-sm text-[#6B7280] mt-1">{content.organization_name || cert.ngo?.organization_name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Volunteer</p>
            <p className="text-sm font-medium text-[#111827] mt-1">{content.volunteer_name || "You"}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Hours Contributed</p>
            <p className="text-sm font-medium text-[#111827] mt-1">{content.hours_contributed || 0}h</p>
          </div>
          <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
            <p className="text-xs text-[#6B7280]">Issued</p>
            <p className="text-sm font-medium text-[#111827] mt-1">{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#CACDD3] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#4F46C8]" />
              <div>
                <p className="text-sm font-medium text-[#111827]">Authentication Status</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{cert.certificate_number}</p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
          </div>
          {authStatus && (
            <div className="mt-3 flex items-center gap-4 text-xs text-[#6B7280] border-t border-[#CACDD3] pt-3">
              <span>Verified {authStatus.verification_count} times</span>
              {authStatus.last_verified_at && <span>Last: {new Date(authStatus.last_verified_at).toLocaleDateString()}</span>}
            </div>
          )}
        </div>

        {qrData && (
          <div className="bg-white rounded-xl border border-[#CACDD3] p-5">
            <button onClick={() => setShowQR(!showQR)} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-[#4F46C8]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-[#111827]">Verification QR Code</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">Scan to verify certificate</p>
                </div>
              </div>
              <span className="text-xs text-[#4F46C8]">{showQR ? "Hide" : "Show"}</span>
            </button>
            {showQR && (
              <div className="mt-4 pt-4 border-t border-[#CACDD3] space-y-3">
                {qrData.qr_code_url && (
                  <div className="flex justify-center">
                    <img src={qrData.qr_code_url} alt="QR Code" className="w-40 h-40" />
                  </div>
                )}
                <div className="bg-[#F0F1F3] rounded-lg p-3 flex items-center justify-between">
                  <span className="text-xs text-[#6B7280] truncate mr-2">{qrData.verification_url}</span>
                  <button onClick={copyUrl} className="shrink-0 p-1.5 rounded-lg hover:bg-white transition-colors" title="Copy URL">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#6B7280]" />}
                  </button>
                </div>
                <a href={qrData.verification_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full border border-[#CACDD3] rounded-lg py-2 text-sm text-[#4F46C8] hover:bg-[#F0F1F3] transition-colors">
                  <ExternalLinkSvg /> Open Verification Page
                </a>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-[#4F46C8] hover:bg-[#4338CA] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Download Certificate
          </button>
          {qrData?.verification_url && (
            <button onClick={copyUrl}
              className="flex items-center justify-center gap-2 border border-[#CACDD3] hover:bg-[#F0F1F3] px-4 py-2.5 rounded-lg text-sm text-[#6B7280] transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExternalLinkSvg() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}
