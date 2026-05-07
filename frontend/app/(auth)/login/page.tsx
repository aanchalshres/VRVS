"use client";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

const Login = () => {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      if (!email && !password) {
        setError("Email and password are required.");
      } else if (!email) {
        setError("Email address is required.");
      } else {
        setError("Password is required.");
      }
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      
      // Get user data from localStorage after login
      const userStr = localStorage.getItem("user");
      const tokenStr = localStorage.getItem("authToken");
      const user = userStr ? JSON.parse(userStr) : null;
      const token = tokenStr;
      
      // IMPORTANT: Set token and role cookies for middleware
      if (token && user) {
        document.cookie = `token=${token}; path=/`;
        document.cookie = `role=${user.role}; path=/`;
        
        // Dispatch event to sync AuthProvider
        window.dispatchEvent(new CustomEvent("auth-updated"));
      }
      
      // Redirect based on role
      if (user?.role === "admin") {
        router.replace("/dashboard/admin");
      } else if (user?.role === "ngo") {
        router.replace("/dashboard/ngo");
      } else {
        router.replace("/dashboard/volunteer");
      }
    } catch (err) {
      // Handle errors from login
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F1F3]">
      <Navbar />

      <div className="container mx-auto flex items-center justify-center py-20 px-4">
        <Card className="w-full max-w-md shadow-xl border border-[#CACDD3] rounded-xl bg-white">
          
          <CardHeader className="text-center space-y-3">
            
     <div className="flex justify-center">
    <img
      src="/logo1.png"      
      alt="Ultimate IT Logo"
      className="h-20 w-20 object-contain"
    />
  </div>
          

            <CardTitle className="text-2xl font-bold text-[#111827]">
              Welcome Back
            </CardTitle>

            <p className="text-sm text-[#6B7280]">
              Sign in to your Sahayogi account
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#111827]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-[#CACDD3] focus-visible:ring-[#4F46C8]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#111827]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="border-[#CACDD3] focus-visible:ring-[#4F46C8]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#4F46C8] hover:bg-[#3f37c9] text-white rounded-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#B9C0D4] pt-4">
              <p className="text-center text-sm text-[#6B7280]">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-[#4F46C8] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;