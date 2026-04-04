import { useState, useCallback, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { useProfile } from "@/hooks/useProfile";
import { MonthProvider } from "@/contexts/MonthContext";
import NovaTransacaoModal from "@/components/dashboard/NovaTransacaoModal";
import TransactionTypeChooser from "@/components/dashboard/TransactionTypeChooser";
import TransferModal from "@/components/dashboard/TransferModal";
import InvoiceUploadReviewModal, { type ExtractedItem } from "@/components/fatura/InvoiceUploadReviewModal";
import { supabase } from "@/integrations/supabase/client";
import { createTransaction } from "@/services/transactionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DashboardLayout = () => {
  const { profile } = useProfile();
  const { user } = useAuth();
  const [showTypeChooser, setShowTypeChooser] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [modalType, setModalType] = useState<"receita" | "despesa">("despesa");

  // OCR state
  const [scanProcessing, setScanProcessing] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [extractedMessage, setExtractedMessage] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [confirmingImport, setConfirmingImport] = useState(false);

  const scanFileInputRef = useRef<HTMLInputElement>(null);

  const handleScanFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleScanFile(file);
    e.target.value = "";
  }, []);

  // Global listener for the mobile + button and desktop "Nova transação"
  useEffect(() => {
    const handleDirect = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === "transferencia") {
        setShowTransferModal(true);
      } else if (detail?.type === "receita" || detail?.type === "despesa") {
        setModalType(detail.type);
        setShowModal(true);
      }
    };
    const handleScanner = () => {
      scanFileInputRef.current?.click();
    };
    window.addEventListener("open-nova-transacao-direct", handleDirect);
    window.addEventListener("open-scanner", handleScanner);
    return () => {
      window.removeEventListener("open-nova-transacao-direct", handleDirect);
      window.removeEventListener("open-scanner", handleScanner);
    };
  }, []);

  const handleTypeSelected = useCallback((type: "receita" | "despesa" | "transferencia") => {
    setShowTypeChooser(false);
    if (type === "transferencia") {
      setShowTransferModal(true);
    } else {
      setModalType(type);
      setShowModal(true);
    }
  }, []);

  const handleSuccess = useCallback(() => {
    window.dispatchEvent(new CustomEvent("transaction-created"));
  }, []);

  // OCR scan handler
  const handleScanFile = useCallback(async (file: File) => {
    setScanProcessing(true);
    toast.loading("Processando com IA...", { id: "scan-processing" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "transaction");

      const { data, error } = await supabase.functions.invoke("process-invoice", {
        body: formData,
      });

      if (error) throw new Error(error.message || "Erro ao processar");
      if (data?.error) throw new Error(data.error);

      const items: ExtractedItem[] = (data.items || []).map((item: any) => ({
        ...item,
        selected: true,
      }));

      setExtractedItems(items);
      setExtractedMessage(data.message || "Lançamentos encontrados!");
      setShowReviewModal(true);
      toast.dismiss("scan-processing");
    } catch (err: any) {
      toast.dismiss("scan-processing");
      toast.error(err?.message || "Erro ao processar documento");
    } finally {
      setScanProcessing(false);
    }
  }, []);

  // Confirm import of scanned transactions
  const handleConfirmScanImport = useCallback(async (selectedItems: ExtractedItem[]) => {
    if (!user) return;
    setConfirmingImport(true);
    try {
      for (const item of selectedItems) {
        await createTransaction(
          {
            name: item.description,
            type: (item.type as "receita" | "despesa") || "despesa",
            amount: item.amount,
            category: item.category || "outros",
            date: item.date || new Date().toISOString().split("T")[0],
            status: "pendente",
            payment_method: "conta",
            recurrence_type: item.installment_total && item.installment_total > 1 ? "parcelado" : "unica",
            installments: item.installment_total || null,
            installment_current: item.installment_current || null,
          },
          user.id
        );
      }

      toast.success(`${selectedItems.length} transação${selectedItems.length > 1 ? "ões" : ""} importada${selectedItems.length > 1 ? "s" : ""} com sucesso! 🎉`);
      setShowReviewModal(false);
      setExtractedItems([]);
      handleSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao importar transações");
    } finally {
      setConfirmingImport(false);
    }
  }, [user, handleSuccess]);

  return (
    <MonthProvider>
      <div className="dark min-h-screen bg-background text-foreground">
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8 xl:px-12 pt-0 pb-24 md:pb-8">
          <DashboardHeader profile={profile} />
          <Outlet context={{ profile }} />
        </div>
        <MobileBottomNav />
        <TransactionTypeChooser
          open={showTypeChooser}
          onClose={() => setShowTypeChooser(false)}
          onSelect={handleTypeSelected}
          onScan={handleScanFile}
        />
        <NovaTransacaoModal open={showModal} onClose={() => setShowModal(false)} onSuccess={handleSuccess} initialType={modalType} />
        <TransferModal open={showTransferModal} onClose={() => setShowTransferModal(false)} onSuccess={handleSuccess} />
        <InvoiceUploadReviewModal
          open={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          items={extractedItems}
          message={extractedMessage}
          onConfirm={handleConfirmScanImport}
          confirming={confirmingImport}
        />
      </div>
    </MonthProvider>
  );
};

export default DashboardLayout;
