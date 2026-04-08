import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, Plus,
  ShoppingCart, Utensils, Car, Pill, Home, BookOpen, Shirt, PawPrint,
  Scissors, Gamepad2, Gift, Plane, Smartphone, DollarSign, Briefcase, Music,
  Coffee, Dumbbell, Clapperboard, FileText, Wrench, ShoppingBag, Lightbulb, Target,
  Heart, Repeat, GraduationCap, TrendingUp, Award, Users, Wallet, PiggyBank,
  Zap, Star, Globe, Camera, Headphones, Monitor, Tv, Bus,
  Landmark, Bike, Fuel, Baby, Stethoscope, Palette, UtensilsCrossed,
  Cigarette, Wine, Pizza, Hammer, Key, Shield, Umbrella,
  Tent, Map, Truck, Anchor, Cloudy, Leaf, Flame,
  Gem, Crown, BadgeDollarSign, HandCoins, Receipt, Banknote,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; color: string }) => void;
  initialName?: string;
  initialIcon?: string;
  initialColor?: string;
  title?: string;
  existingNames?: string[];
}

const ICON_OPTIONS: { name: string; Icon: any }[] = [
  { name: "shopping-cart", Icon: ShoppingCart },
  { name: "utensils", Icon: Utensils },
  { name: "car", Icon: Car },
  { name: "pill", Icon: Pill },
  { name: "home", Icon: Home },
  { name: "book-open", Icon: BookOpen },
  { name: "shirt", Icon: Shirt },
  { name: "paw-print", Icon: PawPrint },
  { name: "scissors", Icon: Scissors },
  { name: "gamepad-2", Icon: Gamepad2 },
  { name: "gift", Icon: Gift },
  { name: "plane", Icon: Plane },
  { name: "smartphone", Icon: Smartphone },
  { name: "dollar-sign", Icon: DollarSign },
  { name: "briefcase", Icon: Briefcase },
  { name: "music", Icon: Music },
  { name: "coffee", Icon: Coffee },
  { name: "dumbbell", Icon: Dumbbell },
  { name: "clapperboard", Icon: Clapperboard },
  { name: "file-text", Icon: FileText },
  { name: "wrench", Icon: Wrench },
  { name: "shopping-bag", Icon: ShoppingBag },
  { name: "lightbulb", Icon: Lightbulb },
  { name: "target", Icon: Target },
  { name: "heart", Icon: Heart },
  { name: "repeat", Icon: Repeat },
  { name: "graduation-cap", Icon: GraduationCap },
  { name: "trending-up", Icon: TrendingUp },
  { name: "award", Icon: Award },
  { name: "users", Icon: Users },
  { name: "wallet", Icon: Wallet },
  { name: "piggy-bank", Icon: PiggyBank },
  { name: "zap", Icon: Zap },
  { name: "star", Icon: Star },
  { name: "globe", Icon: Globe },
  { name: "camera", Icon: Camera },
  { name: "headphones", Icon: Headphones },
  { name: "monitor", Icon: Monitor },
  { name: "tv", Icon: Tv },
  { name: "bus", Icon: Bus },
  { name: "landmark", Icon: Landmark },
  { name: "bike", Icon: Bike },
  { name: "fuel", Icon: Fuel },
  { name: "baby", Icon: Baby },
  { name: "stethoscope", Icon: Stethoscope },
  { name: "palette", Icon: Palette },
  { name: "utensils-crossed", Icon: UtensilsCrossed },
  { name: "wine", Icon: Wine },
  { name: "pizza", Icon: Pizza },
  { name: "hammer", Icon: Hammer },
  { name: "key", Icon: Key },
  { name: "shield", Icon: Shield },
  { name: "umbrella", Icon: Umbrella },
  { name: "tent", Icon: Tent },
  { name: "map", Icon: Map },
  { name: "truck", Icon: Truck },
  { name: "leaf", Icon: Leaf },
  { name: "flame", Icon: Flame },
  { name: "gem", Icon: Gem },
  { name: "crown", Icon: Crown },
  { name: "badge-dollar-sign", Icon: BadgeDollarSign },
  { name: "hand-coins", Icon: HandCoins },
  { name: "receipt", Icon: Receipt },
  { name: "banknote", Icon: Banknote },
];

const COLOR_OPTIONS = [
  "#00e676", "#f44336", "#ff9800", "#2196f3", "#9c27b0",
  "#e91e63", "#00bcd4", "#8bc34a", "#ffc107", "#795548",
  "#607060", "#3f51b5", "#009688", "#ff5722", "#673ab7",
  "#cddc39", "#4caf50", "#03a9f4", "#ff4081", "#7c4dff",
  "#18ffff", "#69f0ae", "#ffab40", "#ea80fc",
];

// Find the Icon component by name
function getIconComponent(iconName: string) {
  return ICON_OPTIONS.find((i) => i.name === iconName)?.Icon || FileText;
}

export default function CategoryCreateModal({
  open, onClose, onSave,
  initialName = "", initialIcon = "file-text", initialColor = "#8b5cf6",
  title = "Nova Categoria",
  existingNames = [],
}: Props) {
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState(initialIcon);
  const [color, setColor] = useState(initialColor);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setIcon(initialIcon);
      setColor(initialColor);
      setShowDuplicateConfirm(false);
    }
  }, [open, initialName, initialIcon, initialColor]);

  const handleSave = () => {
    if (!name.trim()) return;
    const trimmed = name.trim();
    // Check for duplicate
    const isDuplicate = existingNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase() && n.toLowerCase() !== initialName.toLowerCase()
    );
    if (isDuplicate && !showDuplicateConfirm) {
      setShowDuplicateConfirm(true);
      return;
    }
    onSave({ name: trimmed, icon, color });
    setShowDuplicateConfirm(false);
  };

  if (!open) return null;

  const PreviewIcon = getIconComponent(icon);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[90%] max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border/30 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* Preview */}
            <div className="flex items-center justify-center py-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: `${color}20`,
                  border: `2px solid ${color}40`,
                  filter: `drop-shadow(0 0 10px ${color}80)`,
                }}
              >
                <PreviewIcon className="w-6 h-6" style={{ color }} />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</label>
              <Input
                placeholder="Ex: Streaming"
                value={name}
                onChange={(e) => { setName(e.target.value); setShowDuplicateConfirm(false); }}
                className="bg-muted/30 border-border/20 h-11 rounded-xl"
                maxLength={30}
                autoFocus
              />
            </div>

            {/* Duplicate warning */}
            <AnimatePresence>
              {showDuplicateConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-destructive/10 border border-destructive/20 p-3"
                >
                  <p className="text-xs text-destructive font-medium">
                    Já existe uma categoria com esse nome. Deseja substituir?
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowDuplicateConfirm(false)}
                      className="flex-1 h-8 rounded-lg text-[10px] font-bold border border-border/30 text-muted-foreground"
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSave({ name: name.trim(), icon, color });
                        setShowDuplicateConfirm(false);
                      }}
                      className="flex-1 h-8 rounded-lg text-[10px] font-bold bg-destructive/20 text-destructive border border-destructive/30"
                    >
                      Sim, substituir
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Icon */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ícone</label>
              <div className="grid grid-cols-8 gap-1.5 max-h-[200px] overflow-y-auto pr-1 scrollbar-none">
                {ICON_OPTIONS.map(({ name: iconName, Icon: IconComp }) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                      icon === iconName
                        ? "bg-primary/15 ring-2 ring-primary/40 scale-110"
                        : "bg-muted/20 hover:bg-muted/40"
                    )}
                    style={icon === iconName ? { filter: `drop-shadow(0 0 6px ${color}80)` } : undefined}
                  >
                    <IconComp
                      className="w-4 h-4"
                      style={{ color: icon === iconName ? color : "hsl(var(--muted-foreground))" }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cor</label>
              <div className="grid grid-cols-8 gap-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                      color === c ? "ring-2 ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"
                    )}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                  </button>
                ))}
                {/* Custom color picker */}
                <label
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 border-dashed",
                    !COLOR_OPTIONS.includes(color)
                      ? "ring-2 ring-offset-2 ring-offset-card scale-110 border-primary/40"
                      : "border-border/30 hover:scale-105 hover:border-border/50"
                  )}
                  style={!COLOR_OPTIONS.includes(color) ? { backgroundColor: color } : undefined}
                >
                  {!COLOR_OPTIONS.includes(color)
                    ? <Check className="w-4 h-4 text-white drop-shadow-md" />
                    : <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  }
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl text-xs font-bold border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!name.trim()}
                className={cn(
                  "flex-1 h-11 rounded-xl text-xs font-bold transition-all backdrop-blur-md",
                  name.trim()
                    ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]"
                    : "bg-muted/20 text-muted-foreground border border-border/10 cursor-not-allowed"
                )}
              >
                Salvar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export { ICON_OPTIONS, getIconComponent };
