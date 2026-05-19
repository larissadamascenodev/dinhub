import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { DashboardOverview } from "@/components/landing/DashboardOverview";
import { HubySection } from "@/components/landing/HubySection";
import { FeaturesTabs } from "@/components/landing/FeaturesTabs";
import { AntesDuranteDepois } from "@/components/landing/AntesDuranteDepois";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { CtaFinal, Footer } from "@/components/landing/CtaFinal";

const Landing: React.FC = () => {
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authView, setAuthView] = React.useState<"login" | "signup">("signup");
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const openSignup = () => { setAuthView("signup"); setAuthOpen(true); };
  const openLogin = () => { setAuthView("login"); setAuthOpen(true); };

  React.useEffect(() => {
    const prev = document.body.style.overflowX;
    document.body.style.overflowX = "hidden";
    document.body.style.background = "#0a0a0a";
    return () => { document.body.style.overflowX = prev; };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: "#0a0a0a", color: "#fff" }}>
      <Navbar onLogin={openLogin} onSignup={openSignup} />
      <main>
        <Hero onCta={openSignup} />
        <DashboardOverview />
        <HubySection />
        <FeaturesTabs />
        <AntesDuranteDepois />
        <Pricing onCta={openSignup} />
        <Testimonials />
        <CtaFinal onCta={openSignup} />
      </main>
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultView={authView} />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
