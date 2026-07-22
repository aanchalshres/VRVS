"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPut, apiUpload } from "@/app/lib/api";

interface VolunteerSkill {
  id: number;
  name: string;
  pivot: {
    volunteer_profile_id: number;
    skill_id: number;
    proficiency_level: string | null;
  };
}

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

interface VolunteerProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  profile_photo: string | null;
  gender: string | null;
  date_of_birth: string | null;
  bio: string | null;
  primary_location: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  availability: string | null;
  skills: VolunteerSkill[];
  documents: VolunteerDocument[];
  created_at: string;
  updated_at: string;
}

interface CompletionInfo {
  percent: number;
  filled_fields: string[];
  total_fields: number;
  filled_count: number;
  has_skills: boolean;
  has_documents: boolean;
}

interface EditFormData {
  name: string;
  phone: string;
  bio: string;
  gender: string;
  date_of_birth: string;
  primary_location: string;
  city: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  availability: string;
}

function mapApiResponse(apiData: any): VolunteerProfile {
  const user = apiData;
  const profile = user.volunteer_profile || {};
  return {
    id: profile.id ?? 0,
    user_id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? null,
    profile_photo: profile.profile_photo ?? null,
    gender: profile.gender ?? null,
    date_of_birth: profile.date_of_birth ?? null,
    bio: profile.bio ?? null,
    primary_location: profile.primary_location ?? null,
    city: profile.city ?? null,
    country: profile.country ?? null,
    latitude: profile.latitude ?? null,
    longitude: profile.longitude ?? null,
    emergency_contact_name: profile.emergency_contact_name ?? null,
    emergency_contact_phone: profile.emergency_contact_phone ?? null,
    availability: profile.availability ?? null,
    skills: profile.skills ?? [],
    documents: profile.documents ?? [],
    created_at: profile.created_at ?? "",
    updated_at: profile.updated_at ?? "",
  };
}

function availabilityToForm(val: string | null): string {
  if (!val) return "";
  return val.toLowerCase();
}

function availabilityToApi(val: string): string | null {
  if (!val) return null;
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function genderToForm(val: string | null): string {
  if (!val) return "";
  return val.toLowerCase();
}

function genderToApi(val: string): string | null {
  if (!val) return null;
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function getAvailabilityBadge(status: string | null) {
  const s = status?.toLowerCase();
  if (s === "available") return "bg-green-100 text-green-700";
  if (s === "busy") return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-600";
}

function getDocumentStatusBadge(status: string) {
  if (status === "verified") return "bg-green-100 text-green-700";
  if (status === "pending") return "bg-yellow-100 text-yellow-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function getVerificationStatusInfo(status: string) {
  if (status === "verified") return { label: "Verified", color: "text-green-700", bg: "bg-green-100", icon: "check" };
  if (status === "pending") return { label: "Pending Review", color: "text-yellow-700", bg: "bg-yellow-100", icon: "clock" };
  if (status === "rejected") return { label: "Rejected", color: "text-red-700", bg: "bg-red-100", icon: "x" };
  return { label: "Not Uploaded", color: "text-gray-600", bg: "bg-gray-100", icon: "none" };
}

function IconX({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconSpinner({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return <span className={`${className} border-2 border-white/40 border-t-white rounded-full animate-spin inline-block`} />;
}

function IconCamera({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconUpload({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function IconCheck({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconClock({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function VolunteerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [completion, setCompletion] = useState<CompletionInfo | null>(null);
  const [documentStatus, setDocumentStatus] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [photoUploading, setPhotoUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVolunteerProfile();
  }, []);

  const fetchVolunteerProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiGet<any>("/volunteer/profile");
      setProfile(mapApiResponse(response.data));
      setCompletion(response.completion || null);
      setDocumentStatus(response.document_status || "none");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load volunteer profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_photo", file);

    setPhotoUploading(true);
    try {
      await apiUpload<any>("/volunteer/profile-photo", formData);
      await fetchVolunteerProfile();
      setSuccessMessage("Profile photo updated!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Failed to upload photo.");
      setTimeout(() => setSaveError(""), 5000);
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openEditModal = () => {
    if (!profile) return;
    setFormData({
      name: profile.name ?? "",
      phone: profile.phone ?? "",
      bio: profile.bio ?? "",
      gender: genderToForm(profile.gender),
      date_of_birth: profile.date_of_birth ?? "",
      primary_location: profile.primary_location ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
      emergency_contact_name: profile.emergency_contact_name ?? "",
      emergency_contact_phone: profile.emergency_contact_phone ?? "",
      availability: availabilityToForm(profile.availability),
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
      const payload: Record<string, any> = {
        name: formData.name,
        phone: formData.phone || null,
        bio: formData.bio || null,
        gender: genderToApi(formData.gender),
        date_of_birth: formData.date_of_birth || null,
        primary_location: formData.primary_location || null,
        city: formData.city || null,
        country: formData.country || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        availability: availabilityToApi(formData.availability),
      };

      await apiPut<any>("/volunteer/profile", payload);
      setSuccessMessage("Profile updated successfully!");
      closeEditModal();
      setTimeout(() => setSuccessMessage(""), 5000);
      await fetchVolunteerProfile();
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
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

  const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const API_BASE = RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "");

  const completionPercent = completion?.percent ?? 0;

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

  const verifInfo = getVerificationStatusInfo(documentStatus);

  return (
    <>
      <div className="min-h-screen bg-[#F0F1F3] p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
              {saveError}
            </div>
          )}

          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#CACDD3] overflow-hidden">
            <div className="h-36 bg-[#4F46C8]" />
            <div className="px-8 pb-6 relative">
              <div className="absolute -top-12 group">
                {profile.profile_photo ? (
                  <div className="relative">
                    <img src={profile.profile_photo} alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white" />
                    <button onClick={handlePhotoClick} disabled={photoUploading}
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-4 border-white disabled:opacity-100">
                      {photoUploading ? (
                        <IconSpinner className="w-6 h-6 border-2 border-white/40 border-t-white" />
                      ) : (
                        <IconCamera className="h-6 w-6 text-white" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-[#B9C0D4] flex items-center justify-center text-2xl font-semibold text-[#111827]">
                      {getInitials(profile.name)}
                    </div>
                    <button onClick={handlePhotoClick} disabled={photoUploading}
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-4 border-white disabled:opacity-100">
                      {photoUploading ? (
                        <IconSpinner className="w-6 h-6 border-2 border-white/40 border-t-white" />
                      ) : (
                        <IconCamera className="h-6 w-6 text-white" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="hidden" onChange={handlePhotoChange} />
              <div className="pt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-[#111827]">{profile.name}</h1>
                  <p className="text-sm text-[#6B7280] mt-0.5">{profile.email}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {profile.availability && (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${getAvailabilityBadge(profile.availability)}`}>
                      {profile.availability}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#111827]">Profile Completion</h2>
              <span className="text-sm font-bold text-[#4F46C8]">{completionPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#4F46C8] rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${profile.name && profile.phone ? "bg-green-500" : "bg-gray-300"}`} />
                Personal Info
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${profile.primary_location || profile.city ? "bg-green-500" : "bg-gray-300"}`} />
                Location
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${completion?.has_skills ? "bg-green-500" : "bg-gray-300"}`} />
                Skills
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${completion?.has_documents ? "bg-green-500" : "bg-gray-300"}`} />
                Documents
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About me */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <h2 className="text-base font-semibold text-[#111827] mb-3">About me</h2>
                <div className="bg-[#B9C0D4]/20 rounded-lg p-4">
                  <p className="text-sm text-[#111827] leading-relaxed">
                    {profile.bio || "No bio available."}
                  </p>
                </div>
              </div>

              {/* Personal information */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Personal information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Phone", value: profile.phone },
                    { label: "Gender", value: profile.gender },
                    { label: "Date of birth", value: formatDate(profile.date_of_birth) },
                    { label: "Location", value: profile.primary_location },
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

              {/* Skills */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-[#111827]">Skills</h2>
                  <button onClick={() => router.push("/dashboard/volunteer/skills")}
                    className="text-xs text-[#4F46C8] hover:text-[#4338CA] font-medium">
                    Manage skills
                  </button>
                </div>
                {profile.skills.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No skills added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1.5 bg-[#4F46C8]/10 text-[#4F46C8] rounded-full text-sm font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-[#111827]">Documents</h2>
                  <button onClick={() => router.push("/dashboard/volunteer/documents")}
                    className="text-xs text-[#4F46C8] hover:text-[#4338CA] font-medium">
                    Manage Documents &rarr;
                  </button>
                </div>
                {profile.documents.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {profile.documents.map((doc) => {
                      const previewUrl = `${API_BASE}/storage/${doc.file_path}`;
                      const isImage = doc.mime_type.startsWith("image/");
                      const isPdf = doc.mime_type === "application/pdf";
                      return (
                        <div key={doc.id} className="border border-[#CACDD3] rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F0F1F3]">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#111827] capitalize">
                                {doc.document_type.replace("_", " ")}
                              </p>
                              <p className="text-xs text-[#6B7280]">{formatDate(doc.created_at)}</p>
                            </div>
                            <div className="shrink-0">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDocumentStatusBadge(doc.status)}`}>
                                {doc.status}
                              </span>
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

            {/* Right Column */}
            <div className="space-y-6">
              {/* Verification Status */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Verification Status</h2>
                <div className={`flex items-center gap-3 ${verifInfo.bg} rounded-lg p-4`}>
                  {documentStatus === "verified" ? (
                    <IconCheck className="h-6 w-6 text-green-600 shrink-0" />
                  ) : documentStatus === "pending" ? (
                    <IconClock className="h-6 w-6 text-yellow-600 shrink-0" />
                  ) : documentStatus === "rejected" ? (
                    <IconX className="h-6 w-6 text-red-600 shrink-0" />
                  ) : (
                    <IconUpload className="h-6 w-6 text-gray-500 shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${verifInfo.color}`}>{verifInfo.label}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {documentStatus === "none" && "No documents uploaded yet"}
                      {documentStatus === "pending" && "Documents are being reviewed by admin"}
                      {documentStatus === "verified" && "Your identity has been verified"}
                      {documentStatus === "rejected" && "Upload new documents for re-verification"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
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

              {/* Profile Actions */}
              <div className="bg-white rounded-xl border border-[#CACDD3] p-6">
                <h2 className="text-base font-semibold text-[#111827] mb-4">Profile Actions</h2>
                <div className="space-y-2">
                  <button onClick={openEditModal}
                    className="w-full bg-[#4F46C8] hover:bg-[#4338CA] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                    Edit profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
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
                <label className="block text-xs text-[#6B7280] mb-1">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="e.g. +977 9841234567"
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
                <label className="block text-xs text-[#6B7280] mb-1">Primary Location</label>
                <input type="text" name="primary_location" value={formData.primary_location} onChange={handleChange}
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
                <label className="block text-xs text-[#6B7280] mb-1">Availability</label>
                <select name="availability" value={formData.availability} onChange={handleChange}
                  className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8] bg-white">
                  <option value="">Select availability</option>
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
    </>
  );
}