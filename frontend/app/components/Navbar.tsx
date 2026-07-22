"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";


const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  // Only render auth-dependent content after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDashboard =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/org");

  if (isDashboard) return null;

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/dashboard/admin";
    if (user?.role === "ngo") return "/dashboard/ngo";
    return "/dashboard/volunteer";
  };

  return (
    <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-md">

      {/* added px-4 to shift content inward */}
      <div className="container flex h-16 items-center justify-between px-4">

        {/* LOGO (shift slightly right using ml-2) */}
        <Link href="/" className="flex items-center gap-2 ml-2">
          <Image
            src="/logo3.png"
            alt="Sahayogi Logo"
            width={100}
            height={100}
            className="rounded-lg"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>

        {/* DESKTOP MENU */}
        {/* added mr-2 to shift left slightly */}
        <div className="hidden items-center gap-4 md:flex mr-2">

          {/* <Link
            href="/volunteer"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Volunteer
          </Link>
          <Link
            href="/org"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Organization
          </Link> */}

          <Link
            href="/about"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            About Us
          </Link>

          <div className="flex items-center gap-2">
            {mounted && isAuthenticated && user ? (
              <>
                <Link href={getDashboardLink()}>
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-[#5B5BD6] hover:bg-[#4a4ac4] text-white ractangle-full px-3"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

          </div>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-foreground mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen
            ? <X className="h-6 w-6" />
            : <Menu className="h-6 w-6" />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">

          <div className="flex flex-col gap-3">

            

            {mounted && isAuthenticated && user ? (
              <>
                <Link href={getDashboardLink()} onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="w-full hover:bg-red-700 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Log In
                  </Button>
                </Link>

                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="bg-[#5B5BD6] hover:bg-[#4a4ac4] text-white w-full rounded-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

          </div>

        </div>
      )}

    </nav>
  );
};

export default Navbar;