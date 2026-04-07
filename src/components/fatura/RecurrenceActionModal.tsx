import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, Calendar, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

export type RecurrenceScope = "current" | "current_and_future";

interface Props {
  open: boolean;
  action: "edit" | "delete";
  itemName: string;
  onSelect: (scope: RecurrenceScope) => void;
  onClose: () => void;
}

export default function RecurrenceActionModal({ open, action, itemName, onSelect, onClose }: Props) {
  if (!open) return null;

  const isDelete = action === "delete";
  const Icon = isDelete ? Trash2 : Pencil;
  const title = isDelete ? "Excluir assinatura" : "Editar assinatura";
  const iconBg = isDelete ? "bg-destructive/15 border-destructive/20" : "bg-primary/15 border-primary/20";
  const iconColor = isDelete ? "text-destructive" : "text-primary";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl bg-card border border-border/20 shadow-2xl p-5 space-y-4"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center", iconBg)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Como deseja {isDelete ? "excluir" : "editar"}{" "}
                <span className="font-bold text-foreground">"{itemName}"</span>?
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <button
              onClick={() => onSelect("current")}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border/20 bg-muted/10 hover:bg-muted/20 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Apenas este mês</p>
                <p className="text-[10px] text-muted-foreground">
                  {isDelete ? "Remove somente da fatura atual" : "Altera somente na fatura atual"}
                </p>
              </div>
            </button>

            <button
              onClick={() => onSelect("current_and_future")}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-colors text-left",
                isDelete
                  ? "border-destructive/20 bg-destructive/5 hover:bg-destructive/10"
                  : "border-primary/20 bg-primary/5 hover:bg-primary/10"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                isDelete ? "bg-destructive/15" : "bg-primary/15"
              )}>
                <CalendarRange className={cn("w-4 h-4", isDelete ? "text-destructive" : "text-primary")} />
              </div>
              <div>
                <p className={cn("text-xs font-bold", isDelete ? "text-destructive" : "text-primary")}>
                  Este e todos os futuros
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isDelete ? "Remove deste mês em diante" : "Altera deste mês em diante"}
                </p>
              </div>
            </button>
          </div>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl text-xs font-bold border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
