import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Plus } from "lucide-react";
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
}

const ICON_OPTIONS = [
  "🛒", "🍔", "🚗", "💊", "🏠", "📚", "👔", "🐾",
  "💇", "🎮", "🎁", "✈️", "📱", "💰", "💼", "🎵",
  "☕", "🏋️", "🎬", "📋", "🔧", "🛍️", "💡", "🎯",
];

const COLOR_OPTIONS = [
  "#00e676", "#f44336", "#ff9800", "#2196f3", "#9c27b0",
  "#e91e63", "#00bcd4", "#8bc34a", "#ffc107", "#795548",
  "#607060", "#3f51b5", "#009688", "#ff5722", "#673ab7",
  "#cddc39",
];

export default function CategoryCreateModal({
  open, onClose, onSave,
  initialName = "", initialIcon = "📋", initialColor = "#8b5cf6",
  title = "Nova Categoria",
}: Props) {
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState(initialIcon);
  const [color, setColor] = useState(initialColor);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[90%] max-w-sm rounded-2xl bg-card border border-border/30 shadow-2xl overflow-hidden"
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
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                style={{
                  backgroundColor: `${color}20`,
                  border: `2px solid ${color}40`,
                  filter: `drop-shadow(0 0 10px ${color}80)`,
                }}
              >
                <span style={{ filter: "saturate(1.4) brightness(1.3)" }}>{icon}</span>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</label>
              <Input
                placeholder="Ex: Streaming"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-muted/30 border-border/20 h-11 rounded-xl"
                maxLength={30}
                autoFocus
              />
            </div>

            {/* Icon */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ícone</label>
              <div className="grid grid-cols-8 gap-1.5">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all",
                      icon === ic
                        ? "bg-primary/15 ring-2 ring-primary/40 scale-110"
                        : "bg-muted/20 hover:bg-muted/40"
                    )}
                    style={{
                      filter: icon === ic ? "drop-shadow(0 0 6px hsl(var(--primary)))" : "drop-shadow(0 0 3px rgba(255,255,255,0.15))",
                    }}
                  >
                    <span style={{ filter: "saturate(1.3) brightness(1.2)" }}>{ic}</span>
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
                  "flex-1 h-11 rounded-xl text-xs font-bold transition-all",
                  name.trim()
                    ? "bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25"
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
