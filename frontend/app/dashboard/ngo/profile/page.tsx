"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { FileText, Download, Building2 } from "lucide-react";

interface NGOProfile {
  id?: string | number;
  organization_name?: string;
  registration_number?: string;
  pan_number?: string;
  office_location?: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  registration_file_path?: string;
  pan_file_path?: string;
  letterhead_file_path?: string;
  status?: string;
  created_at?: string;
}

export default function NGOProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = () => {
      setLoading(true);

      const cachedProfile = user?.ngoProfile;

      if (cachedProfile) {
        setProfile({
          ...cachedProfile,
          user: {
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
          },
        });
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46C8]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#6B7280]">Profile data is not cached locally yet. Sign out and sign back in to refresh it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-[#111827]">Organization Profile</h1>
        <p className="text-[#6B7280]">View your organization information</p>
      </div>

      {/* ORGANIZATION INFO CARD */}
      <Card className="bg-white border border-[#CACDD3]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#4F46C8] to-[#3730A3] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-[#111827]">
                {profile.organization_name}
              </CardTitle>
              <p className="text-sm text-[#6B7280] mt-1">
                Status: <span className="font-semibold text-green-600 capitalize">{profile.status || "pending"}</span>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Organization Information */}
          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Organization Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#6B7280] mb-2">Organization Name</p>
                <p className="text-sm font-medium text-[#111827]">{profile.organization_name}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-2">Registration Number</p>
                <p className="text-sm font-medium text-[#111827]">{profile.registration_number}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-2">PAN Number</p>
                <p className="text-sm font-medium text-[#111827]">{profile.pan_number}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-2">Office Location</p>
                <p className="text-sm font-medium text-[#111827]">{profile.office_location}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-[#CACDD3] pt-6">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#6B7280] mb-2">Contact Person</p>
                <p className="text-sm font-medium text-[#111827]">{profile.user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-2">Email</p>
                <p className="text-sm font-medium text-[#111827]">{profile.user?.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-[#6B7280] mb-2">Phone</p>
                <p className="text-sm font-medium text-[#111827]">{profile.user?.phone || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          {(profile.registration_file_path || profile.pan_file_path || profile.letterhead_file_path) && (
            <div className="border-t border-[#CACDD3] pt-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4F46C8]" />
                Submitted Documents
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {profile.registration_file_path && (
                  <div className="flex items-center justify-between p-4 bg-[#F0F1F3] rounded-lg border border-[#CACDD3]">
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] mb-1">Registration Certificate</p>
                      <p className="text-xs text-[#6B7280]">Registration document</p>
                    </div>
                    <a
                      href={profile.registration_file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-[#4F46C8] text-white rounded text-xs font-medium hover:bg-[#3730A3] transition"
                    >
                      <Download className="w-3 h-3" />
                      View
                    </a>
                  </div>
                )}
                {profile.pan_file_path && (
                  <div className="flex items-center justify-between p-4 bg-[#F0F1F3] rounded-lg border border-[#CACDD3]">
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] mb-1">PAN Certificate</p>
                      <p className="text-xs text-[#6B7280]">Tax identification document</p>
                    </div>
                    <a
                      href={profile.pan_file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-[#4F46C8] text-white rounded text-xs font-medium hover:bg-[#3730A3] transition"
                    >
                      <Download className="w-3 h-3" />
                      View
                    </a>
                  </div>
                )}
                {profile.letterhead_file_path && (
                  <div className="flex items-center justify-between p-4 bg-[#F0F1F3] rounded-lg border border-[#CACDD3]">
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] mb-1">Organization Letterhead</p>
                      <p className="text-xs text-[#6B7280]">Official letterhead sample</p>
                    </div>
                    <a
                      href={profile.letterhead_file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-[#4F46C8] text-white rounded text-xs font-medium hover:bg-[#3730A3] transition"
                    >
                      <Download className="w-3 h-3" />
                      View
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}