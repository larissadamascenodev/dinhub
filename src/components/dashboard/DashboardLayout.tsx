import { useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { useProfile } from "@/hooks/useProfile";
import { MonthProvider } from "@/contexts/MonthContext";
import NovaTransacaoModal from "@/components/dashboard/NovaTransacaoModal";
import TransactionTypeChooser from "@/components/dashboard/TransactionTypeChooser";

const DashboardLayout = () => {
  const { profile } = useProfile();
  const [showTypeChooser, setShowTypeChooser] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"receita" | "despesa">("despesa");

  // Global listener for the mobile + button and desktop "Nova transação"
  useEffect(() => {
    const handleDirect = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === "receita" || detail?.type === "despesa") {
        setModalType(detail.type);
        setShowModal(true);
      }
    };
    const handleScanner = () => {
      console.log("Scanner opened");
    };
    window.addEventListener("open-nova-transacao-direct", handleDirect);
    window.addEventListener("open-scanner", handleScanner);
    return () => {
      window.removeEventListener("open-nova-transacao-direct", handleDirect);
      window.removeEventListener("open-scanner", handleScanner);
    };
  }, []);

  const handleTypeSelected = useCallback((type: "receita" | "despesa") => {
    setModalType(type);
    setShowTypeChooser(false);
    setShowModal(true);
  }, []);

  const handleSuccess = useCallback(() => {
    window.dispatchEvent(new CustomEvent("transaction-created"));
  }, []);

  return (
    <MonthProvider>
      <div className="dark min-h-screen bg-background text-foreground">
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8 xl:px-12 pt-0 pb-24 md:pb-8">
          <DashboardHeader profile={profile} />
          <Outlet context={{ profile }} />
        </div>
        <MobileBottomNav />
        <TransactionTypeChooser open={showTypeChooser} onClose={() => setShowTypeChooser(false)} onSelect={handleTypeSelected} />
        <NovaTransacaoModal open={showModal} onClose={() => setShowModal(false)} onSuccess={handleSuccess} initialType={modalType} />
      </div>
    </MonthProvider>
  );
};

export default DashboardLayout;
