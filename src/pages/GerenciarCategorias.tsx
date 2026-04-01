import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, Pencil, Trash2, ArrowLeft,
  Utensils, Car, Heart, Repeat, Gamepad2, Home, GraduationCap, Shirt,
  PawPrint, Scissors, Gift, Plane, Smartphone, Receipt,
  Briefcase, TrendingUp, ShoppingBag, DollarSign, Award, Users, Wallet, PiggyBank,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import CategoryCreateModal, { getIconComponent } from "@/components/dashboard/CategoryCreateModal";
import {
  getCustomCategories,
  createCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  hideDefaultCategory,
  type CustomCategory,
} from "@/services/categoryService";

const DEFAULT_CATEGORY_MAP: Record<string, { icon: any; type: "despesa" | "receita" }> = {
  "Alimentação": { icon: Utensils, type: "despesa" },
  "Transporte": { icon: Car, type: "despesa" },
  "Saúde": { icon: Heart, type: "despesa" },
  "Assinaturas": { icon: Repeat, type: "despesa" },
  "Lazer": { icon: Gamepad2, type: "despesa" },
  "Moradia": { icon: Home, type: "despesa" },
  "Educação": { icon: GraduationCap, type: "despesa" },
  "Vestuário": { icon: Shirt, type: "despesa" },
  "Pets": { icon: PawPrint, type: "despesa" },
  "Beleza": { icon: Scissors, type: "despesa" },
  "Presentes": { icon: Gift, type: "despesa" },
  "Viagem": { icon: Plane, type: "despesa" },
  "Tecnologia": { icon: Smartphone, type: "despesa" },
  "Impostos": { icon: Receipt, type: "despesa" },
  "Salário": { icon: DollarSign, type: "receita" },
  "Freelance": { icon: Briefcase, type: "receita" },
  "Investimentos": { icon: TrendingUp, type: "receita" },
  "Vendas": { icon: ShoppingBag, type: "receita" },
  "Aluguéis": { icon: Home, type: "receita" },
  "Bônus": { icon: Award, type: "receita" },
  "Comissão": { icon: Users, type: "receita" },
  "Mesada": { icon: Wallet, type: "receita" },
};

const DEFAULT_EXPENSE = Object.entries(DEFAULT_CATEGORY_MAP).filter(([, v]) => v.type === "despesa").map(([k]) => k);
const DEFAULT_INCOME = Object.entries(DEFAULT_CATEGORY_MAP).filter(([, v]) => v.type === "receita").map(([k]) => k);

export default function GerenciarCategorias() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"despesa" | "receita">("despesa");
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CustomCategory | null>(null);

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

  const filteredCustom = customCats.filter((c) => c.type === tab && !c.is_hidden_default);
  const hiddenDefaults = customCats.filter((c) => c.type === tab && c.is_hidden_default).map((c) => c.name);
  const defaults = (tab === "despesa" ? DEFAULT_EXPENSE : DEFAULT_INCOME).filter((d) => !hiddenDefaults.includes(d));
  const [editingDefault, setEditingDefault] = useState<string | null>(null);

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
      await updateCustomCategory(editingCat.id, data);
      toast.success("Categoria atualizada!");
      setEditingCat(null);
      fetchCategories();
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (cat: CustomCategory) => {
    try {
      await deleteCustomCategory(cat.id);
      toast.success("Categoria removida");
      fetchCategories();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleDeleteDefault = async (name: string) => {
    if (!user) return;
    try {
      await hideDefaultCategory(user.id, name, tab);
      toast.success("Categoria removida");
      fetchCategories();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleEditDefault = (name: string) => {
    setEditingDefault(name);
  };

  const handleSaveEditedDefault = async (data: { name: string; icon: string; color: string }) => {
    if (!user || !editingDefault) return;
    try {
      // Hide the default and create a custom one
      await hideDefaultCategory(user.id, editingDefault, tab);
      await createCustomCategory(user.id, { ...data, type: tab });
      toast.success("Categoria atualizada!");
      setEditingDefault(null);
      fetchCategories();
    } catch {
      toast.error("Erro ao editar categoria");
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

      {/* Custom categories */}
      <div className="px-4 space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Minhas categorias
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
        ) : filteredCustom.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-border/20 bg-muted/5">
            <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma categoria personalizada</p>
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
              {filteredCustom.map((cat) => (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card/60 border border-border/10"
                >
                  {(() => {
                    const CatIcon = getIconComponent(cat.icon);
                    return (
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${cat.color}20`,
                          border: `1px solid ${cat.color}30`,
                          filter: `drop-shadow(0 0 6px ${cat.color}60)`,
                        }}
                      >
                        <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                    );
                  })()}
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
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Default categories */}
      <div className="px-4 space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Categorias padrão
        </p>
        <div className="space-y-1">
          <AnimatePresence>
            {defaults.map((cat) => (
              <motion.div
                key={cat}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/5"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20"
                  style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.3))" }}
                >
                  {(() => {
                    const IconComp = DEFAULT_CATEGORY_MAP[cat]?.icon || Tag;
                    return <IconComp className="w-4 h-4 text-primary" />;
                  })()}
                </div>
                <span className="flex-1 text-sm text-muted-foreground">{cat}</span>
                <button
                  onClick={() => handleEditDefault(cat)}
                  className="w-7 h-7 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteDefault(cat)}
                  className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive/60 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Modal */}
      <CategoryCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        title="Nova Categoria"
      />

      {/* Edit Modal */}
      <CategoryCreateModal
        open={!!editingCat}
        onClose={() => setEditingCat(null)}
        onSave={handleUpdate}
        initialName={editingCat?.name ?? ""}
        initialIcon={editingCat?.icon ?? "file-text"}
        initialColor={editingCat?.color ?? "#8b5cf6"}
        title="Editar Categoria"
      />

      {/* Edit Default Modal */}
      <CategoryCreateModal
        open={!!editingDefault}
        onClose={() => setEditingDefault(null)}
        onSave={handleSaveEditedDefault}
        initialName={editingDefault ?? ""}
        initialIcon="📋"
        initialColor="#8b5cf6"
        title="Editar Categoria Padrão"
      />
    </div>
  );
}
