// app/page.tsx
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import TrustedPartners from "./components/TrustedPartners";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/testimonials";
import ImpactStats from "./components/Impactstats";
export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
       <TrustedPartners />
        <HowItWorks />
      <FeaturesSection />
      <Testimonials />
      <ImpactStats />
      <Footer />
      
    </>
    
  );
}