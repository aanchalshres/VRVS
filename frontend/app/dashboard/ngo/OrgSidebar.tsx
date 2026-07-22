"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  LayoutDashboard,
  Plus,
  FileText,
  Users,
  CheckSquare,
  User,
  LogOut,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard/ngo", icon: LayoutDashboard },
  { name: "Post Task", href: "/dashboard/ngo/post-task", icon: Plus },
  { name: "My Tasks", href: "/dashboard/ngo/tasks", icon: FileText },
  { name: "Applications", href: "/dashboard/ngo/applications", icon: Users },
  { name: "Participations", href: "/dashboard/ngo/participations", icon: Users },
  { name: "Verification", href: "/dashboard/ngo/verification", icon: ShieldCheck },
  { name: "Notifications", href: "/dashboard/ngo/notifications", icon: Bell },
  { name: "Profile", href: "/dashboard/ngo/profile", icon: User },
];

export default function OrgSidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } h-screen bg-[#B9C0D4] border-r border-[#CACDD3] flex flex-col transition-all duration-300`}
    >

      {/* TOP LOGO + TOGGLE */}
      <div className="flex items-center justify-between h-16 border-b border-[#CACDD3] px-2">
        <div className="flex items-center justify-center flex-1">
  <Link href="/">
    <Image
      src="/logo3.png"
      alt="Org Logo"
      width={90}
      height={50}
      style={{ width: isOpen ? '90px' : '32px', height: 'auto' }}
      className="rounded-lg transition-all duration-300 cursor-pointer"
      priority
    />
  </Link>
</div>

        {/* TOGGLE BUTTON */}
        <button
          className="p-1 rounded hover:bg-gray-200 transition"
          onClick={toggleSidebar}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* MENU */}
      <div className="flex-1 mt-4 px-1 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-2 py-3 rounded-xl text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-[#9FA8DA] text-[#4F46C8]"
                    : "text-[#6B7280] hover:bg-[#AAB2C8] hover:text-[#111827]"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* BOTTOM LOGOUT */}
      <div className="p-2 border-t border-[#CACDD3]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-sm text-[#6B7280] hover:text-red-600 w-full px-2 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
