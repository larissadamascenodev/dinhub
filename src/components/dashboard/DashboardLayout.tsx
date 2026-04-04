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
  const [showScanChooser, setShowScanChooser] = useState(false);

  const scanCameraRef = useRef<HTMLInputElement>(null);
  const scanGalleryRef = useRef<HTMLInputElement>(null);

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
      setShowScanChooser(true);
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
        />
        {/* Scan chooser modal */}
        <AnimatePresence>
          {showScanChooser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
              onClick={() => setShowScanChooser(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl p-5 pb-24 sm:pb-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-foreground">Escanear documento</h3>
                <p className="text-xs text-muted-foreground">Escolha como deseja capturar o comprovante</p>
                <div className="space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setShowScanChooser(false); scanCameraRef.current?.click(); }}
                    className="w-full flex items-center gap-3 rounded-xl border border-border/15 bg-muted/10 hover:bg-muted/20 px-4 py-3.5 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Tirar foto</p>
                      <p className="text-[11px] text-muted-foreground">Usar a câmera do celular</p>
                    </div>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setShowScanChooser(false); scanGalleryRef.current?.click(); }}
                    className="w-full flex items-center gap-3 rounded-xl border border-border/15 bg-muted/10 hover:bg-muted/20 px-4 py-3.5 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/30 border border-accent/20 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Galeria</p>
                      <p className="text-[11px] text-muted-foreground">Selecionar foto ou arquivo</p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <input ref={scanCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScanFileInput} />
        <input ref={scanGalleryRef} type="file" accept="image/*,.pdf,.csv" className="hidden" onChange={handleScanFileInput} />
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
