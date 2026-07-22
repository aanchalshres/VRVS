"use client";

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/providers/AuthProvider';
import { useSidebar } from '@/app/providers/SidebarContext';
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  FileText,
  ClipboardList,
  Clock,
  Award,
  Star,
  Bell,
  UserCog,
  Activity,
  BarChart3,
  Tags,
  BookOpen,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/admin' },
  { id: 'ngo-verification', label: 'NGO Verification', icon: Users, href: '/dashboard/admin/ngo-verification' },
  { id: 'volunteer-management', label: 'Volunteers', icon: UserCheck, href: '/dashboard/admin/volunteers' },
  { id: 'volunteer-verification', label: 'Volunteer Verification', icon: ShieldCheck, href: '/dashboard/admin/volunteer-verification' },
  { id: 'task-moderation', label: 'Task Moderation', icon: CheckCircle, href: '/dashboard/admin/task-moderation' },
  { id: 'applications', label: 'Applications', icon: ClipboardList, href: '/dashboard/admin/applications' },
  { id: 'attendance', label: 'Attendance', icon: Clock, href: '/dashboard/admin/attendance' },
  { id: 'certificates', label: 'Certificates', icon: Award, href: '/dashboard/admin/certificates' },
  { id: 'reviews', label: 'Reviews', icon: Star, href: '/dashboard/admin/reviews' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/admin/notifications' },
  { id: 'admin-users', label: 'Admin Users', icon: UserCog, href: '/dashboard/admin/admin-users' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/admin/analytics' },
  { id: 'categories', label: 'Categories', icon: Tags, href: '/dashboard/admin/categories' },
  { id: 'skills', label: 'Skills', icon: BookOpen, href: '/dashboard/admin/skills' },
  { id: 'activity-log', label: 'Activity Log', icon: Activity, href: '/dashboard/admin/activity-log' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/dashboard/admin/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/admin/settings' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  const handleLogout = async () => {
    await logout();
    setIsMobileOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard/admin' && pathname === '/dashboard/admin') return true;
    if (href !== '/dashboard/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#B9C0D4] shadow-md border border-[#CACDD3]"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 bg-[#B9C0D4] border-r border-[#CACDD3] transition-all duration-200 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-4 border-b border-[#CACDD3]">
          <div className="flex items-center gap-2">
            <Image
              src="/logo1.png"
              alt="Sahayogi Logo"
              width={50}
              height={50}
              className="rounded-lg shrink-0"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-semibold text-[#111827] whitespace-nowrap">Sahayogi</h1>
                <p className="text-xs text-[#6B7280] whitespace-nowrap">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.href);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                  active
                    ? 'bg-[#9FA8DA] text-[#4F46C8]'
                    : 'text-[#6B7280] hover:bg-[#AAB2C8] hover:text-[#111827]'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform duration-200',
                    active ? 'text-[#4F46C8]' : 'text-[#6B7280] group-hover:text-[#111827]',
                    'group-hover:scale-110'
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate whitespace-nowrap flex-1 text-left">{item.label}</span>
                )}

                {/* Active Indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sahayogi-blue rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {!isCollapsed && <span>Collapse</span>}
          </button>

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
