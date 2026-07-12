"use client";

import Navbar from "@/app/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Link from "next/link";
import { User, Building2 } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen bg-[#F0F1F3]">
      <Navbar />

      <div className="container mx-auto flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md rounded-xl border border-[#CACDD3] bg-white shadow-xl">
          
          {/* HEADER */}
          <CardHeader className="space-y-4 px-6 pt-6 text-center">
            <div className="flex justify-center">
              <img
                src="/logo1.png"
                alt="Logo"
                className="h-20 w-20 object-contain"
              />
            </div>

            <CardTitle className="text-2xl font-bold text-[#111827]">
              Login to Your Account
            </CardTitle>

            <p className="text-sm text-[#6B7280]">
              Welcome back to Sahayogi
            </p>
          </CardHeader>

          {/* BODY */}
          <CardContent className="px-6 pb-6">
            
            <p className="mb-6 text-center text-sm font-medium text-[#111827]">
              Continue as
            </p>

            {/* Volunteer */}
            <Link href="/login/volunteer-login">
              <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-[#CACDD3] p-5 transition-all duration-200 hover:border-[#4F46C8] hover:bg-[#4F46C8]/10">
                <User className="text-[#4F46C8]" size={24} />

                <div>
                  <p className="font-semibold text-[#111827]">
                    Volunteer
                  </p>

                  <p className="text-sm text-[#6B7280]">
                    Login as a volunteer and explore tasks
                  </p>
                </div>
              </div>
            </Link>

            {/* OR Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>

              <span className="mx-4 text-sm font-medium text-[#6B7280]">
                OR
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* NGO */}
            <Link href="/login/ngo-login">
              <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-[#CACDD3] p-5 transition-all duration-200 hover:border-[#7683D6] hover:bg-[#7683D6]/10">
                <Building2 className="text-[#7683D6]" size={24} />

                <div>
                  <p className="font-semibold text-[#111827]">
                    Organization (NGO)
                  </p>

                  <p className="text-sm text-[#6B7280]">
                    Login to manage opportunities
                  </p>
                </div>
              </div>
            </Link>

            {/* FOOTER */}
            <div className="mt-8 border-t pt-5 text-center">
              <p className="text-sm text-[#6B7280]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-blue-600 hover:underline"
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