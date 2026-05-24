import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, ChevronRight, Landmark, ArrowRightLeft, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAccounts } from "@/services/transactionService";
import { fetchGoals } from "@/services/goalService";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  type: string;
  current_balance: number;
  color: string | null;
}


function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const WalletSummaryCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalMetas, setTotalMetas] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = () => Promise.all([getAccounts(), fetchGoals()]).then(([accs, goals]) => {
      setAccounts(accs as unknown as Account[]);
      setTotalMetas(goals.reduce((s, g) => s + g.current_amount, 0));
    });
    load();
    const onChange = () => load();
    window.addEventListener("finance-data-changed", onChange);

    const channel = supabase
      .channel("wallet-summary-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts", filter: `user_id=eq.${user.id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "goals", filter: `user_id=eq.${user.id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "goal_transactions", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();

    return () => {
      window.removeEventListener("finance-data-changed", onChange);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance), 0);
  const totalReservado = totalMetas;
  const patrimonio = totalBalance + totalReservado;

  return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 md:p-6 shadow-[0_8px_30px_-5px_rgba(0,0,0,0.5)] group cursor-pointer backdrop-blur-2xl"
        onClick={() => navigate("/gestao")}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary/[0.07] blur-[64px]" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">Minha Carteira</h3>
              <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mt-0.5">Patrimônio Total</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors duration-300" />
        </div>

        <div className="mt-8 space-y-1">
          <p className="text-[11px] text-white/40 uppercase tracking-[0.2em]">Saldo Total</p>
          <p className={cn("text-4xl font-extrabold tracking-tight tabular-nums font-display", patrimonio >= 0 ? "text-white" : "text-destructive")}>
            {formatCurrency(patrimonio)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.05]">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Contas</p>
            <p className={cn("text-sm font-bold tabular-nums text-white")}>
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.05]">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Reservado</p>
            <p className="text-sm font-bold tabular-nums text-white">
              {totalReservado > 0 ? formatCurrency(totalReservado) : "R$ 0,00"}
            </p>
          </div>
        </div>
      </motion.div>
  );
};

export default WalletSummaryCard;
