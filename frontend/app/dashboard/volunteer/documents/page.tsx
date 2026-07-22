"use client";

import { useEffect, useState } from "react";
import { apiGet, apiUpload, apiDelete } from "@/app/lib/api";

interface VolunteerDocument {
  id: number;
  document_type: string;
  original_name: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  status: "pending" | "verified" | "rejected";
  reviewed_by: number | null;
  reviewed_at: string | null;
  remarks: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

function getDocumentStatusBadge(status: string) {
  if (status === "verified") return "bg-green-100 text-green-700";
  if (status === "pending") return "bg-yellow-100 text-yellow-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function IconSpinner({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return <span className={`${className} border-2 border-white/40 border-t-white rounded-full animate-spin inline-block`} />;
}

function IconX({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconTrash({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconDownload({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "");

export default function VolunteerDocumentsPage() {
  const [documents, setDocuments] = useState<VolunteerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [docType, setDocType] = useState("citizenship");
  const [docRemarks, setDocRemarks] = useState("");

  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiGet<any>("/volunteer/documents");
      setDocuments(response.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById("doc-file-input") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setUploadError("Please select a file.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("document_type", docType);
      if (docRemarks) formData.append("remarks", docRemarks);

      await apiUpload<any>("/volunteer/documents", formData);
      if (fileInput) fileInput.value = "";
      setDocRemarks("");
      setDocType("citizenship");
      setSuccessMessage("Document uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setDeletingDocId(docId);
    try {
      await apiDelete(`/volunteer/documents/${docId}`);
      setSuccessMessage("Document deleted.");
      setTimeout(() => setSuccessMessage(""), 5000);
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete document.");
    } finally {
      setDeletingDocId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-NP", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin inline-block" />
          <p className="text-[#4F46C8] text-lg font-semibold">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4">Upload Document</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Document type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)}
                  className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8] bg-white">
                  <option value="citizenship">Citizenship</option>
                  <option value="passport">Passport</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#6B7280] mb-1">File (JPG, PNG, PDF, DOC, DOCX - max 10MB)</label>
                <input id="doc-file-input" type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#4F46C8]/10 file:text-[#4F46C8] hover:file:bg-[#4F46C8]/20" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Remarks (optional)</label>
              <input type="text" value={docRemarks} onChange={(e) => setDocRemarks(e.target.value)}
                placeholder="Any additional notes..."
                className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
            </div>
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600">{uploadError}</p>
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={handleUpload} disabled={uploading}
                className="px-5 py-2 text-sm font-medium text-white bg-[#4F46C8] hover:bg-[#4338CA] rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
                {uploading ? (
                  <><IconSpinner />Uploading...</>
                ) : "Upload"}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Documents */}
        <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#111827]">Uploaded Documents</h2>
            <span className="text-xs text-[#6B7280]">{documents.length} document{documents.length !== 1 ? "s" : ""}</span>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-[#6B7280]">No documents uploaded yet.</p>
              <p className="text-xs text-[#6B7280] mt-1">Use the form above to upload your first document.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const previewUrl = `${API_BASE}/storage/${doc.file_path}`;
                const isImage = doc.mime_type.startsWith("image/");
                const isPdf = doc.mime_type === "application/pdf";
                return (
                  <div key={doc.id} className="border border-[#CACDD3] rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#F0F1F3]">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#111827] capitalize">
                            {doc.document_type.replace("_", " ")}
                          </p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDocumentStatusBadge(doc.status)}`}>
                            {doc.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-[#6B7280]">
                          <span className="truncate max-w-[200px]">{doc.original_name}</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{formatDate(doc.created_at)}</span>
                        </div>
                        {doc.remarks && (
                          <p className="text-xs text-[#6B7280] mt-0.5 italic">&ldquo;{doc.remarks}&rdquo;</p>
                        )}
                      </div>
                      <div className="shrink-0 ml-4 flex items-center gap-1">
                        <a href={`${API_BASE}/api/volunteer/documents/${doc.id}`}
                          className="p-2 text-[#6B7280] hover:text-[#4F46C8] hover:bg-[#4F46C8]/10 rounded-lg transition-colors"
                          title="Download document" download>
                          <IconDownload className="h-4 w-4" />
                        </a>
                        {doc.status === "pending" && (
                          <button onClick={() => handleDelete(doc.id)} disabled={deletingDocId === doc.id}
                            className="p-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete document">
                            {deletingDocId === doc.id ? (
                              <IconSpinner className="w-4 h-4 border-2 border-gray-400 border-t-gray-600" />
                            ) : (
                              <IconTrash className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-2 bg-white">
                      {isImage ? (
                        <img src={previewUrl} alt={doc.document_type}
                          className="w-full max-h-48 object-contain rounded" />
                      ) : isPdf ? (
                        <iframe src={previewUrl} className="w-full h-48 rounded bg-gray-50"
                          title={doc.original_name} />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-gray-50 rounded text-xs text-[#6B7280]">
                          Preview not available.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}