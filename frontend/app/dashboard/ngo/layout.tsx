"use client";

import { useState } from "react";
import OrgSidebar from "@/app/dashboard/ngo/OrgSidebar";
import OrgNavbar from "@/app/dashboard/ngo/OrgNavbar";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

export default function NGOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ProtectedRoute allowedRoles={["ngo"]}>
      <div className="h-screen flex overflow-hidden bg-[#F0F1F3]">
        {/* SIDEBAR */}
        <OrgSidebar
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
          {/* NAVBAR */}
          <OrgNavbar sidebarOpen={sidebarOpen} />

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto p-6 w-full">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
