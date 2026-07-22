"use client";
import { Bell } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { apiGet } from "@/app/lib/api";

const OrgNavbar = ({ sidebarOpen }: { sidebarOpen?: boolean }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

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

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await apiGet<{ count: number }>("/volunteer/notifications/unread-count");
      setUnreadCount(res.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  return (
    <div className="h-16 flex items-center justify-end px-4 bg-[#F0F1F3] border-b border-[#CACDD3]">
      <div className="flex items-center gap-4 relative">

        <button
          onClick={() => router.push("/dashboard/volunteer/notifications")}
          className="relative p-2 rounded-full hover:bg-[#B9C0D4]/30 transition cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6 text-[#111827]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => router.push("/dashboard/volunteer/profile")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#CACDD3] hover:bg-[#B9C0D4]/20 hover:border-[#4F46C8] transition-all cursor-pointer"
          title={user?.name || "Profile"}
        >
          <div className="w-8 h-8 rounded-full bg-[#4F46C8] flex items-center justify-center text-white font-semibold text-xs">
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
  );
};

export default OrgNavbar;
