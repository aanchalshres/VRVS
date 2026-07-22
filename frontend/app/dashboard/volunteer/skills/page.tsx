"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { apiGet, apiPost, apiDelete, apiUpload, apiCall } from "@/app/lib/api";

// ---------- Design tokens ----------
const COLORS = {
  primary: "#4F46C8",
  primaryHover: "#433CB0",
  secondary: "#7683D6",
  secondaryHover: "#6470C4",
  background: "#F0F1F3",
  border: "#CACDD3",
  soft: "#B9C0D4",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
};

// ---------- Types ----------
interface Skill {
  id: number;
  name: string;
}

interface Document {
  id: number;
  document_type: "citizenship" | "passport" | "certificate" | "other";
  file_path: string;
  status: "pending" | "approved" | "rejected";
  remarks: string | null;
  created_at: string;
  file_name?: string;
  original_name?: string;
  expires_at?: string | null;
}

// ---------- Small icon set (inline SVG, no external deps) ----------
function IconSparkles({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function IconSearch({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconAlert({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconCheckCircle({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconX({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconSave({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );
}

function IconSpinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function IconFolder({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function IconTrash({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconDownload({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// Document-type-aware file icon (used in the table, replaces the emoji)
function IconDocFile({ type, className = "h-5 w-5" }: { type: Document["document_type"]; className?: string }) {
  if (type === "certificate") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l1.5 1.5 3-3.75M4.5 4.5h15a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-5.379a1.5 1.5 0 00-1.06.44l-2.122 2.122a.5.5 0 01-.878-.33V16.5H4.5A1.5 1.5 0 013 15V6a1.5 1.5 0 011.5-1.5z" />
      </svg>
    );
  }
  if (type === "passport" || type === "citizenship") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="4" y="3" width="16" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2.25" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 16c.7-1.5 2.1-2.25 3.75-2.25s3.05.75 3.75 2.25" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 3v5a1 1 0 001 1h5" />
    </svg>
  );
}

function IconUpload({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2" />
    </svg>
  );
}

export default function VolunteerSkillsPage() {
  // ---------- Skills state ----------
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ---------- Documents state ----------
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSuccess, setDocSuccess] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<Document["document_type"]>("other");
  const [uploadRemarks, setUploadRemarks] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- Data fetching (skills) ----------
  const fetchSkills = useCallback(async () => {
    try {
      const data = await apiGet<any>("/skills");
      setSkills(data.data);
    } catch (err) {
      setError("Failed to load available skills.");
      console.error(err);
    }
  }, []);

  const fetchVolunteerSkills = useCallback(async () => {
    try {
      const data = await apiGet<any>("/volunteer/skills");
      setSelectedSkills(data.data.map((item: any) => item.id));
    } catch (err) {
      setError("Failed to load your saved skills.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Documents fetching ----------
  const fetchDocuments = useCallback(async () => {
    try {
      const data = await apiGet<any>("/volunteer/documents");
      setDocuments(data.data);
    } catch (err) {
      setDocError("Failed to load your documents.");
      console.error(err);
    } finally {
      setDocsLoading(false);
    }
  }, []);

  // ---------- Effects ----------
  useEffect(() => {
    fetchSkills();
    fetchVolunteerSkills();
    fetchDocuments();
  }, [fetchSkills, fetchVolunteerSkills, fetchDocuments]);

  // ---------- Skills handlers ----------
  const toggleSkill = useCallback((skillId: number) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
    setSuccessMessage(null);
    setError(null);
  }, []);

  const clearSelectedSkills = useCallback(() => {
    setSelectedSkills([]);
  }, []);

  const saveSkills = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await apiPost("/volunteer/skills", { skill_ids: selectedSkills });
      setSuccessMessage("Skills updated successfully!");
    } catch (err) {
      setError("Failed to save skills. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [selectedSkills]);

  const filteredSkills = useMemo(
    () => skills.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [skills, searchTerm]
  );

  const selectedSkillObjects = useMemo(
    () => skills.filter((s) => selectedSkills.includes(s.id)),
    [skills, selectedSkills]
  );

  // ---------- Document handlers ----------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const uploadDocument = useCallback(async () => {
    if (!selectedFile) {
      setDocError("Please select a file.");
      return;
    }
    setUploading(true);
    setDocError(null);
    setDocSuccess(null);
    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("document_type", documentType);
      formData.append("remarks", uploadRemarks);
      const data = await apiUpload<any>("/volunteer/documents", formData);
      setDocuments((prev) => [data.data, ...prev]);
      setDocSuccess("Document uploaded successfully!");
      setSelectedFile(null);
      setDocumentType("other");
      setUploadRemarks("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setDocError("Failed to upload document. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, documentType, uploadRemarks]);

  const removeDocument = useCallback(async (id: number) => {
    try {
      await apiDelete(`/volunteer/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setDocSuccess("Document removed.");
    } catch (err) {
      setDocError("Failed to remove document.");
      console.error(err);
    }
  }, []);

  const downloadDocument = useCallback(async (doc: Document) => {
    try {
      const response = await apiCall(`/volunteer/documents/${doc.id}`);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_name || doc.file_name || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setDocError("Failed to download document.");
      console.error(err);
    }
  }, []);

  const isDocExpired = useCallback((doc: Document): boolean => {
    if (!doc.expires_at) return false;
    return new Date(doc.expires_at) < new Date();
  }, []);

  const handleReplaceDocument = useCallback((doc: Document) => {
    setDocumentType(doc.document_type);
    setUploadRemarks("Replacement for expired document");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ---------- Loading skeletons ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: COLORS.background }}>
        <div className="w-full max-w-5xl space-y-6 animate-pulse">
          <div className="bg-white rounded-2xl p-6 space-y-4 border" style={{ borderColor: COLORS.border }}>
            <div className="h-8 w-48 rounded" style={{ backgroundColor: COLORS.soft, opacity: 0.35 }}></div>
            <div className="h-4 w-64 rounded" style={{ backgroundColor: COLORS.soft, opacity: 0.25 }}></div>
            <div className="flex flex-wrap gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 w-24 rounded-full" style={{ backgroundColor: COLORS.soft, opacity: 0.3 }}></div>
              ))}
            </div>
            <div className="h-20 rounded-xl" style={{ backgroundColor: COLORS.soft, opacity: 0.2 }}></div>
            <div className="flex justify-end">
              <div className="h-12 w-32 rounded-lg" style={{ backgroundColor: COLORS.soft, opacity: 0.3 }}></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 space-y-4 border" style={{ borderColor: COLORS.border }}>
            <div className="h-8 w-48 rounded" style={{ backgroundColor: COLORS.soft, opacity: 0.35 }}></div>
            <div className="h-4 w-64 rounded" style={{ backgroundColor: COLORS.soft, opacity: 0.25 }}></div>
            <div className="h-32 rounded-xl" style={{ backgroundColor: COLORS.soft, opacity: 0.2 }}></div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.background }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ---- SKILLS CARD ---- */}
        <div
          className="bg-white rounded-3xl shadow-sm border p-6 md:p-8 transition-all"
          style={{ borderColor: COLORS.border }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3" style={{ color: COLORS.textPrimary }}>
                <span
                  className="p-2.5 rounded-xl text-white flex items-center justify-center"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <IconSparkles className="h-6 w-6" />
                </span>
                Volunteer Skills
              </h1>
              <p className="mt-1" style={{ color: COLORS.textSecondary }}>
                Select the skills that best describe your abilities.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <span
                className="text-sm px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: `${COLORS.primary}1A`, color: COLORS.primary }}
              >
                {selectedSkills.length} selected
              </span>
              {selectedSkills.length > 0 && (
                <button
                  onClick={clearSelectedSkills}
                  className="text-sm font-medium transition-colors hover:opacity-75"
                  style={{ color: "#DC2626" }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72 px-4 py-2.5 pl-10 rounded-full border focus:outline-none focus:ring-2 transition-shadow"
              style={{
                backgroundColor: COLORS.background,
                borderColor: COLORS.border,
                color: COLORS.textPrimary,
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary}40`)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.textSecondary }}>
              <IconSearch className="h-5 w-5" />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div
              className="mb-4 p-4 rounded-lg flex items-center gap-3 border-l-4"
              style={{ backgroundColor: "#FEF2F2", borderColor: "#DC2626", color: "#B91C1C" }}
            >
              <IconAlert className="h-6 w-6 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div
              className="mb-4 p-4 rounded-lg flex items-center gap-3 border-l-4"
              style={{ backgroundColor: "#F0FDF4", borderColor: "#16A34A", color: "#15803D" }}
            >
              <IconCheckCircle className="h-6 w-6 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Skills grid */}
          <div className="flex flex-wrap gap-3 mb-8" role="group" aria-label="Available skills">
            {filteredSkills.length === 0 ? (
              <p className="w-full text-center py-8" style={{ color: COLORS.textSecondary }}>
                No skills match your search.
              </p>
            ) : (
              filteredSkills.map((skill) => {
                const selected = selectedSkills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    aria-pressed={selected}
                    className="px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
                    style={
                      selected
                        ? {
                            backgroundColor: COLORS.primary,
                            color: "#FFFFFF",
                            borderColor: COLORS.primary,
                            boxShadow: "0 4px 10px rgba(79,70,200,0.25)",
                          }
                        : {
                            backgroundColor: "#FFFFFF",
                            color: COLORS.textPrimary,
                            borderColor: COLORS.border,
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = COLORS.secondary;
                        e.currentTarget.style.backgroundColor = `${COLORS.secondary}0D`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = COLORS.border;
                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                      }
                    }}
                  >
                    {selected && <IconCheck className="h-4 w-4" />}
                    {skill.name}
                  </button>
                );
              })
            )}
          </div>

          {/* Selected summary */}
          <div
            className="rounded-2xl p-5 border"
            style={{ backgroundColor: `${COLORS.soft}26`, borderColor: COLORS.border }}
          >
            <h2 className="font-semibold flex items-center gap-2" style={{ color: COLORS.textPrimary }}>
              Your Selected Skills
              <span
                className="inline-flex items-center justify-center text-white text-xs px-2.5 py-0.5 rounded-full min-w-[1.5rem]"
                style={{ backgroundColor: COLORS.primary }}
              >
                {selectedSkills.length}
              </span>
            </h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSkillObjects.length === 0 ? (
                <p className="italic" style={{ color: COLORS.textSecondary }}>
                  No skills selected yet.
                </p>
              ) : (
                selectedSkillObjects.map((skill) => (
                  <span
                    key={skill.id}
                    className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-sm font-medium shadow-sm"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    {skill.name}
                    <button
                      onClick={() => toggleSkill(skill.id)}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <IconX className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSkills}
              disabled={saving}
              className="relative text-white px-10 py-3.5 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2"
              style={{ backgroundColor: COLORS.primary }}
              onMouseEnter={(e) => {
                if (!saving) e.currentTarget.style.backgroundColor = COLORS.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primary;
              }}
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <IconSpinner className="h-5 w-5 text-white" />
                  Saving...
                </>
              ) : (
                <>
                  <IconSave className="h-5 w-5" />
                  Save Skills
                </>
              )}
            </button>
          </div>
        </div>

        {/* ---- DOCUMENTS CARD ---- */}
        <div
          className="bg-white rounded-3xl shadow-sm border p-6 md:p-8 transition-all"
          style={{ borderColor: COLORS.border }}
        >
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2" style={{ color: COLORS.textPrimary }}>
            <span style={{ color: COLORS.primary }}>
              <IconFolder className="h-6 w-6" />
            </span>
            Verification Documents
          </h2>
          <p className="mb-6" style={{ color: COLORS.textSecondary }}>
            Upload your citizenship, passport, certificates, or other verification files.
          </p>

          {/* Document messages */}
          {docError && (
            <div
              className="mb-4 p-4 rounded-lg flex items-center gap-3 border-l-4"
              style={{ backgroundColor: "#FEF2F2", borderColor: "#DC2626", color: "#B91C1C" }}
            >
              <IconAlert className="h-6 w-6 flex-shrink-0" />
              <span>{docError}</span>
            </div>
          )}
          {docSuccess && (
            <div
              className="mb-4 p-4 rounded-lg flex items-center gap-3 border-l-4"
              style={{ backgroundColor: "#F0FDF4", borderColor: "#16A34A", color: "#15803D" }}
            >
              <IconCheckCircle className="h-6 w-6 flex-shrink-0" />
              <span>{docSuccess}</span>
            </div>
          )}

          {/* Upload form */}
          <div
            className="rounded-2xl p-5 border-2 border-dashed transition-colors mb-6"
            style={{
              backgroundColor: `${COLORS.soft}1F`,
              borderColor: isDragging ? COLORS.primary : COLORS.border,
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex items-center gap-2 mb-4" style={{ color: COLORS.textSecondary }}>
              <IconUpload className="h-6 w-6" />
              <span className="text-sm">Drag and drop a file here, or choose one below.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="document-type" className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>
                  Document Type
                </label>
                <select
                  id="document-type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as Document["document_type"])}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: COLORS.border, color: COLORS.textPrimary, backgroundColor: "#FFFFFF" }}
                >
                  <option value="citizenship">Citizenship</option>
                  <option value="passport">Passport</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>
                  File
                </label>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:text-white"
                  style={{ color: COLORS.textSecondary }}
                />
                <style>{`#file-upload::file-selector-button { background-color: ${COLORS.primary}; } #file-upload::file-selector-button:hover { background-color: ${COLORS.primaryHover}; }`}</style>
                {selectedFile && (
                  <p className="text-xs mt-1.5 truncate flex items-center gap-1.5" style={{ color: COLORS.textSecondary }}>
                    <IconDocFile type={documentType} className="h-4 w-4 flex-shrink-0" />
                    {selectedFile.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="doc-remarks" className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>
                  Remarks <span className="text-xs" style={{ color: COLORS.textSecondary }}>(optional)</span>
                </label>
                <input
                  id="doc-remarks"
                  type="text"
                  value={uploadRemarks}
                  onChange={(e) => setUploadRemarks(e.target.value)}
                  placeholder="e.g., Front side of ID"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: COLORS.border, color: COLORS.textPrimary, backgroundColor: "#FFFFFF" }}
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={uploadDocument}
                  disabled={uploading || !selectedFile}
                  className="text-white px-8 py-2.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: COLORS.secondary }}
                  onMouseEnter={(e) => {
                    if (!uploading && selectedFile) e.currentTarget.style.backgroundColor = COLORS.secondaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.secondary;
                  }}
                >
                  {uploading ? (
                    <>
                      <IconSpinner className="h-5 w-5" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Document"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Document list */}
          {docsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg" style={{ backgroundColor: COLORS.soft, opacity: 0.25 }}></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {documents.length === 0 ? (
                <p className="italic text-center py-8" style={{ color: COLORS.textSecondary }}>
                  No documents uploaded yet.
                </p>
              ) : (
                <table className="min-w-full divide-y" style={{ borderColor: COLORS.border }}>
                  <thead>
                    <tr>
                      {["File", "Type", "Status", "Expiry", "Remarks", "Uploaded", ""].map((h, i) => (
                        <th
                          key={i}
                          className={`px-4 py-3 text-xs font-medium uppercase tracking-wider ${
                            h === "" ? "text-right" : "text-left"
                          }`}
                          style={{ color: COLORS.textSecondary }}
                        >
                          {h === "" ? "Action" : h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: COLORS.border }}>
                    {documents.map((doc) => {
                      const expired = isDocExpired(doc);
                      return (
                      <tr
                        key={doc.id}
                        className="transition-colors"
                        style={expired ? { backgroundColor: "#FEF2F2", opacity: 0.9 } : {}}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = expired ? "#FEE2E2" : `${COLORS.soft}1A`)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = expired ? "#FEF2F2" : "transparent")}
                      >
                        <td className="px-4 py-3 text-sm" style={{ color: COLORS.textPrimary }}>
                          <span className="flex items-center gap-2 truncate max-w-[180px]">
                            <span style={{ color: COLORS.textSecondary }} className="flex-shrink-0">
                              <IconDocFile type={doc.document_type} className="h-4 w-4" />
                            </span>
                            {doc.original_name || doc.file_name || doc.file_path.split("/").pop()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm capitalize" style={{ color: COLORS.textPrimary }}>
                          {doc.document_type}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={
                              doc.status === "approved"
                                ? { backgroundColor: "#DCFCE7", color: "#15803D" }
                                : doc.status === "rejected"
                                ? { backgroundColor: "#FEE2E2", color: "#B91C1C" }
                                : { backgroundColor: "#FEF9C3", color: "#A16207" }
                            }
                          >
                            {doc.status}
                          </span>
                          {expired && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
                              Expired
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: COLORS.textSecondary }}>
                          {doc.expires_at ? new Date(doc.expires_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: COLORS.textSecondary }}>
                          {doc.remarks || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: COLORS.textSecondary }}>
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => downloadDocument(doc)}
                              className="transition-colors hover:opacity-70"
                              style={{ color: "#4F46C8" }}
                              aria-label="Download document"
                              title="Download"
                            >
                              <IconDownload className="h-4 w-4" />
                            </button>
                            {expired && (
                              <button
                                onClick={() => handleReplaceDocument(doc)}
                                className="text-xs font-medium px-2 py-1 rounded transition-colors"
                                style={{ backgroundColor: "#EEF0FF", color: "#4F46C8" }}
                                title="Replace expired document"
                              >
                                Replace
                              </button>
                            )}
                            {doc.status === "pending" && (
                              <button
                                onClick={() => removeDocument(doc.id)}
                                className="transition-colors hover:opacity-70"
                                style={{ color: "#F87171" }}
                                aria-label="Remove document"
                                title="Remove"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}