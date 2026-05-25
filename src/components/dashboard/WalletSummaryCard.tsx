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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[32px] border border-white/[0.05] bg-zinc-950 p-7 md:p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] group cursor-pointer"
        onClick={() => navigate("/gestao")}
      >
        {/* Deep ambient glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/[0.08] blur-[80px] group-hover:bg-primary/[0.12] transition-colors duration-700" />
        <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-blue-500/[0.05] blur-[80px]" />
        
        <div className="relative flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/[0.06] shadow-inner group-hover:border-primary/20 transition-colors duration-500">
              <Wallet className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white tracking-tight">Minha Carteira</h3>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-1">Status Patrimonial</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center group-hover:bg-primary transition-all duration-500">
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        <div className="space-y-1 relative z-10">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-2">Patrimônio Líquido</p>
          <p className={cn("text-5xl font-extrabold tracking-tighter tabular-nums font-display leading-none", patrimonio >= 0 ? "text-white" : "text-destructive")}>
            {formatCurrency(patrimonio)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-12 relative z-10">
          <div className="bg-white/[0.02] rounded-3xl p-5 border border-white/[0.04] group-hover:border-white/[0.08] transition-colors">
            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mb-2">Liquidez</p>
            <p className="text-lg font-bold tabular-nums text-white tracking-tight">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="bg-white/[0.02] rounded-3xl p-5 border border-white/[0.04] group-hover:border-white/[0.08] transition-colors">
            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mb-2">Metas</p>
            <p className="text-lg font-bold tabular-nums text-primary tracking-tight">
              {totalReservado > 0 ? formatCurrency(totalReservado) : "R$ 0,00"}
            </p>
          </div>
        </div>
      </motion.div>
  );
};

export default WalletSummaryCard;
