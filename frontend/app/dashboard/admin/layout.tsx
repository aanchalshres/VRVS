"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { SidebarProvider, useSidebar } from "@/app/providers/SidebarContext";
import { cn } from "@/app/lib/utils";

const pageConfig: Record<string, string> = {
  '/dashboard/admin': 'Dashboard',
  '/dashboard/admin/ngo-verification': 'NGO Verification',
  '/dashboard/admin/volunteers': 'Volunteer Management',
  '/dashboard/admin/volunteer-verification': 'Volunteer Verification',
  '/dashboard/admin/task-moderation': 'Task Moderation',
  '/dashboard/admin/applications': 'Applications',
  '/dashboard/admin/attendance': 'Attendance & Service Logs',
  '/dashboard/admin/certificates': 'Certificate Management',
  '/dashboard/admin/reviews': 'Ratings & Reviews',
  '/dashboard/admin/notifications': 'Notifications',
  '/dashboard/admin/admin-users': 'Admin Users',
  '/dashboard/admin/schedule-conflicts': 'Schedule Conflicts',
  '/dashboard/admin/analytics': 'Analytics',
  '/dashboard/admin/categories': 'Categories',
  '/dashboard/admin/skills': 'Skills',
  '/dashboard/admin/activity-log': 'Activity Log',
  '/dashboard/admin/trust-management': 'Trust Management',
  '/dashboard/admin/reports': 'Reports',
  '/dashboard/admin/settings': 'Settings',
};

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = pageConfig[pathname] || 'Dashboard';
  const { isCollapsed, isMobileOpen } = useSidebar();

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#F0F1F3]">
        {/* Content */}
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className={cn(
            "flex-1 min-h-screen flex flex-col transition-all duration-200 ease-in-out",
            isMobileOpen ? "hidden" : "",
            isCollapsed ? "lg:ml-20" : "lg:ml-64"
          )}>
            {/* Header */}
            <Header pageTitle={pageTitle} />

            {/* Page Content */}
            <main className="flex-1 overflow-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
