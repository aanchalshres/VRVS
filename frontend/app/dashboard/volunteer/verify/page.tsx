"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ShieldCheck, Upload, Camera, Send, Clock, CheckCircle2,
  AlertTriangle, XCircle, Loader2, FileText, ChevronRight,
  ArrowLeft, Eye, ScanLine, History, Image,
} from "lucide-react";
import {
  startVerification,
  uploadDocument,
  uploadSelfie,
  submitVerification,
  getVerificationStatus,
  getVerificationHistory,
  DOCUMENT_TYPE_LABELS,
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_STATUS_COLORS,
  DECISION_LABELS,
} from "@/app/lib/identityVerification";
import type {
  IdentityVerification,
  IdentityDocument,
  IdentitySelfie,
  DocumentType,
} from "@/app/types";

type Step = 'list' | 'document' | 'selfie' | 'submit' | 'status';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

function VerificationToast({ toast }: { toast: Toast | null }) {
  if (!toast) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
        {toast.message}
      </div>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="flex-1 h-1.5 rounded-full bg-[#B9C0D4]/40 overflow-hidden">
        <div
          className="h-full bg-[#4F46C8] transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <span className="text-xs font-medium text-[#6B7280]">{current}/{total}</span>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const val = score ?? 0;
  const color = val >= 80 ? 'bg-green-500' : val >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 text-[#6B7280] shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${val}%` }} />
      </div>
      <span className="w-10 text-right font-medium text-[#111827]">{val.toFixed(1)}%</span>
    </div>
  );
}

function DocumentPreviewCard({ doc }: { doc: IdentityDocument }) {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F0F1F3] border border-[#CACDD3]">
      <div className="w-10 h-10 rounded-lg bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
        <FileText size={18} className="text-[#4F46C8]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#111827] truncate">{doc.original_name}</p>
        <p className="text-xs text-[#6B7280]">{DOCUMENT_TYPE_LABELS[doc.document_type as DocumentType] || doc.document_type}</p>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        doc.validation_status === 'passed' ? 'bg-green-100 text-green-700' :
        doc.validation_status === 'failed' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'
      }`}>
        {doc.validation_status === 'passed' ? 'Valid' : doc.validation_status === 'failed' ? 'Invalid' : 'Pending'}
      </span>
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="p-1.5 rounded-lg hover:bg-white transition"
        title="Preview"
      >
        <Eye size={16} className="text-[#6B7280]" />
      </button>
      {showPreview && doc.file_url && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setShowPreview(false)}>
          <div className="max-w-lg max-h-[80vh] bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {doc.mime_type === 'application/pdf' ? (
              <iframe src={doc.file_url} className="w-full h-[60vh]" title={doc.original_name} />
            ) : (
              <img src={doc.file_url} alt={doc.original_name} className="w-full h-auto max-h-[70vh] object-contain" />
            )}
            <div className="p-3 text-center text-sm text-[#6B7280] border-t border-[#CACDD3]">
              {doc.original_name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelfiePreviewCard({ selfie }: { selfie: IdentitySelfie }) {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F0F1F3] border border-[#CACDD3]">
      <div className="w-10 h-10 rounded-lg bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
        <Image size={18} className="text-[#4F46C8]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#111827]">Selfie Photo</p>
        <p className="text-xs text-[#6B7280] capitalize">{selfie.face_detection_status?.replace(/_/g, ' ') || 'Pending'}</p>
      </div>
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="p-1.5 rounded-lg hover:bg-white transition"
        title="Preview"
      >
        <Eye size={16} className="text-[#6B7280]" />
      </button>
      {showPreview && selfie.file_url && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setShowPreview(false)}>
          <div className="max-w-md bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={selfie.file_url} alt="Selfie" className="w-full h-auto max-h-[70vh] object-contain" />
            <div className="p-3 text-center text-sm text-[#6B7280] border-t border-[#CACDD3]">
              Selfie Photo
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationStatusCard({ verification }: { verification: IdentityVerification }) {
  const statusColor = VERIFICATION_STATUS_COLORS[verification.status] || 'bg-gray-100 text-gray-600';
  return (
    <div className="bg-white rounded-2xl border border-[#CACDD3] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#111827]">Verification #{verification.id}</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
          {VERIFICATION_STATUS_LABELS[verification.status] || verification.status}
        </span>
      </div>

      {verification.decision && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#6B7280]">Decision:</span>
          <span className="font-medium text-[#111827]">{DECISION_LABELS[verification.decision] || verification.decision}</span>
        </div>
      )}

      {verification.decision_reason && (
        <p className="text-sm text-[#6B7280] bg-[#F0F1F3] rounded-lg p-3">{verification.decision_reason}</p>
      )}

      {verification.confidence_score !== null && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#111827]">Confidence Score</span>
            <span className={`text-lg font-bold ${
              verification.confidence_score >= 80 ? 'text-green-600' :
              verification.confidence_score >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {verification.confidence_score.toFixed(1)}%
            </span>
          </div>
          <div className="space-y-1.5">
            <ScoreBar label="OCR Accuracy" score={verification.ocr_score} />
            <ScoreBar label="Face Match" score={verification.face_match_score} />
            <ScoreBar label="Liveness" score={verification.liveness_score} />
            <ScoreBar label="Document Quality" score={verification.document_quality_score} />
            <ScoreBar label="Data Consistency" score={verification.data_consistency_score} />
          </div>
        </div>
      )}

      {verification.started_at && (
        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
          <span>Started: {new Date(verification.started_at).toLocaleString()}</span>
          {verification.completed_at && (
            <span>Completed: {new Date(verification.completed_at).toLocaleString()}</span>
          )}
        </div>
      )}

      {verification.documents.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-2">Documents</p>
          <div className="space-y-2">
            {verification.documents.map((doc, i) => (
              <DocumentPreviewCard key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      )}

      {verification.selfie && (
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-2">Selfie</p>
          <SelfiePreviewCard selfie={verification.selfie} />
        </div>
      )}
    </div>
  );
}

function HistoryItem({ verification }: { verification: IdentityVerification }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = VERIFICATION_STATUS_COLORS[verification.status] || 'bg-gray-100 text-gray-600';
  return (
    <div className="bg-white rounded-xl border border-[#CACDD3] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-[#F0F1F3] transition text-left"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          verification.status === 'verified' ? 'bg-green-100' :
          verification.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          {verification.status === 'verified' ? (
            <CheckCircle2 size={16} className="text-green-600" />
          ) : verification.status === 'rejected' ? (
            <XCircle size={16} className="text-red-600" />
          ) : (
            <Clock size={16} className="text-yellow-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#111827]">
            Verification #{verification.id}
            {verification.decision && (
              <span className="text-xs text-[#6B7280] ml-2">({DECISION_LABELS[verification.decision] || verification.decision})</span>
            )}
          </p>
          <p className="text-xs text-[#6B7280]">{verification.started_at ? new Date(verification.started_at).toLocaleDateString() : ''}</p>
        </div>
        {verification.confidence_score !== null && (
          <span className="text-sm font-semibold text-[#111827]">{verification.confidence_score.toFixed(1)}%</span>
        )}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
          {VERIFICATION_STATUS_LABELS[verification.status] || verification.status}
        </span>
        <ChevronRight size={16} className={`text-[#6B7280] transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <VerificationStatusCard verification={verification} />
        </div>
      )}
    </div>
  );
}

export default function VerifyIdentityPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [step, setStep] = useState<Step>('list');
  const [history, setHistory] = useState<IdentityVerification[]>([]);
  const [verification, setVerification] = useState<IdentityVerification | null>(null);
  const [activeVerification, setActiveVerification] = useState<IdentityVerification | null>(null);

  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('citizenship');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSelfie, setSelectedSelfie] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await getVerificationHistory();
      const items = res.data || [];
      setHistory(items);

      const active = items.find(
        (v) => v.status === 'pending' || v.status === 'processing'
      );
      setActiveVerification(active || null);
      return active || null;
    } catch (err: any) {
      return null;
    }
  }, []);

  const loadVerification = useCallback(async (id: number) => {
    try {
      const res = await getVerificationStatus(id);
      const v = res.data;
      setVerification(v);
      if (v.status !== 'pending' && v.status !== 'processing') {
        setActiveVerification(null);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
      return v;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadHistory();
      setLoading(false);
    }
    init();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [loadHistory]);

  useEffect(() => {
    if (step === 'status' && verification && (verification.status === 'processing' || verification.status === 'pending')) {
      pollingRef.current = setInterval(async () => {
        const v = await loadVerification(verification.id);
        if (v && (v.status !== 'processing' && v.status !== 'pending')) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          showToast('success', `Verification ${v.status}!`);
        }
      }, 5000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [step, verification?.id, verification?.status, loadVerification, showToast]);

  const handleStart = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await startVerification();
      const v = res.data;
      setVerification(v);
      setActiveVerification(v);
      setStep('document');
      showToast('success', 'Verification session started');
    } catch (err: any) {
      setError(err.message || 'Failed to start verification');
    } finally {
      setSubmitting(false);
    }
  };

  const validateFile = (file: File, isSelfie: boolean): string | null => {
    const maxSize = isSelfie ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${isSelfie ? '5MB' : '10MB'}.`;
    }
    if (file.size === 0) {
      return 'File is empty.';
    }
    if (isSelfie) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return 'Invalid file type. Only JPG, PNG, and WebP images are allowed for selfies.';
      }
    } else {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        return 'Invalid file type. Only JPG, PNG, WebP, and PDF files are allowed for documents.';
      }
    }
    return null;
  };

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValidationError(null);
    const err = validateFile(file, false);
    if (err) {
      setValidationError(err);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSelfieFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValidationError(null);
    const err = validateFile(file, true);
    if (err) {
      setValidationError(err);
      setSelectedSelfie(null);
      return;
    }
    setSelectedSelfie(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !verification) return;
    setSubmitting(true);
    setError(null);
    setUploadProgress(0);
    try {
      await uploadDocument(verification.id, selectedDocType, selectedFile, (pct) => {
        setUploadProgress(pct);
      });
      showToast('success', 'Document uploaded successfully');
      setSelectedFile(null);
      setPreviewUrl(null);
      const v = await loadVerification(verification.id);
      if (v) setVerification(v);
      if (v && v.selfie) {
        setStep('submit');
      } else {
        setStep('selfie');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleUploadSelfie = async () => {
    if (!selectedSelfie || !verification) return;
    setSubmitting(true);
    setError(null);
    setUploadProgress(0);
    try {
      await uploadSelfie(verification.id, selectedSelfie, (pct) => {
        setUploadProgress(pct);
      });
      showToast('success', 'Selfie uploaded successfully');
      setSelectedSelfie(null);
      setPreviewUrl(null);
      const v = await loadVerification(verification.id);
      if (v) setVerification(v);
      setStep('submit');
    } catch (err: any) {
      setError(err.message || 'Failed to upload selfie');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!verification) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitVerification(verification.id);
      showToast('success', 'Verification submitted for processing');
      const v = await loadVerification(verification.id);
      if (v) setVerification(v);
      setStep('status');
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const resumeActiveVerification = async () => {
    if (!activeVerification) return;
    setVerification(activeVerification);
    const v = await loadVerification(activeVerification.id);
    if (!v) return;

    if (v.status === 'processing') {
      setStep('status');
    } else if (v.status === 'pending') {
      const hasDoc = v.documents && v.documents.length > 0;
      const hasSelfie = !!v.selfie;
      if (hasDoc && hasSelfie) {
        setStep('submit');
      } else if (hasDoc) {
        setStep('selfie');
      } else {
        setStep('document');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (step === 'list') {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <VerificationToast toast={toast} />

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F46C8]/10">
              <ShieldCheck className="h-5 w-5 text-[#4F46C8]" />
            </span>
            <h1 className="text-xl font-bold text-[#111827]">Identity Verification</h1>
          </div>
          <p className="text-sm text-[#6B7280] mb-6">
            Verify your identity by uploading a valid identity document and a selfie photo.
          </p>

          {activeVerification && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">You have an active verification</p>
                  <p className="text-xs text-blue-600">Verification #{activeVerification.id} — {VERIFICATION_STATUS_LABELS[activeVerification.status]}</p>
                </div>
              </div>
              <button
                onClick={resumeActiveVerification}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
              >
                Continue
              </button>
            </div>
          )}

          {!activeVerification && (
            <button
              onClick={handleStart}
              disabled={submitting}
              className="w-full bg-[#4F46C8] hover:bg-[#3f39a8] disabled:bg-[#4F46C8]/50 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Starting...</>
              ) : (
                <><ScanLine size={18} /> Start New Verification</>
              )}
            </button>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {history.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <History size={16} className="text-[#6B7280]" />
                <h2 className="text-sm font-semibold text-[#111827]">Verification History</h2>
              </div>
              <div className="space-y-2">
                {history.map((v) => (
                  <HistoryItem key={v.id} verification={v} />
                ))}
              </div>
            </div>
          )}

          {history.length === 0 && !activeVerification && (
            <div className="bg-white rounded-2xl border border-[#CACDD3] p-8 text-center">
              <ShieldCheck size={40} className="mx-auto text-[#B9C0D4] mb-3" />
              <p className="text-[#111827] font-medium mb-1">No verification attempts yet</p>
              <p className="text-sm text-[#6B7280]">Start your first identity verification to unlock all features.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'document' && verification) {
    const hasDoc = (verification.documents?.length ?? 0) > 0;
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <VerificationToast toast={toast} />
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setStep('list')}
            className="flex items-center gap-2 text-sm text-[#6B7280] mb-4 hover:text-[#111827] transition"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="bg-white rounded-2xl border border-[#CACDD3] p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46C8]/10">
                <Upload className="h-4 w-4 text-[#4F46C8]" />
              </span>
              <h2 className="text-lg font-bold text-[#111827]">Upload Identity Document</h2>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">Upload a clear photo or scan of your identity document.</p>
            <StepIndicator current={hasDoc ? 2 : 1} total={4} />

            {hasDoc ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Document already uploaded
                </p>
                {verification.documents.map((doc, i) => (
                  <DocumentPreviewCard key={doc.id} doc={doc} index={i} />
                ))}
                <button
                  onClick={() => { setStep('selfie'); }}
                  className="w-full bg-[#4F46C8] hover:bg-[#3f39a8] text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  Continue to Selfie <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#111827] block mb-1.5">Document Type</label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                    className="w-full border border-[#CACDD3] rounded-lg px-3 py-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]/30 bg-white"
                  >
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#111827] block mb-1.5">Document File</label>
                  <div className="border-2 border-dashed border-[#CACDD3] rounded-xl p-6 text-center hover:border-[#4F46C8]/50 transition cursor-pointer"
                    onClick={() => document.getElementById('doc-upload')?.click()}
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText size={32} className="mx-auto text-[#4F46C8]" />
                        <p className="text-sm font-medium text-[#111827]">{selectedFile.name}</p>
                        <p className="text-xs text-[#6B7280]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={32} className="mx-auto text-[#B9C0D4]" />
                        <p className="text-sm text-[#6B7280]">Click to upload or drag and drop</p>
                        <p className="text-xs text-[#B9C0D4]">JPG, PNG, WebP, or PDF (max 10MB)</p>
                      </div>
                    )}
                    <input
                      id="doc-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={handleDocFileSelect}
                    />
                  </div>
                </div>

                {validationError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    {validationError}
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {uploadProgress > 0 && (
                  <div>
                    <div className="h-2 rounded-full bg-[#B9C0D4]/40 overflow-hidden">
                      <div className="h-full bg-[#4F46C8] transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1 text-center">Uploading... {uploadProgress}%</p>
                  </div>
                )}

                <button
                  onClick={handleUploadDocument}
                  disabled={!selectedFile || submitting}
                  className="w-full bg-[#4F46C8] hover:bg-[#3f39a8] disabled:bg-[#4F46C8]/50 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload size={18} /> Upload Document</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'selfie' && verification) {
    const hasSelfie = !!verification.selfie;
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <VerificationToast toast={toast} />
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => {
              if (verification.documents?.length > 0) setStep('document');
              else setStep('list');
            }}
            className="flex items-center gap-2 text-sm text-[#6B7280] mb-4 hover:text-[#111827] transition"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="bg-white rounded-2xl border border-[#CACDD3] p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46C8]/10">
                <Camera className="h-4 w-4 text-[#4F46C8]" />
              </span>
              <h2 className="text-lg font-bold text-[#111827]">Upload Selfie</h2>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">Take a clear selfie for face verification.</p>
            <StepIndicator current={hasSelfie ? 3 : 2} total={4} />

            {hasSelfie ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Selfie already uploaded
                </p>
                <SelfiePreviewCard selfie={verification.selfie} />
                <button
                  onClick={() => setStep('submit')}
                  className="w-full bg-[#4F46C8] hover:bg-[#3f39a8] text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  Continue to Submit <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-[#CACDD3] rounded-xl p-6 text-center hover:border-[#4F46C8]/50 transition cursor-pointer"
                  onClick={() => document.getElementById('selfie-upload')?.click()}
                >
                  {selectedSelfie ? (
                    <div className="space-y-2">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#4F46C8]">
                        <img src={previewUrl || ''} alt="Selfie preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm font-medium text-[#111827]">{selectedSelfie.name}</p>
                      <p className="text-xs text-[#6B7280]">{(selectedSelfie.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera size={40} className="mx-auto text-[#B9C0D4]" />
                      <p className="text-sm text-[#6B7280]">Click to upload your selfie</p>
                      <p className="text-xs text-[#B9C0D4]">JPG, PNG, or WebP (max 5MB)</p>
                    </div>
                  )}
                  <input
                    id="selfie-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleSelfieFileSelect}
                  />
                </div>

                {validationError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    {validationError}
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {uploadProgress > 0 && (
                  <div>
                    <div className="h-2 rounded-full bg-[#B9C0D4]/40 overflow-hidden">
                      <div className="h-full bg-[#4F46C8] transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1 text-center">Uploading... {uploadProgress}%</p>
                  </div>
                )}

                <button
                  onClick={handleUploadSelfie}
                  disabled={!selectedSelfie || submitting}
                  className="w-full bg-[#4F46C8] hover:bg-[#3f39a8] disabled:bg-[#4F46C8]/50 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Camera size={18} /> Upload Selfie</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'submit' && verification) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <VerificationToast toast={toast} />
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setStep(verification.selfie ? 'selfie' : 'document')}
            className="flex items-center gap-2 text-sm text-[#6B7280] mb-4 hover:text-[#111827] transition"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="bg-white rounded-2xl border border-[#CACDD3] p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46C8]/10">
                <Send className="h-4 w-4 text-[#4F46C8]" />
              </span>
              <h2 className="text-lg font-bold text-[#111827]">Submit Verification</h2>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">Review your submission before sending.</p>
            <StepIndicator current={4} total={4} />

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-[#6B7280] mb-2">Uploaded Documents</p>
                <div className="space-y-2">
                  {verification.documents.map((doc, i) => (
                    <DocumentPreviewCard key={doc.id} doc={doc} index={i} />
                  ))}
                </div>
              </div>

              {verification.selfie && (
                <div>
                  <p className="text-xs font-medium text-[#6B7280] mb-2">Selfie</p>
                  <SelfiePreviewCard selfie={verification.selfie} />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#4F46C8] hover:bg-[#3f39a8] disabled:bg-[#4F46C8]/50 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={18} /> Submit for Verification</>
                )}
              </button>

              <p className="text-xs text-center text-[#6B7280]">
                Once submitted, the system will process your documents. This may take a moment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'status' && verification) {
    const isProcessing = verification.status === 'pending' || verification.status === 'processing';
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <VerificationToast toast={toast} />
        <div className="max-w-lg mx-auto space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F46C8]/10">
              <ShieldCheck className="h-5 w-5 text-[#4F46C8]" />
            </span>
            <h1 className="text-xl font-bold text-[#111827]">Verification Status</h1>
          </div>

          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <Loader2 size={28} className="mx-auto text-blue-600 animate-spin mb-2" />
              <p className="text-sm font-medium text-blue-800">Processing your verification...</p>
              <p className="text-xs text-blue-600 mt-1">This should only take a few seconds.</p>
            </div>
          )}

          <VerificationStatusCard verification={verification} />

          <div className="flex gap-3">
            <button
              onClick={async () => {
                await loadHistory();
                setStep('list');
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#CACDD3] text-sm font-medium text-[#111827] hover:bg-[#F0F1F3] transition"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
