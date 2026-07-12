"use client";

import { useEffect, useRef, useState } from "react";

interface VolunteerDocument {
  id: number;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
}

interface VolunteerProfile {
  id: number;
  user_id: number;
  name?: string;
  email?: string;
  profile_photo: string | null;
  gender: "male" | "female" | "other" | null;
  date_of_birth: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  availability_status: "available" | "unavailable" | "busy";
  verification_status: "pending" | "approved" | "rejected";
  verified_by_ngo_id: number | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  documents: VolunteerDocument[];
}

interface EditFormData {
  name: string;
  bio: string;
  gender: "male" | "female" | "other" | "";
  date_of_birth: string;
  address: string;
  city: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  availability_status: "available" | "unavailable" | "busy";
}

// ---------- Icon set (inline SVG, replaces emoji) ----------
function IconX({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconUploadCloud({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16.5a4.5 4.5 0 01.6-8.96A5.5 5.5 0 0117.9 9.03 4 4 0 0117 17H8a3.5 3.5 0 01-1-.5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v6m0-6l-2.5 2.5M12 12l2.5 2.5" />
    </svg>
  );
}

function IconPdf({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 3v5a1 1 0 001 1h5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M8.5 17v-3.25h.85c.55 0 1 .45 1 1s-.45 1-1 1H8.5m3.3.25V13.75m2 3.25v-3.25h1.35" />
    </svg>
  );
}

function IconImageFile({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="9.5" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5.5-5.5a1.5 1.5 0 00-2.12 0L4 19" />
    </svg>
  );
}

function IconPaperclip({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.122-2.12l7.693-7.693"
      />
    </svg>
  );
}

function FileTypeIcon({ fileType, className = "h-5 w-5" }: { fileType: string; className?: string }) {
  if (fileType === "application/pdf") return <IconPdf className={className} />;
  if (fileType.startsWith("image/")) return <IconImageFile className={className} />;
  return <IconPaperclip className={className} />;
}

function IconSpinner({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return <span className={`${className} border-2 border-white/40 border-t-white rounded-full animate-spin inline-block`} />;
}

// ─── Role: simulate NGO admin actions (approve/reject documents + profile) ───
// In production these would be separate NGO dashboard endpoints.
// Here we wire them into the same page for demo purposes.

export default function VolunteerProfilePage() {
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reject modal (for document or profile)
  const [rejectTarget, setRejectTarget] = useState<
    { type: "document"; docId: number } | { type: "profile" } | null
  >(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchVolunteerProfile();
  }, []);

  const fetchVolunteerProfile = async () => {
    try {
      setLoading(true);
      /*
      Laravel API Integration
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/volunteer/profile`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json" } }
      );
      const data = await response.json();
      setProfile(data.data);
      */
      setTimeout(() => {
        setProfile({
          id: 1,
          user_id: 1,
          name: "Ramesh Adhikari",
          email: "ramesh.adhikari@gmail.com",
          profile_photo: null,
          gender: "male",
          date_of_birth: "1999-05-29",
          bio: "Dedicated volunteer from Lalitpur with 3+ years of experience in community health outreach and disaster relief programs across Bagmati Province.",
          address: "Lagankhel, Lalitpur-3",
          city: "Lalitpur",
          country: "Nepal",
          emergency_contact_name: "Sita Adhikari",
          emergency_contact_phone: "+977 9841234567",
          availability_status: "available",
          verification_status: "approved",
          verified_by_ngo_id: 5,
          verified_at: "2025-06-20",
          rejection_reason: null,
          created_at: "2025-01-10",
          updated_at: "2025-06-20",
          documents: [
            {
              id: 1,
              name: "Citizenship Certificate",
              file_url: "#",
              file_type: "application/pdf",
              file_size: 204800,
              uploaded_at: "2025-06-01",
              status: "approved",
              rejection_reason: null,
            },
            {
              id: 2,
              name: "Police Clearance Letter",
              file_url: "#",
              file_type: "image/jpeg",
              file_size: 512000,
              uploaded_at: "2025-06-10",
              status: "pending",
              rejection_reason: null,
            },
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Failed to load volunteer profile.");
      setLoading(false);
    }
  };

  // ── Edit profile ──────────────────────────────────────────────────────────
  const openEditModal = () => {
    if (!profile) return;
    setFormData({
      name: profile.name ?? "",
      bio: profile.bio ?? "",
      gender: profile.gender ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
      emergency_contact_name: profile.emergency_contact_name ?? "",
      emergency_contact_phone: profile.emergency_contact_phone ?? "",
      availability_status: profile.availability_status,
    });
    setSaveError("");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setFormData(null);
    setSaveError("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData || !profile) return;
    setSaving(true);
    setSaveError("");
    try {
      /*
      Laravel API Integration
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/volunteer/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to save.");
      const data = await response.json();
      setProfile(data.data);
      */
      await new Promise((res) => setTimeout(res, 800));
      setProfile((prev) =>
        prev ? {
          ...prev,
          name: formData.name,
          bio: formData.bio,
          gender: formData.gender as VolunteerProfile["gender"],
          date_of_birth: formData.date_of_birth,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          availability_status: formData.availability_status,
          updated_at: new Date().toISOString().split("T")[0],
        } : prev
      );
      closeEditModal();
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Upload documents ──────────────────────────────────────────────────────
  const openUploadModal = () => {
    setSelectedFiles([]);
    setUploadError("");
    setIsUploadOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadOpen(false);
    setSelectedFiles([]);
    setUploadError("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    const invalid = files.filter((f) => !allowed.includes(f.type));
    if (invalid.length) {
      setUploadError("Only PDF, JPG, and PNG files are allowed.");
      return;
    }
    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length) {
      setUploadError("Each file must be under 5 MB.");
      return;
    }
    setUploadError("");
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !profile) return;
    setUploading(true);
    setUploadError("");
    try {
      /*
      Laravel API Integration
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append("documents[]", f));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/volunteer/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json" },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed.");
      const data = await response.json();
      setProfile((prev) => prev ? { ...prev, documents: data.data } : prev);
      */
      await new Promise((res) => setTimeout(res, 1000));
      const newDocs: VolunteerDocument[] = selectedFiles.map((file, i) => ({
        id: Date.now() + i,
        name: file.name.replace(/\.[^/.]+$/, ""),
        file_url: URL.createObjectURL(file),
        file_type: file.type,
        file_size: file.size,
        uploaded_at: new Date().toISOString().split("T")[0],
        status: "pending",
        rejection_reason: null,
      }));
      setProfile((prev) =>
        prev ? { ...prev, documents: [...prev.documents, ...newDocs] } : prev
      );
      closeUploadModal();
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Approve / Reject (NGO admin simulation) ───────────────────────────────
  const handleApproveDocument = async (docId: number) => {
    /*
    Laravel API Integration
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ngo/documents/${docId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json" },
    });
    */
    setProfile((prev) =>
      prev ? {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === docId ? { ...d, status: "approved", rejection_reason: null } : d
        ),
      } : prev
    );
  };

  const handleApproveProfile = async () => {
    /*
    Laravel API Integration
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ngo/volunteers/${profile?.id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json" },
    });
    */
    setProfile((prev) =>
      prev ? {
        ...prev,
        verification_status: "approved",
        verified_at: new Date().toISOString().split("T")[0],
        rejection_reason: null,
      } : prev
    );
  };

  const openRejectModal = (
    target: { type: "document"; docId: number } | { type: "profile" }
  ) => {
    setRejectTarget(target);
    setRejectReason("");
  };

  const closeRejectModal = () => {
    setRejectTarget(null);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      if (rejectTarget.type === "document") {
        const docId = rejectTarget.docId;
        /*
        Laravel API Integration
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ngo/documents/${docId}/reject`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectReason }),
        });
        */
        setProfile((prev) =>
          prev ? {
            ...prev,
            documents: prev.documents.map((d) =>
              d.id === docId ? { ...d, status: "rejected", rejection_reason: rejectReason } : d
            ),
          } : prev
        );
      } else {
        /*
        Laravel API Integration
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ngo/volunteers/${profile?.id}/reject`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectReason }),
        });
        */
        setProfile((prev) =>
          prev ? {
            ...prev,
            verification_status: "rejected",
            rejection_reason: rejectReason,
          } : prev
        );
      }
      closeRejectModal();
    } finally {
      setRejecting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-700";
      case "busy": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "V";
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-NP", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin inline-block" />
          <p className="text-[#4F46C8] text-lg font-semibold">Loading volunteer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl border border-red-200">
          <p className="text-red-600">{error || "Profile not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-[#CACDD3] overflow-hidden">
            <div className="h-36 bg-[#4F46C8]" />
            <div className="px-8 pb-6 relative">
              <div className="absolute -top-12">
                {profile.profile_photo ? (
                  <img src={profile.profile_photo} alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white" />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-[#B9C0D4] flex items-center justify-center text-2xl font-semibold text-[#111827]">
                    {getInitials(profile.name)}
                  </div>
                )}
              </div>
              <div className="pt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-[#111827]">{profile.name}</h1>
                  <p className="text-sm text-[#6B7280] mt-0.5">{profile.email}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${getAvailabilityBadge(profile.availability_status)}`}>
                    {profile.availability_status}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${getVerificationBadge(profile.verification_status)}`}>
                    {profile.verification_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body grid */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left */}
            <div className="lg:col-span-2 space-y-6">

              {/* Bio */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <h2 className="text-base font-semibold text-[#111827] mb-3">About me</h2>
                <div className="bg-[#B9C0D4]/20 rounded-lg p-4">
                  <p className="text-sm text-[#111827] leading-relaxed">
                    {profile.bio || "No bio available."}
                  </p>
                </div>
              </div>

              {/* Personal info */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Personal information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Gender", value: profile.gender },
                    { label: "Date of birth", value: formatDate(profile.date_of_birth) },
                    { label: "Address", value: profile.address },
                    { label: "City", value: profile.city },
                    { label: "Country", value: profile.country },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-[#6B7280] mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-[#111827] capitalize">{value || "N/A"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Documents</h2>
                {profile.documents.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {profile.documents.map((doc) => (
                      <div key={doc.id} className="border border-[#CACDD3] rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#B9C0D4]/25 flex items-center justify-center text-[#4F46C8]">
                              <FileTypeIcon fileType={doc.file_type} className="h-4.5 w-4.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#111827] truncate">{doc.name}</p>
                              <p className="text-xs text-[#6B7280]">
                                {formatFileSize(doc.file_size)} · Uploaded {formatDate(doc.uploaded_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getDocStatusBadge(doc.status)}`}>
                              {doc.status}
                            </span>
                            {/* NGO Admin actions */}
                            {doc.status === "pending" && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleApproveDocument(doc.id)}
                                  className="px-2.5 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openRejectModal({ type: "document", docId: doc.id })}
                                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {doc.status === "approved" && (
                              <a href={doc.file_url} target="_blank" rel="noreferrer"
                                className="text-xs text-[#4F46C8] hover:underline">
                                View
                              </a>
                            )}
                          </div>
                        </div>
                        {doc.status === "rejected" && doc.rejection_reason && (
                          <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                            <p className="text-xs text-red-600">Reason: {doc.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">

              {/* Emergency contact */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Emergency contact</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">Contact name</p>
                    <p className="text-sm font-medium text-[#111827]">{profile.emergency_contact_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">Phone number</p>
                    <p className="text-sm font-medium text-[#111827]">{profile.emergency_contact_phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Verification</h2>

                <div className="space-y-1 mb-4">
                  <p className="text-xs text-[#6B7280]">Status</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getVerificationBadge(profile.verification_status)}`}>
                    {profile.verification_status}
                  </span>
                </div>

                {profile.verified_at && (
                  <div className="space-y-1 mb-4">
                    <p className="text-xs text-[#6B7280]">Verified at</p>
                    <p className="text-sm font-medium text-[#111827]">{formatDate(profile.verified_at)}</p>
                  </div>
                )}

                {/* Volunteer actions */}
                <div className="space-y-2 mb-4">
                  <button onClick={openEditModal}
                    className="w-full bg-[#4F46C8] hover:bg-[#4338CA] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                    Edit profile
                  </button>
                  <button onClick={openUploadModal}
                    className="w-full bg-[#7683D6] hover:bg-[#6775D1] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                    Upload documents
                  </button>
                </div>

                {/* NGO Admin: approve / reject profile */}
                {profile.verification_status === "pending" && (
                  <>
                    <p className="text-xs text-[#6B7280] mb-2 font-medium">NGO admin actions</p>
                    <div className="flex gap-2">
                      <button onClick={handleApproveProfile}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                        Approve
                      </button>
                      <button onClick={() => openRejectModal({ type: "profile" })}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                        Reject
                      </button>
                    </div>
                  </>
                )}

                {profile.verification_status === "approved" && (
                  <div className="flex gap-2">
                    <button onClick={() => openRejectModal({ type: "profile" })}
                      className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                      Revoke approval
                    </button>
                  </div>
                )}

                {profile.verification_status === "rejected" && (
                  <div className="space-y-2">
                    {profile.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs text-red-600">{profile.rejection_reason}</p>
                      </div>
                    )}
                    <button onClick={handleApproveProfile}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                      Re-approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {isEditOpen && formData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}>
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#CACDD3] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#CACDD3]">
              <h2 className="text-base font-semibold text-[#111827]">Edit profile</h2>
              <button onClick={closeEditModal} className="text-[#6B7280] hover:text-[#111827] transition-colors" aria-label="Close">
                <IconX className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Full name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="e.g. Ramesh Adhikari"
                  className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8] focus:border-transparent resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8] bg-white">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Date of birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                    className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange}
                  placeholder="e.g. Lagankhel, Lalitpur-3"
                  className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange}
                    placeholder="e.g. Lalitpur"
                    className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange}
                    placeholder="e.g. Nepal"
                    className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Emergency contact name</label>
                  <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange}
                    placeholder="e.g. Sita Adhikari"
                    className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Emergency contact phone</label>
                  <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange}
                    placeholder="e.g. +977 9841234567"
                    className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Availability status</label>
                <select name="availability_status" value={formData.availability_status} onChange={handleChange}
                  className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8] bg-white">
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-600">{saveError}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#CACDD3]">
              <button onClick={closeEditModal} disabled={saving}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] border border-[#CACDD3] rounded-lg transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 text-sm font-medium text-white bg-[#4F46C8] hover:bg-[#4338CA] rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving ? (
                  <><IconSpinner />Saving...</>
                ) : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Documents Modal ── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeUploadModal(); }}>
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#CACDD3] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#CACDD3]">
              <h2 className="text-base font-semibold text-[#111827]">Upload documents</h2>
              <button onClick={closeUploadModal} className="text-[#6B7280] hover:text-[#111827] transition-colors" aria-label="Close">
                <IconX className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#CACDD3] hover:border-[#4F46C8] rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <div className="flex justify-center mb-2 text-[#7683D6] group-hover:text-[#4F46C8] transition-colors">
                  <IconUploadCloud className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium text-[#111827] group-hover:text-[#4F46C8]">
                  Click to browse files
                </p>
                <p className="text-xs text-[#6B7280] mt-1">PDF, JPG, PNG · Max 5 MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected files list */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#F0F1F3] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[#4F46C8] flex-shrink-0">
                          <FileTypeIcon fileType={file.type} className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#111827] truncate">{file.name}</p>
                          <p className="text-xs text-[#6B7280]">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeSelectedFile(i)}
                        className="text-[#6B7280] hover:text-red-500 ml-2 transition-colors flex-shrink-0" aria-label="Remove file">
                        <IconX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-600">{uploadError}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#CACDD3]">
              <button onClick={closeUploadModal} disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] border border-[#CACDD3] rounded-lg transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}
                className="px-5 py-2 text-sm font-medium text-white bg-[#7683D6] hover:bg-[#6775D1] rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
                {uploading ? (
                  <><IconSpinner />Uploading...</>
                ) : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeRejectModal(); }}>
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#CACDD3] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#CACDD3]">
              <h2 className="text-base font-semibold text-[#111827]">
                {rejectTarget.type === "document" ? "Reject document" : "Reject profile"}
              </h2>
              <button onClick={closeRejectModal} className="text-[#6B7280] hover:text-[#111827] transition-colors" aria-label="Close">
                <IconX className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-xs text-[#6B7280] mb-1">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Provide a clear reason so the volunteer can take corrective action..."
                className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#CACDD3]">
              <button onClick={closeRejectModal} disabled={rejecting}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] border border-[#CACDD3] rounded-lg transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleConfirmReject} disabled={rejecting || !rejectReason.trim()}
                className="px-5 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
                {rejecting ? (
                  <><IconSpinner />Rejecting...</>
                ) : "Confirm reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}