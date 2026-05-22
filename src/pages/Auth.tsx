import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HubySection from "@/components/landing/HubySection";
import Features from "@/components/landing/Features";
import BeforeAfter from "@/components/landing/BeforeAfter";
import Plans from "@/components/landing/Plans";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Auth = () => {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-inter overflow-x-hidden selection:bg-[#00e676]/30">
      <Navbar />
      
      <main>
        <Hero videoSrc="https://cdn.pixabay.com/video/2020/09/20/50456-462102146_large.mp4" />
        <HubySection />
        <Features />
        <BeforeAfter />
        <Plans />
        <Testimonials />
        <CTA />
      </main>

      <Footer />

      <style>{`
        body {
            background-color: #0a0a0a;
            overflow-x: hidden;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        ::selection {
            background-color: rgba(0, 230, 118, 0.2);
            color: #00e676;
        }
      `}</style>
    </div>
  );
};

export default Auth;
