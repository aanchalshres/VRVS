// app/layout.tsx

import "./globals.css";
import React from "react";
import { AuthProvider } from "./providers/AuthProvider";
import Footer from "./components/Footer"; // Update the path if needed

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className="bg-background text-foreground font-sans antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}