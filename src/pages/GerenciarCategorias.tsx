import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import CategoryCreateModal, { getIconComponent } from "@/components/dashboard/CategoryCreateModal";
import { getDefaultCategoryIcon, DEFAULT_CATEGORY_ICONS } from "@/lib/categoryIcons";
import {
  getCustomCategories,
  createCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  hideDefaultCategory,
  unhideDefaultCategory,
  type CustomCategory,
} from "@/services/categoryService";

const DEFAULT_CATEGORY_MAP: Record<string, { type: "despesa" | "receita"; color: string }> = {
  "Alimentação": { type: "despesa", color: "#f97316" },
  "Transporte": { type: "despesa", color: "#3b82f6" },
  "Saúde": { type: "despesa", color: "#ef4444" },
  "Assinaturas": { type: "despesa", color: "#8b5cf6" },
  "Lazer": { type: "despesa", color: "#ec4899" },
  "Moradia": { type: "despesa", color: "#6366f1" },
  "Educação": { type: "despesa", color: "#14b8a6" },
  "Vestuário": { type: "despesa", color: "#f59e0b" },
  "Pets": { type: "despesa", color: "#a855f7" },
  "Beleza": { type: "despesa", color: "#d946ef" },
  "Presentes": { type: "despesa", color: "#f43f5e" },
  "Viagem": { type: "despesa", color: "#06b6d4" },
  "Tecnologia": { type: "despesa", color: "#64748b" },
  "Impostos": { type: "despesa", color: "#78716c" },
  "Supermercado": { type: "despesa", color: "#22c55e" },
  "Salário": { type: "receita", color: "#22c55e" },
  "Freelance": { type: "receita", color: "#3b82f6" },
  "Investimentos": { type: "receita", color: "#14b8a6" },
  "Vendas": { type: "receita", color: "#f97316" },
  "Aluguéis": { type: "receita", color: "#6366f1" },
  "Bônus": { type: "receita", color: "#eab308" },
  "Comissão": { type: "receita", color: "#8b5cf6" },
  "Mesada": { type: "receita", color: "#ec4899" },
};

interface UnifiedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
  customId?: string;
}

export default function GerenciarCategorias() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"despesa" | "receita">("despesa");
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCat, setEditingCat] = useState<UnifiedCategory | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const cats = await getCustomCategories();
      setCustomCats(cats);
    } catch {
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Build unified list
  const hiddenDefaults = customCats.filter((c) => c.type === tab && c.is_hidden_default).map((c) => c.name);
  const customOnly = customCats.filter((c) => c.type === tab && !c.is_hidden_default);

  const unifiedCategories: UnifiedCategory[] = [];

  // Add visible defaults
  Object.entries(DEFAULT_CATEGORY_MAP)
    .filter(([, v]) => v.type === tab)
    .filter(([name]) => !hiddenDefaults.includes(name))
    .forEach(([name, meta]) => {
      unifiedCategories.push({
        id: `default-${name}`,
        name,
        icon: "",
        color: meta.color,
        type: tab,
        isDefault: true,
      });
    });

  // Add custom categories
  customOnly.forEach((cat) => {
    unifiedCategories.push({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      isDefault: false,
      customId: cat.id,
    });
  });

  // Sort alphabetically
  unifiedCategories.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const allNames = unifiedCategories.map((c) => c.name);

  const handleCreate = async (data: { name: string; icon: string; color: string }) => {
    if (!user) return;
    try {
      await createCustomCategory(user.id, { ...data, type: tab });
      toast.success("Categoria criada!");
      setShowCreateModal(false);
      fetchCategories();
    } catch {
      toast.error("Erro ao criar categoria");
    }
  };

  const handleUpdate = async (data: { name: string; icon: string; color: string }) => {
    if (!editingCat) return;
    try {
      if (editingCat.isDefault) {
        // Hide default and create custom replacement
        await hideDefaultCategory(user!.id, editingCat.name, tab);
        await createCustomCategory(user!.id, { ...data, type: tab });
      } else {
        await updateCustomCategory(editingCat.customId!, data);
      }
      toast.success("Categoria atualizada!");
      setEditingCat(null);
      fetchCategories();
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (cat: UnifiedCategory) => {
    try {
      if (cat.isDefault) {
        await hideDefaultCategory(user!.id, cat.name, tab);
      } else {
        await deleteCustomCategory(cat.customId!);
      }
      toast.success("Categoria removida");
      fetchCategories();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Gerenciar Categorias</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 p-1 rounded-xl bg-muted/20 border border-border/10">
          {(["despesa", "receita"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all",
                tab === t
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "despesa" ? "Despesas" : "Receitas"}
            </button>
          ))}
        </div>
      </div>

      {/* Unified categories list */}
      <div className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Categorias
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:opacity-80"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <span className="text-xs text-muted-foreground animate-pulse">Carregando...</span>
          </div>
        ) : unifiedCategories.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-border/20 bg-muted/5">
            <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma categoria</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs text-primary font-semibold mt-2 hover:opacity-80"
            >
              Criar primeira
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence>
              {unifiedCategories.map((cat) => {
                const isDefault = cat.isDefault;
                const IconComp = isDefault
                  ? getDefaultCategoryIcon(cat.name)
                  : getIconComponent(cat.icon);

                return (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card/60 border border-border/10"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}20`,
                        border: `1px solid ${cat.color}30`,
                        filter: `drop-shadow(0 0 6px ${cat.color}60)`,
                      }}
                    >
                      <IconComp className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-foreground truncate">{cat.name}</span>
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <button
                      onClick={() => setEditingCat(cat)}
                      className="w-7 h-7 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive/60 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CategoryCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        title="Nova Categoria"
        existingNames={allNames}
      />

      {/* Edit Modal */}
      <CategoryCreateModal
        open={!!editingCat}
        onClose={() => setEditingCat(null)}
        onSave={handleUpdate}
        initialName={editingCat?.name ?? ""}
        initialIcon={editingCat?.icon || "file-text"}
        initialColor={editingCat?.color ?? "#8b5cf6"}
        title="Editar Categoria"
        existingNames={allNames.filter((n) => n !== editingCat?.name)}
      />
    </div>
  );
}
