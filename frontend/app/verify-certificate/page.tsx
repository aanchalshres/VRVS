"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/app/lib/api";
import { ShieldCheck, ShieldX, AlertTriangle, Clock, Search, Award, ExternalLink } from "lucide-react";

interface VerifyResult {
  verified: boolean;
  status: string;
  message: string;
  reason?: string;
  revoked_at?: string;
  certificate?: {
    id: number;
    number: string;
    volunteer_name: string;
    task_title: string;
    organization_name: string;
    hours_contributed: number;
    issued_at: string;
    verification_count: number;
    last_verified_at: string;
  };
}

export default function PublicVerifyPage() {
  const [token, setToken] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      verifyByToken(t);
    }
  }, []);

  const verifyByToken = async (tok: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await apiGet<VerifyResult>(`/verify-certificate?token=${encodeURIComponent(tok)}`);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyByNumber = async () => {
    if (!certNumber.trim()) { setError("Enter a certificate number"); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await apiGet<VerifyResult>(`/verify-certificate?certificate_number=${encodeURIComponent(certNumber.trim())}`);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) verifyByToken(token.trim());
    else verifyByNumber();
  };

  const getStatusDisplay = () => {
    if (!result) return null;
    switch (result.status) {
      case "authentic":
        return {
          icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100", border: "border-green-200",
          title: "Certificate Authentic", desc: "This certificate is valid and has been verified.",
        };
      case "revoked":
        return {
          icon: ShieldX, color: "text-red-600", bg: "bg-red-100", border: "border-red-200",
          title: "Certificate Revoked", desc: result.reason ? `Reason: ${result.reason}` : "This certificate has been revoked.",
        };
      case "expired":
        return {
          icon: Clock, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200",
          title: "Certificate Expired", desc: "This certificate has passed its expiration date.",
        };
      case "tampered":
        return {
          icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", border: "border-red-200",
          title: "Certificate Tampered", desc: "Warning! The certificate data has been altered or the signature is invalid.",
        };
      case "not_found":
        return {
          icon: Search, color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200",
          title: "Certificate Not Found", desc: "No matching certificate record found.",
        };
      default:
        return {
          icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200",
          title: "Unknown Status", desc: result.message,
        };
    }
  };

  const statusDisp = getStatusDisplay();
  const StatusIcon = statusDisp?.icon || AlertTriangle;

  return (
    <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Award className="w-12 h-12 text-[#4F46C8] mx-auto mb-2" />
          <h1 className="text-xl font-bold text-[#111827]">Certificate Verification</h1>
          <p className="text-sm text-[#6B7280] mt-1">Verify the authenticity of a Sahayogi certificate</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#CACDD3] p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Verification Token</label>
            <input type="text" value={token} onChange={(e) => setToken(e.target.value)}
              placeholder="Paste verification token or scan QR code"
              className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-[#CACDD3]" />
            <span className="text-xs text-[#6B7280]">OR</span>
            <div className="flex-1 border-t border-[#CACDD3]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Certificate Number</label>
            <input type="text" value={certNumber} onChange={(e) => setCertNumber(e.target.value)}
              placeholder="e.g. CERT-abc123defg"
              className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
          </div>
          <button type="submit" disabled={loading || (!token.trim() && !certNumber.trim())}
            className="w-full bg-[#4F46C8] hover:bg-[#4338CA] text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
              : <><ShieldCheck className="w-4 h-4" /> Verify Certificate</>}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        {result && statusDisp && (
          <div className={`${statusDisp.bg} ${statusDisp.border} border rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-8 h-8 ${statusDisp.color}`} />
              <div>
                <p className={`text-base font-semibold ${statusDisp.color}`}>{statusDisp.title}</p>
                <p className="text-sm text-[#6B7280]">{statusDisp.desc}</p>
              </div>
            </div>

            {result.reason && (
              <div className="bg-white/60 rounded-lg p-3 text-sm">
                <span className="font-medium">Revocation Reason:</span> {result.reason}
              </div>
            )}

            {result.certificate && (
              <div className="bg-white rounded-xl p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-[#6B7280]">Volunteer</span><p className="font-medium text-[#111827]">{result.certificate.volunteer_name}</p></div>
                  <div><span className="text-[#6B7280]">Organization</span><p className="font-medium text-[#111827]">{result.certificate.organization_name}</p></div>
                  <div className="col-span-2"><span className="text-[#6B7280]">Task</span><p className="font-medium text-[#111827]">{result.certificate.task_title}</p></div>
                  <div><span className="text-[#6B7280]">Hours</span><p className="font-medium text-[#111827]">{result.certificate.hours_contributed}</p></div>
                  <div><span className="text-[#6B7280]">Issued</span><p className="font-medium text-[#111827]">{result.certificate.issued_at}</p></div>
                  <div className="col-span-2"><span className="text-[#6B7280]">Certificate #</span><p className="font-mono text-[#4F46C8] text-xs">{result.certificate.number}</p></div>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-[#CACDD3] text-xs text-[#6B7280]">
                  <span>Verified {result.certificate.verification_count} times</span>
                  {result.certificate.last_verified_at && <span>Last: {new Date(result.certificate.last_verified_at).toLocaleDateString()}</span>}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-[#6B7280] justify-center">
              <ShieldCheck className="w-3 h-3" /> Secure verification by Sahayogi Hub
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
