import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, ChevronRight, Landmark, CreditCard, ArrowRightLeft, TrendingUp, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAccounts, getCreditCards } from "@/services/transactionService";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  type: string;
  current_balance: number;
  color: string | null;
}

interface CreditCardItem {
  id: string;
  name: string;
  limit: number;
  used_limit: number;
  color: string | null;
  last_four_digits: string | null;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const WalletSummaryCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CreditCardItem[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getAccounts(), getCreditCards()]).then(([accs, cds]) => {
      setAccounts(accs as unknown as Account[]);
      setCards(cds as unknown as CreditCardItem[]);
    });
  }, [user]);

  const bankAccounts = accounts.filter(a => a.type !== "investment");
  const investmentAccounts = accounts.filter(a => a.type === "investment");
  const totalBalance = bankAccounts.reduce((s, a) => s + Number(a.current_balance), 0);
  const totalInvested = investmentAccounts.reduce((s, a) => s + Number(a.current_balance), 0);
  const totalCreditLimit = cards.reduce((s, c) => s + Number(c.limit), 0);
  const totalCreditUsed = cards.reduce((s, c) => s + Number(c.used_limit), 0);
  const totalAvailable = totalCreditLimit - totalCreditUsed;
  const patrimonio = totalBalance + totalInvested;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-primary/10 bg-primary/[0.04] backdrop-blur-xl p-3 md:p-3.5 space-y-1.5 md:space-y-2 group cursor-pointer"
      onClick={() => navigate("/gestao")}
    >
      {/* Glassmorphism decorative elements */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary/[0.06] blur-xl" />
      <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-primary/[0.04] blur-lg" />

      {/* Header + Patrimônio inline on mobile */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-primary/15 flex items-center justify-center backdrop-blur-sm">
            <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold font-display text-primary leading-none">Minha Carteira</h3>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5 md:hidden">Patrimônio Total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className={cn("text-base font-bold tabular-nums md:hidden", patrimonio >= 0 ? "text-primary" : "text-destructive")}>
            {formatCurrency(patrimonio)}
          </p>
          <ChevronRight className="w-4 h-4 text-primary/30 group-hover:text-primary transition-colors" />
        </div>
      </div>

      {/* Patrimônio total - desktop only */}
      <div className="relative text-center py-1 hidden md:block">
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">Patrimônio Total</p>
        <p className={cn("text-lg font-bold tabular-nums", patrimonio >= 0 ? "text-primary" : "text-destructive")}>
          {formatCurrency(patrimonio)}
        </p>
      </div>

      {/* Stats row */}
      <div className="relative grid grid-cols-3 gap-1">
        <div className="bg-background/40 backdrop-blur-sm rounded-lg md:rounded-xl p-1.5 md:p-2 text-center border border-border/10">
          <Landmark className="w-3 h-3 text-primary/60 mx-auto mb-0.5" />
          <p className="text-[8px] text-muted-foreground leading-tight">Contas</p>
          <p className={cn("text-[10px] md:text-[11px] font-bold tabular-nums mt-0.5", totalBalance >= 0 ? "text-primary" : "text-destructive")}>
            {formatCurrency(totalBalance)}
          </p>
        </div>
        <div className="bg-background/40 backdrop-blur-sm rounded-lg md:rounded-xl p-1.5 md:p-2 text-center border border-border/10">
          <CreditCard className="w-3 h-3 text-primary/60 mx-auto mb-0.5" />
          <p className="text-[8px] text-muted-foreground leading-tight">Crédito</p>
          <p className="text-[10px] md:text-[11px] font-bold tabular-nums text-foreground mt-0.5">
            {formatCurrency(totalAvailable)}
          </p>
        </div>
        <div className="bg-background/40 backdrop-blur-sm rounded-lg md:rounded-xl p-1.5 md:p-2 text-center border border-border/10">
          <Briefcase className="w-3 h-3 text-primary/60 mx-auto mb-0.5" />
          <p className="text-[8px] text-muted-foreground leading-tight">Investimentos</p>
          <p className={cn("text-[10px] md:text-[11px] font-bold tabular-nums mt-0.5", totalInvested > 0 ? "text-foreground" : "text-muted-foreground")}>
            {totalInvested > 0 ? formatCurrency(totalInvested) : "R$ 0,00"}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="relative flex items-center justify-center gap-3 pt-0 md:pt-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/gestao");
          }}
          className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>Transferir</span>
        </button>
        <span className="w-px h-3 bg-primary/10" />
        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
          Gerenciar carteira
        </span>
      </div>
    </motion.div>
  );
};

export default WalletSummaryCard;
