"use client";

import Link from "next/link";
import Image from "next/image";
import { Handshake, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-[#CACDD3] bg-[#F0F1F3]">
      <div className="container mx-auto px-4 py-12">

        {/* TOP SECTION */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">

          {/* LOGO + DESCRIPTION */}
          <div>
            <div className="flex items-center gap-3 mb-4">

              <Image
                src="/logo1.png"
                alt="Sahayogi Logo"
                width={100}
                height={100}
                className="rounded-lg"
                style={{ width: 'auto', height: 'auto' }}
              />

              <span className="text-lg font-bold text-[#111827]">
                Sahayogi
              </span>
            </div>

            <p className="text-sm text-[#6B7280] leading-relaxed">
              Connecting volunteers and organizations across Nepal for emergency response,
              disaster relief, and meaningful community impact.
            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-3 mt-4">

              <Link href="https://facebook.com/yourusername" target="_blank">
                <Facebook className="h-5 w-5 cursor-pointer text-[#6B7280] hover:text-[#4F46C8] transition-colors" />
              </Link>

              <Link href="https://twitter.com/yourusername" target="_blank">
                <Twitter className="h-5 w-5 cursor-pointer text-[#6B7280] hover:text-[#4F46C8] transition-colors" />
              </Link>

              <Link href="https://instagram.com/yourusername" target="_blank">
                <Instagram className="h-5 w-5 cursor-pointer text-[#6B7280] hover:text-[#4F46C8] transition-colors" />
              </Link>

              <Link href="https://linkedin.com/in/yourusername" target="_blank">
                <Linkedin className="h-5 w-5 cursor-pointer text-[#6B7280] hover:text-[#4F46C8] transition-colors" />
              </Link>

            </div>
          </div>

          {/* PLATFORM */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#111827]">
              Platform
            </h4>

            <div className="flex flex-col gap-2">

              <Link
                href="/about"
                className="text-sm text-[#6B7280] hover:text-[#4F46C8] transition-colors"
              >
                About Us
              </Link>

              <Link
                href="/signup"
                className="text-sm text-[#6B7280] hover:text-[#4F46C8] transition-colors"
              >
                Join Us
              </Link>

            </div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-10 border-t border-[#B9C0D4] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-sm text-[#6B7280] text-center md:text-left">
            © 2026 Sahayogi. All rights reserved.
          </p>

          <p className="flex items-center gap-1 text-sm text-[#6B7280]">
            Made by
            <Handshake className="h-4 w-4 text-[#4F46C8]" />
            Team Sahayogi
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;