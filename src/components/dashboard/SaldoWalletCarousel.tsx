import { useState, useRef, useCallback, useEffect, memo } from "react";
import { Scale, TrendingUp, CalendarCheck, Wallet, Landmark, CreditCard, Briefcase, ArrowRightLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";
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

interface Props {
  saldoAtual: number;
  saldoPrevisto: number;
  isFutureMonth?: boolean;
  isPastMonth?: boolean;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

const SaldoWalletCarousel = memo(({ saldoAtual, saldoPrevisto, isFutureMonth, isPastMonth }: Props) => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Wallet data
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

  const animatedSaldo = useFormattedCounter(saldoAtual);
  const animatedPrevisto = useFormattedCounter(saldoPrevisto);

  // Swipe handling
  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && page === 0) { setDirection(1); setPage(1); }
      if (diff < 0 && page === 1) { setDirection(-1); setPage(0); }
    }
  }, [page]);

  const goTo = (p: number) => {
    setDirection(p > page ? 1 : -1);
    setPage(p);
  };

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-xl border border-border/10 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)] backdrop-blur-sm overflow-hidden"
        style={{ background: page === 0
          ? "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)"
          : "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)"
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          {page === 0 ? (
            <motion.div
              key="saldo"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="p-4"
            >
              {isFutureMonth ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] text-primary uppercase tracking-[0.15em] font-semibold">Saldo previsto</span>
                    </div>
                  </div>
                  <p className={`font-display text-3xl font-bold tracking-tight tabular-nums leading-none ${saldoAtual >= 0 ? "text-primary" : "text-destructive"} my-[7px]`}>
                    {animatedSaldo}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${saldoPrevisto >= 0 ? "bg-primary" : "bg-destructive"}`} />
                    <span className="text-[10px] text-muted-foreground/60">Projeção ao final do mês</span>
                    <span className={`text-[13px] font-semibold tabular-nums tracking-tight ${saldoPrevisto >= 0 ? "text-primary/80" : "text-destructive/80"}`}>
                      {animatedPrevisto}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Saldo disponível</span>
                    </div>
                  </div>
                  <p className={`font-display text-3xl font-bold tracking-tight tabular-nums leading-none ${saldoAtual >= 0 ? "text-foreground" : "text-destructive"} my-[7px]`}>
                    {animatedSaldo}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${saldoPrevisto >= 0 ? "bg-primary" : "bg-destructive"}`} />
                    <span className="text-[10px] text-muted-foreground/60">Saldo previsto no final do mês</span>
                    <span className={`text-[13px] font-semibold tabular-nums tracking-tight ${saldoPrevisto >= 0 ? "text-primary/80" : "text-destructive/80"}`}>
                      {animatedPrevisto}
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="wallet"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="p-4 space-y-2"
              onClick={() => navigate("/gestao")}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold font-display text-primary leading-none">Minha Carteira</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Patrimônio Total</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={cn("text-base font-bold tabular-nums", patrimonio >= 0 ? "text-primary" : "text-destructive")}>
                    {formatCurrency(patrimonio)}
                  </p>
                  <ChevronRight className="w-4 h-4 text-primary/30" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-background/40 backdrop-blur-sm rounded-lg p-1.5 text-center border border-border/10">
                  <Landmark className="w-3 h-3 text-primary/60 mx-auto mb-0.5" />
                  <p className="text-[8px] text-muted-foreground leading-tight">Contas</p>
                  <p className={cn("text-[10px] font-bold tabular-nums mt-0.5", totalBalance >= 0 ? "text-primary" : "text-destructive")}>
                    {formatCurrency(totalBalance)}
                  </p>
                </div>
                <div className="bg-background/40 backdrop-blur-sm rounded-lg p-1.5 text-center border border-border/10">
                  <CreditCard className="w-3 h-3 text-primary/60 mx-auto mb-0.5" />
                  <p className="text-[8px] text-muted-foreground leading-tight">Crédito</p>
                  <p className="text-[10px] font-bold tabular-nums text-foreground mt-0.5">
                    {formatCurrency(totalAvailable)}
                  </p>
                </div>
                <div className="bg-background/40 backdrop-blur-sm rounded-lg p-1.5 text-center border border-border/10">
                  <Briefcase className="w-3 h-3 text-primary/60 mx-auto mb-0.5" />
                  <p className="text-[8px] text-muted-foreground leading-tight">Investimentos</p>
                  <p className={cn("text-[10px] font-bold tabular-nums mt-0.5", totalInvested > 0 ? "text-foreground" : "text-muted-foreground")}>
                    {totalInvested > 0 ? formatCurrency(totalInvested) : "R$ 0,00"}
                  </p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-center gap-3 pt-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/gestao"); }}
                  className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Transferir</span>
                </button>
                <span className="w-px h-3 bg-primary/10" />
                <span className="text-[10px] text-muted-foreground">Gerenciar carteira</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5">
        {[0, 1].map(i => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              page === i ? "w-4 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
});

SaldoWalletCarousel.displayName = "SaldoWalletCarousel";
export default SaldoWalletCarousel;
