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

const Signup = () => {
  return (
    <div className="min-h-screen bg-[#F0F1F3]">
      <Navbar />

      <div className="container mx-auto flex items-center justify-center px-3 py-8 sm:px-4 sm:py-16 lg:py-20">
        <Card className="w-full max-w-md rounded-xl border border-[#CACDD3] bg-white shadow-xl">
          
          {/* Header */}
          <CardHeader className="space-y-3 px-4 pt-6 text-center sm:px-6">
            <div className="flex justify-center">
              <img
                src="/logo1.png"
                alt="Sahayogi Logo"
                className="h-20 w-20 object-contain"
              />
            </div>

            <CardTitle className="text-2xl font-bold text-[#111827]">
              Create Account
            </CardTitle>

            <p className="text-sm text-[#6B7280]">
              Join Sahayogi and start making an impact
            </p>
          </CardHeader>

          {/* Body */}
          <CardContent className="px-4 pb-6 sm:px-6">
            <p className="mb-6 text-center text-sm font-medium text-[#111827]">
              I want to join as:
            </p>

            <div className="flex flex-col gap-5">
              
              {/* Volunteer */}
              <Link
                href="/signup/volunteer-register"
                className="block"
              >
                <div className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-5 transition-all duration-200 hover:border-[#4F46C8] hover:bg-[#4F46C8]/10">
                  <User size={24} className="text-[#4F46C8]" />

                  <div>
                    <h3 className="font-semibold text-[#111827]">
                      Volunteer
                    </h3>

                    <p className="text-sm text-gray-500">
                      Find opportunities and make a difference
                    </p>
                  </div>
                </div>
              </Link>

              {/* Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300" />

                <span className="mx-4 text-xs font-semibold uppercase text-gray-400">
                  OR
                </span>

                <div className="flex-1 border-t border-gray-300" />
              </div>

              {/* NGO */}
              <Link
                href="/signup/ngo-register"
                className="block"
              >
                <div className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-5 transition-all duration-200 hover:border-[#7683D6] hover:bg-[#7683D6]/10">
                  <Building2 size={24} className="text-[#7683D6]" />

                  <div>
                    <h3 className="font-semibold text-[#111827]">
                      Organization (NGO)
                    </h3>

                    <p className="text-sm text-gray-500">
                      Post opportunities and find volunteers
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Login */}
            <div className="mt-8 border-t pt-4">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;