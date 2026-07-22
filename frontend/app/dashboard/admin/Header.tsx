import { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

interface HeaderProps {
  pageTitle: string;
  breadcrumbs?: { label: string; href?: string }[];
  onSearch?: (query: string) => void;
}

export function Header({ pageTitle, breadcrumbs = [], onSearch }: HeaderProps) {
  const { user } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount] = useState(3);

  const displayName = user?.name || 'Admin';
  const displayRole = user?.role === 'admin' ? 'Admin' : user?.role || 'Admin';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="h-16 bg-[#B9C0D4]/80 backdrop-blur-xl border-b border-[#CACDD3] sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left - Page Title & Breadcrumbs */}
        <div className="flex flex-col justify-center">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center text-xs text-[#6B7280] mb-0.5">
              <ol className="flex items-center space-x-1">
                <li>
                  <a
                    href="#"
                    className="transition-colors flex items-center"
                    onMouseEnter={(e) => e.currentTarget.style.color = "hsl(234, 100%, 62%)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                  >
                    <Home className="w-3 h-3" />
                  </a>
                </li>
                {breadcrumbs.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <ChevronRight className="w-3 h-3 text-[#CACDD3] mx-1" />
                    {item.href ? (
                      <a
                        href={item.href}
                        className="transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.color = "hsl(234, 100%, 62%)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-[#CACDD3]">{item.label}</span>
                    )}
                  </li>
                ))}
                <li className="flex items-center">
                  <ChevronRight className="w-3 h-3 text-[#CACDD3] mx-1" />
                  <span className="text-[#111827] font-medium">{pageTitle}</span>
                </li>
              </ol>
            </nav>
          )}
          <h2 className="text-xl font-semibold text-[#111827]">{pageTitle}</h2>
        </div>

        {/* Center - Global Search */}
        <form
          onSubmit={handleSearch}
          className={cn(
            'hidden md:flex items-center relative transition-all duration-300',
            isSearchFocused ? 'w-80' : 'w-64'
          )}
        >
          <Search
            className="absolute left-3 w-4 h-4 transition-colors duration-200"
            style={{ color: isSearchFocused ? "#4F46C8" : "#9CA3AF" }}
          />
          <Input
            placeholder="Search NGOs, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#F0F1F3] border-[#CACDD3] transition-all duration-200"
            style={isSearchFocused ? { backgroundColor: "white", borderColor: "#4F46C8", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" } : {}}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </form>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-[#AAB2C8] transition-colors"
              >
                <Bell className="w-5 h-5 text-[#6B7280]" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-semibold flex items-center justify-center rounded-full animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                  <span className="text-sm font-medium">New NGO Registration</span>
                  <span className="text-xs text-[#6B7280]">Himalayan Helpers submitted for verification</span>
                  <span className="text-xs text-[#9CA3AF] mt-1">2 minutes ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                  <span className="text-sm font-medium">Task Approved</span>
                  <span className="text-xs text-[#6B7280]">Blood Donation Camp is now active</span>
                  <span className="text-xs text-[#9CA3AF] mt-1">15 minutes ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                  <span className="text-sm font-medium">Volunteer Application</span>
                  <span className="text-xs text-[#6B7280]">John Doe applied for Tree Plantation</span>
                  <span className="text-xs text-[#9CA3AF] mt-1">1 hour ago</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center cursor-pointer" style={{ color: "#4F46C8" }}>
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-[#AAB2C8] transition-colors"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg" style={{ backgroundColor: "#4F46C8" }}>
                  {getInitials(displayName)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-[#111827]">{displayName}</p>
                  <p className="text-xs text-[#6B7280]">{displayRole}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
