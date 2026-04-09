import { useState, useEffect, useCallback } from "react";
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
import {
  Challenge,
  UserChallenge,
  fetchSuggestions,
  fetchUserChallenges,
  acceptChallenge,
  checkinChallenge,
  createCustomChallenge,
  abandonChallenge,
} from "@/services/challengeService";

const DIFFICULTY_LABEL: Record<string, string> = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };
const DIFFICULTY_COLOR: Record<string, string> = {
  facil: "bg-primary/80 text-primary-foreground",
  medio: "bg-warning/80 text-warning-foreground",
  dificil: "bg-destructive/80 text-destructive-foreground",
};

const COVER_GRADIENTS = [
  "from-emerald-900/60 to-emerald-700/30",
  "from-blue-900/60 to-blue-700/30",
  "from-purple-900/60 to-purple-700/30",
  "from-amber-900/60 to-amber-700/30",
  "from-rose-900/60 to-rose-700/30",
  "from-cyan-900/60 to-cyan-700/30",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="min-w-[260px] max-w-[280px] snap-start rounded-xl bg-card border border-border/40 overflow-hidden flex flex-col"
    >
      {/* Cover */}
      <div className={cn("relative h-32 bg-gradient-to-br flex items-end p-3", gradient)}>
        <span className={cn("absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded", DIFFICULTY_COLOR[challenge.difficulty])}>
          {DIFFICULTY_LABEL[challenge.difficulty] ?? challenge.difficulty}
        </span>
        <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded bg-background/60 text-foreground">
          {challenge.duration_days} dias
        </span>
        <p className="text-sm font-bold text-foreground leading-tight flex items-center gap-1.5">
          <span className="text-lg">{challenge.icon}</span> {challenge.name}
        </p>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <p className={cn("text-xs text-muted-foreground", !expanded && "line-clamp-2")}>{challenge.description}</p>
          {challenge.description && challenge.description.length > 80 && (
            <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5">
              {expanded ? <><ChevronUp className="w-3 h-3" /> Ver menos</> : <><ChevronDown className="w-3 h-3" /> Ver mais</>}
            </button>
          )}
        </div>

        <div className="mt-auto space-y-2">
          <div className="bg-secondary/60 rounded-lg px-3 py-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Economia Potencial</p>
            <p className="text-sm font-bold text-primary">
              R$ {Number(challenge.potential_savings).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
            disabled={loading}
            onClick={onAccept}
          >
            <Check className="w-4 h-4 mr-1" /> Aceitar Desafio
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
  const savedEstimate = Number(c.potential_savings) * (progressPct / 100);
  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl bg-card border border-border/40 overflow-hidden flex flex-col relative"
    >
      {/* Cover */}
      <div className={cn("relative h-24 bg-gradient-to-br flex items-center justify-center", gradient)}>
        <span className={cn("absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded", DIFFICULTY_COLOR[c.difficulty])}>
          {DIFFICULTY_LABEL[c.difficulty] ?? c.difficulty}
        </span>

        {/* Menu */}
        <div className="absolute top-2 right-2">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-full bg-background/40 hover:bg-background/60 text-foreground">
            <MoreVertical className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden"
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

        <span className="text-4xl opacity-60">{c.icon}</span>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <span>{c.icon}</span> {c.name}
          </p>
          <p className="text-[11px] text-muted-foreground">{daysLeft} dias restantes</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-bold text-primary">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2 bg-secondary" />
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-secondary/60 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-primary" />
            <span className="text-[11px] text-foreground font-medium">{uc.checkin_count ?? 0} dias</span>
          </div>
          <div className="flex-1 bg-secondary/60 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-primary" />
            <span className="text-[11px] text-foreground font-medium">R$ {savedEstimate.toFixed(0)},00</span>
          </div>
        </div>

        {/* Check-in */}
        <Button
          className={cn(
            "w-full mt-auto",
            uc.checked_today
              ? "bg-secondary text-muted-foreground cursor-default"
              : "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
          )}
          size="sm"
          disabled={uc.checked_today || loadingId === uc.id}
          onClick={onCheckin}
        >
          <Flame className="w-4 h-4 mr-1" /> {uc.checked_today ? "Feito hoje ✓" : "Check-in diário"}
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

/* ─────── Main Page ─────── */
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
            <span className="text-primary">✨</span> Sugestões para Você
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
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {suggestions.map((c, i) => (
              <SuggestionCard
                key={c.id}
                challenge={c}
                index={i}
                onAccept={() => handleAccept(c.id)}
                loading={acceptingId === c.id}
              />
            ))}
          </div>
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
