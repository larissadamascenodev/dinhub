import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, MoreVertical, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import CategoryCreateModal, { getIconComponent } from "@/components/dashboard/CategoryCreateModal";
import { getDefaultCategoryIcon, DEFAULT_CATEGORY_HEX, DEFAULT_CATEGORY_TYPE } from "@/lib/categoryIcons";
import {
  getCustomCategories,
  createCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  hideDefaultCategory,
  type CustomCategory,
} from "@/services/categoryService";

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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<UnifiedCategory | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpenId]);

  // Build unified list (deduplicated)
  const hiddenDefaults = new Set(
    customCats
      .filter((c) => c.type === tab && c.is_hidden_default)
      .map((c) => c.name.trim().toLocaleLowerCase("pt-BR"))
  );

  const defaultCategories: UnifiedCategory[] = Object.entries(DEFAULT_CATEGORY_TYPE)
    .filter(([, type]) => type === tab)
    .filter(([name]) => !hiddenDefaults.has(name.trim().toLocaleLowerCase("pt-BR")))
    .map(([name]) => ({
      id: `default-${name}`,
      name,
      icon: "",
      color: DEFAULT_CATEGORY_HEX[name] || "#64748b",
      type: tab,
      isDefault: true,
    }));

  const customCategoriesList = customCats
    .filter((c) => c.type === tab && !c.is_hidden_default)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      isDefault: false,
      customId: cat.id,
    }));

  const unifiedCategories = Array.from(
    [...defaultCategories, ...customCategoriesList].reduce((map, category) => {
      const key = category.name.trim().toLocaleLowerCase("pt-BR");
      const existing = map.get(key);
      if (!existing || (!category.isDefault && existing.isDefault)) {
        map.set(key, category);
      }
      return map;
    }, new Map<string, UnifiedCategory>()).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

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
      setConfirmDeleteCat(null);
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

      {/* Category list */}
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
                const IconComp = cat.isDefault
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
                      }}
                    >
                      <IconComp className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-foreground truncate">{cat.name}</span>
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />

                    {/* 3-dot menu */}
                    <div className="relative" ref={menuOpenId === cat.id ? menuRef : undefined}>
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === cat.id ? null : cat.id)}
                        className="w-7 h-7 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      <AnimatePresence>
                        {menuOpenId === cat.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-9 z-50 w-36 rounded-xl bg-card border border-border/30 shadow-xl overflow-hidden"
                          >
                            <button
                              onClick={() => { setMenuOpenId(null); setEditingCat(cat); }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-foreground hover:bg-muted/30 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                              Editar
                            </button>
                            <button
                              onClick={() => { setMenuOpenId(null); setConfirmDeleteCat(cat); }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Excluir
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDeleteCat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            onClick={() => setConfirmDeleteCat(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-2xl bg-card border border-border/20 p-5 space-y-4"
            >
              <p className="text-sm font-bold text-foreground text-center">
                Excluir "{confirmDeleteCat.name}"?
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Essa ação não pode ser desfeita.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDeleteCat(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteCat)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
