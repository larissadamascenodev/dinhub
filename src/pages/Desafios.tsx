import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Flame, MoreVertical, Plus, RefreshCw, Trash2, Trophy, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useRadarFinanceiro } from "@/hooks/useRadarFinanceiro";
import { calculateHealthScore } from "@/services/healthScoreService";
import {
  Challenge,
  UserChallenge,
  fetchSuggestions,
  fetchUserChallenges,
  acceptChallenge,
  checkinChallenge,
  createCustomChallenge,
  abandonChallenge,
  generateDynamicSuggestions,
  getHubyMessage,
} from "@/services/challengeService";

const DIFFICULTY_LABEL: Record<string, string> = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };
const DIFFICULTY_COLOR: Record<string, string> = {
  facil: "bg-primary/15 text-primary border border-primary/20",
  medio: "bg-warning/15 text-warning border border-warning/20",
  dificil: "bg-destructive/15 text-destructive border border-destructive/20",
};

const COVER_GRADIENTS = [
  "from-emerald-500/30 via-emerald-900/50 to-emerald-950/80",
  "from-blue-500/30 via-blue-900/50 to-blue-950/80",
  "from-purple-500/30 via-purple-900/50 to-purple-950/80",
  "from-amber-500/30 via-amber-900/50 to-amber-950/80",
  "from-rose-500/30 via-rose-900/50 to-rose-950/80",
  "from-cyan-500/30 via-cyan-900/50 to-cyan-950/80",
];

const COVER_GLOW = [
  "shadow-emerald-500/20",
  "shadow-blue-500/20",
  "shadow-purple-500/20",
  "shadow-amber-500/20",
  "shadow-rose-500/20",
  "shadow-cyan-500/20",
];

/* ─────── Suggestion Card ─────── */
const SuggestionCard = ({
  challenge,
  index,
  onAccept,
  loading,
}: {
  challenge: Challenge;
  index: number;
  onAccept: () => void;
  loading: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const glow = COVER_GLOW[index % COVER_GLOW.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "min-w-[270px] max-w-[290px] snap-start rounded-2xl overflow-hidden flex flex-col",
        "bg-card/80 backdrop-blur-md border border-white/[0.06]",
        "shadow-lg", glow
      )}
    >
      {/* Cover with image */}
      <div className={cn("relative h-36 bg-gradient-to-br flex flex-col justify-end p-4", gradient)}>
        {challenge.cover_image && (
          <img src={challenge.cover_image} alt={challenge.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5 z-10">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm", DIFFICULTY_COLOR[challenge.difficulty])}>
            {DIFFICULTY_LABEL[challenge.difficulty] ?? challenge.difficulty}
          </span>
        </div>
        <span className="absolute top-2.5 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white/80 border border-white/10 z-10">
          ⏱ {challenge.duration_days} dias
        </span>
        
        <div className="relative z-10">
          <span className="text-2xl mb-1 block drop-shadow-lg">{challenge.icon}</span>
          <p className="text-sm font-bold text-white leading-tight drop-shadow-md">
            {challenge.name}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Personalized hint */}
        {challenge.personalHint && (
          <p className="text-[11px] text-primary/80 font-medium leading-snug">{challenge.personalHint}</p>
        )}
        <div>
          <p className={cn("text-xs text-muted-foreground leading-relaxed", !expanded && "line-clamp-2")}>{challenge.description}</p>
          {challenge.description && challenge.description.length > 80 && (
            <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-primary flex items-center gap-0.5 mt-1 hover:underline">
              {expanded ? <><ChevronUp className="w-3 h-3" /> Ver menos</> : <><ChevronDown className="w-3 h-3" /> Ver mais</>}
            </button>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <div className="bg-primary/[0.06] border border-primary/10 rounded-lg px-2.5 py-1.5">
            <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-medium">
              Economia Potencial
            </p>
            <p className="text-xs font-bold text-primary">
              R$ {(challenge.realPotential ?? Number(challenge.potential_savings)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Button
            className="w-full bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 rounded-xl h-10 font-semibold"
            size="sm"
            disabled={loading}
            onClick={onAccept}
          >
            <Check className="w-4 h-4 mr-1.5" /> Aceitar Desafio
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────── Active Challenge Card ─────── */
const ActiveCard = ({
  uc,
  index,
  onCheckin,
  onAbandon,
  loadingId,
}: {
  uc: UserChallenge;
  index: number;
  onCheckin: () => void;
  onAbandon: () => void;
  loadingId: string | null;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const c = uc.challenge!;
  const progressPct = Math.min(100, Math.round(((uc.checkin_count ?? 0) / c.duration_days) * 100));
  const daysLeft = Math.max(0, c.duration_days - (uc.checkin_count ?? 0));
  const hasRealSavings = uc.real_savings !== null && uc.real_savings !== undefined && uc.real_savings > 0;
  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const glow = COVER_GLOW[index % COVER_GLOW.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-2xl overflow-hidden flex flex-col relative",
        "bg-card/80 backdrop-blur-md border border-white/[0.06]",
        "shadow-lg", glow
      )}
    >
      {/* Cover */}
      <div className={cn("relative h-28 bg-gradient-to-br flex items-center justify-center", gradient)}>
        {c.cover_image && (
          <img src={c.cover_image} alt={c.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <span className={cn("absolute top-2.5 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm z-10", DIFFICULTY_COLOR[c.difficulty])}>
          {DIFFICULTY_LABEL[c.difficulty] ?? c.difficulty}
        </span>

        {/* Menu */}
        <div className="absolute top-2.5 right-3 z-10">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white/80 transition-colors">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 mt-1 bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-20 overflow-hidden"
              >
                <button
                  onClick={() => { setMenuOpen(false); onAbandon(); }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 w-full"
                >
                  <Trash2 className="w-3 h-3" /> Abandonar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-5xl drop-shadow-lg opacity-70 relative z-10">{c.icon}</span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            {c.name}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{daysLeft} dias restantes</p>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-bold text-primary">{progressPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-primary/[0.06] border border-primary/10 rounded-xl px-2.5 py-2 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <div>
              <p className="text-[9px] text-muted-foreground">Sequência</p>
              <p className="text-xs text-foreground font-semibold">{uc.checkin_count ?? 0} dias</p>
            </div>
          </div>
          <div className="flex-1 bg-primary/[0.06] border border-primary/10 rounded-xl px-2.5 py-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <div>
              <p className="text-[9px] text-muted-foreground">Economizado</p>
              <p className="text-xs text-foreground font-semibold">
                {hasRealSavings ? `R$ ${uc.real_savings}` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Huby message */}
        <div className="bg-primary/[0.04] border border-primary/10 rounded-xl px-3 py-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            💬 {getHubyMessage(uc.checkin_count ?? 0, c.duration_days, !!uc.violated)}
          </p>
        </div>

        {/* Check-in */}
        <Button
          className={cn(
            "w-full mt-auto rounded-xl h-10 font-semibold",
            uc.checked_today
              ? "bg-secondary text-muted-foreground cursor-default"
              : "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
          )}
          size="sm"
          disabled={uc.checked_today || loadingId === uc.id}
          onClick={onCheckin}
        >
          <Flame className="w-4 h-4 mr-1.5" /> {uc.checked_today ? "Feito hoje ✓" : "Check-in diário"}
        </Button>
      </div>
    </motion.div>
  );
};
/* ─────── Create Modal ─────── */
const CreateChallengeModal = ({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState("7");
  const [difficulty, setDifficulty] = useState("facil");
  const [savings, setSavings] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setLoading(true);
    try {
      await createCustomChallenge(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          duration_days: parseInt(days) || 7,
          difficulty,
          potential_savings: parseFloat(savings) || 0,
        },
        user.id
      );
      toast.success("Desafio criado!");
      onCreated();
      onClose();
      setName(""); setDescription(""); setDays("7"); setSavings("");
    } catch {
      toast.error("Erro ao criar desafio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <h3 className="text-lg font-bold text-foreground mb-3">Criar Desafio</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Sem delivery por 30 dias" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Descrição (opcional)</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o desafio..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Duração (dias)</label>
              <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Economia (R$)</label>
              <Input type="number" value={savings} onChange={(e) => setSavings(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Dificuldade</label>
            <div className="flex gap-2">
              {(["facil", "medio", "dificil"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "flex-1 text-xs font-medium py-2 rounded-lg border transition-colors",
                    difficulty === d
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {DIFFICULTY_LABEL[d]}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full bg-primary text-primary-foreground" disabled={!name.trim() || loading} onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-1" /> Criar e Aceitar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─────── Suggestions Carousel (drag/swipe) ─────── */
const SuggestionsCarousel = ({
  suggestions,
  onAccept,
  acceptingId,
}: {
  suggestions: Challenge[];
  onAccept: (id: string) => void;
  acceptingId: string | null;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    el.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    scrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - startX.current;
    scrollRef.current.scrollLeft = scrollLeft.current - dx;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.releasePointerCapture(e.pointerId);
    scrollRef.current.style.cursor = "grab";
    scrollRef.current.style.userSelect = "";
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide cursor-grab"
      style={{ WebkitOverflowScrolling: "touch" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {suggestions.map((c, i) => (
        <SuggestionCard
          key={c.id}
          challenge={c}
          index={i}
          onAccept={() => onAccept(c.id)}
          loading={acceptingId === c.id}
        />
      ))}
    </div>
  );
};

const Desafios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Challenge[]>([]);
  const [active, setActive] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [checkinId, setCheckinId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([fetchSuggestions(), fetchUserChallenges()]);
      // Show violation toasts
      for (const uc of a) {
        if (uc.violated && uc.challenge) {
          toast.error(`Desafio "${uc.challenge.name}" foi quebrado! Uma nova despesa foi detectada nas categorias monitoradas. O progresso foi reiniciado.`, { duration: 6000 });
        }
      }
      // Filter out already accepted suggestions
      const acceptedIds = new Set(a.map((uc) => uc.challenge_id));
      setSuggestions(s.filter((c) => !acceptedIds.has(c.id)));
      setActive(a);
    } catch {
      toast.error("Erro ao carregar desafios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (challengeId: string) => {
    if (!user) return;
    setAcceptingId(challengeId);
    try {
      await acceptChallenge(challengeId, user.id);
      toast.success("Desafio aceito! 💪");
      await load();
    } catch {
      toast.error("Erro ao aceitar desafio");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCheckin = async (ucId: string) => {
    if (!user) return;
    setCheckinId(ucId);
    try {
      await checkinChallenge(ucId, user.id);
      toast.success("Check-in registrado! 🔥");
      await load();
    } catch {
      toast.error("Erro ao fazer check-in");
    } finally {
      setCheckinId(null);
    }
  };

  const handleAbandon = async (ucId: string) => {
    try {
      await abandonChallenge(ucId);
      toast.success("Desafio abandonado");
      await load();
    } catch {
      toast.error("Erro ao abandonar");
    }
  };

  return (
    <div className="min-h-screen pb-28 px-4 pt-4 max-w-5xl mx-auto">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <h1 className="text-2xl font-bold text-foreground">Desafios</h1>
      <p className="text-sm text-muted-foreground mb-6">Competições e economia</p>

      {/* Suggestions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="text-primary">✨</span> Recomendados para Você
          </h2>
          <button onClick={load} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[260px] h-64 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Você já aceitou todos os desafios disponíveis! 🎉</p>
        ) : (
          <SuggestionsCarousel
            suggestions={suggestions}
            onAccept={handleAccept}
            acceptingId={acceptingId}
          />
        )}
      </div>

      {/* Active Challenges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Desafios Ativos</h2>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
          >
            <Plus className="w-4 h-4" /> Criar
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="text-center py-10">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">Nenhum desafio ativo. Aceite um acima ou crie o seu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {active.map((uc, i) => (
              <ActiveCard
                key={uc.id}
                uc={uc}
                index={i}
                onCheckin={() => handleCheckin(uc.id)}
                onAbandon={() => handleAbandon(uc.id)}
                loadingId={checkinId}
              />
            ))}
          </div>
        )}
      </div>

      <CreateChallengeModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
    </div>
  );
};

export default Desafios;
