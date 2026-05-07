"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";

const OrgNavbar = ({ sidebarOpen }: { sidebarOpen?: boolean }) => {
  const { user } = useAuth();
  const router = useRouter();

  // Get initials from user name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user?.name);

  return (
    <>
      {/* NAVBAR */}
      <div className="h-16 flex items-center justify-end px-4 bg-[#F0F1F3] border-b border-[#CACDD3]">

        {/* RIGHT SIDE: Notification + Profile */}
        <div className="flex items-center gap-4 relative">

          {/* Notification Icon */}
          <button className="relative p-2 rounded-full hover:bg-gray-200 transition">
            <Bell className="h-6 w-6 text-gray-700" />
            {/* Notification Badge */}
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Avatar Box - Click to go to profile */}
          <button
            onClick={() => router.push("/dashboard/ngo/profile")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#CACDD3] hover:bg-gray-50 hover:border-[#4F46C8] transition-all cursor-pointer"
            title={user?.name || "Profile"}
          >
            <div className="w-8 h-8 rounded-full bg-[#4F46C8] hover:bg-[#3f37a0] flex items-center justify-center text-white font-semibold text-xs">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-[#111827] truncate max-w-25">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-[#6B7280] leading-none">
                {user?.role === "ngo" ? "NGO" : user?.role}
              </p>
            </div>
          </button>

        </div>
      </div>
    </>
  );
};

export default OrgNavbar;
