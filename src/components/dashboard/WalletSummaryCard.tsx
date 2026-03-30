import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, ChevronRight, Landmark, CreditCard, TrendingUp } from "lucide-react";
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

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance), 0);
  const totalAvailable = cards.reduce((s, c) => s + Math.max(Number(c.limit) - Number(c.used_limit), 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-4 space-y-3 group hover:border-primary/20 transition-all cursor-pointer"
      onClick={() => navigate("/gestao")}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-xs font-semibold font-display">Minha Carteira</h3>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Landmark className="w-3 h-3 text-muted-foreground" />
            <p className="text-[9px] text-muted-foreground">Saldo em Contas</p>
          </div>
          <p className={cn("text-sm font-bold tabular-nums", totalBalance >= 0 ? "text-primary" : "text-destructive")}>
            {formatCurrency(totalBalance)}
          </p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CreditCard className="w-3 h-3 text-muted-foreground" />
            <p className="text-[9px] text-muted-foreground">Limite Disponível</p>
          </div>
          <p className="text-sm font-bold tabular-nums text-foreground">
            {formatCurrency(totalAvailable)}
          </p>
        </div>
      </div>

      {/* Quick list */}
      {accounts.length > 0 && (
        <div className="space-y-1">
          {accounts.slice(0, 3).map((acc) => (
            <div key={acc.id} className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[11px] text-foreground font-medium truncate max-w-[120px]">{acc.name}</span>
              </div>
              <span className={cn("text-[11px] font-bold tabular-nums", Number(acc.current_balance) >= 0 ? "text-primary" : "text-destructive")}>
                {formatCurrency(Number(acc.current_balance))}
              </span>
            </div>
          ))}
          {accounts.length > 3 && (
            <p className="text-[9px] text-muted-foreground text-center">+{accounts.length - 3} contas</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 pt-1">
        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Gerenciar carteira</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
};

export default WalletSummaryCard;
