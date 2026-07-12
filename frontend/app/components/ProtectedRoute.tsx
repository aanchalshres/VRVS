// app/components/ProtectedRoute.tsx

"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("volunteer" | "ngo" | "admin")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirects in a separate effect (not during render)
  useEffect(() => {
    if (!mounted || isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check if user has required role
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [mounted, isLoading, isAuthenticated, user, allowedRoles, router]);

  // Wait for context to finish loading
  if (!mounted || isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F0F1F3" }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Dual-tone spinner using primary + secondary CTA colors */}
          <div className="relative w-14 h-14">
            <div
              className="absolute inset-0 rounded-full border-4 animate-spin"
              style={{
                borderColor: "#CACDD3",
                borderTopColor: "#4F46C8",
                borderRightColor: "#7683D6",
              }}
            />
          </div>
          <p
            className="text-sm font-medium tracking-wide"
            style={{ color: "#6B7280" }}
          >
            Checking your session…
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render yet (redirect will happen via effect)
  if (!isAuthenticated) {
    return null;
  }

  // If role check fails, show a branded "redirecting" state instead of a blank screen
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F0F1F3" }}
      >
        <div
          className="flex flex-col items-center gap-3 text-center px-6 py-8 rounded-2xl bg-white"
          style={{ border: "1px solid #CACDD3" }}
        >
          <p className="font-display font-bold" style={{ color: "#111827" }}>
            You don't have access to this page
          </p>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Redirecting you to the right place…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}