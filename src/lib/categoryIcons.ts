import {
  Utensils, Car, Heart, Repeat, Gamepad2, Home, GraduationCap, Shirt,
  PawPrint, Scissors, Gift, Plane, Smartphone, Receipt,
  Briefcase, TrendingUp, ShoppingBag, DollarSign, Award, Users, Wallet,
  FileText, Landmark, ShoppingCart, Zap, Droplets, Flame,
  CupSoda, Bike, Coffee, Dumbbell, Plug, Pizza, Building2,
} from "lucide-react";

export const DEFAULT_CATEGORY_ICONS: Record<string, any> = {
  "Alimentação": Utensils,
  "Transporte": Car,
  "Saúde": Heart,
  "Assinaturas": Repeat,
  "Lazer": Gamepad2,
  "Moradia": Home,
  "Educação": GraduationCap,
  "Vestuário": Shirt,
  "Pets": PawPrint,
  "Beleza": Scissors,
  "Presentes": Gift,
  "Viagem": Plane,
  "Tecnologia": Smartphone,
  "Impostos": Receipt,
  "Supermercado": ShoppingCart,
  "Conta de Luz": Zap,
  "Conta de Água": Droplets,
  "Conta de Gás": Flame,
  "Bebidas": CupSoda,
  "Delivery": Bike,
  "Cafeteria": Coffee,
  "Academia": Dumbbell,
  "Energia": Plug,
  "Fast Food": Pizza,
  "Salário": DollarSign,
  "Freelance": Briefcase,
  "Investimentos": TrendingUp,
  "Vendas": ShoppingBag,
  "Aluguéis": Building2,
  "Bônus": Award,
  "Comissão": Users,
  "Mesada": Wallet,
  "Saldo inicial": Landmark,
};

// HSL colors (without hsl() wrapper) — unique per category for chart differentiation
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  // Despesas
  "Alimentação":   "25 90% 55%",
  "Transporte":    "210 70% 55%",
  "Saúde":         "350 70% 55%",
  "Assinaturas":   "270 60% 58%",
  "Lazer":         "45 85% 55%",
  "Moradia":       "160 55% 45%",
  "Educação":      "190 75% 50%",
  "Vestuário":     "300 55% 55%",
  "Pets":          "30 75% 50%",
  "Beleza":        "330 65% 60%",
  "Presentes":     "340 70% 55%",
  "Viagem":        "200 80% 55%",
  "Tecnologia":    "230 65% 58%",
  "Impostos":      "0 60% 48%",
  "Supermercado":  "150 70% 45%",
  "Conta de Luz":  "55 80% 50%",
  "Conta de Água": "195 80% 50%",
  "Conta de Gás":  "15 80% 50%",
  "Bebidas":       "320 55% 55%",
  "Delivery":      "170 60% 45%",
  "Cafeteria":     "28 65% 45%",
  "Academia":      "260 55% 55%",
  "Fast Food":     "10 75% 52%",
  // Receitas
  "Salário":       "150 100% 45%",
  "Freelance":     "175 65% 45%",
  "Investimentos": "140 70% 50%",
  "Vendas":        "120 55% 48%",
  "Aluguéis":      "40 75% 50%",
  "Bônus":         "60 70% 50%",
  "Comissão":      "180 60% 48%",
  "Mesada":        "100 55% 50%",
};

// Hex colors — authoritative source for components that need hex values
export const DEFAULT_CATEGORY_HEX: Record<string, string> = {
  // Despesas
  "Alimentação":   "#f97316",
  "Transporte":    "#3b82f6",
  "Saúde":         "#ef4444",
  "Assinaturas":   "#8b5cf6",
  "Lazer":         "#ec4899",
  "Moradia":       "#6366f1",
  "Educação":      "#14b8a6",
  "Vestuário":     "#f59e0b",
  "Pets":          "#a855f7",
  "Beleza":        "#d946ef",
  "Presentes":     "#f43f5e",
  "Viagem":        "#06b6d4",
  "Tecnologia":    "#64748b",
  "Impostos":      "#78716c",
  "Supermercado":  "#22c55e",
  "Conta de Luz":  "#eab308",
  "Conta de Água": "#0ea5e9",
  "Conta de Gás":  "#ea580c",
  "Bebidas":       "#c026d3",
  "Delivery":      "#0d9488",
  "Cafeteria":     "#92400e",
  "Academia":      "#7c3aed",
  "Fast Food":     "#dc2626",
  // Receitas
  "Salário":       "#00e676",
  "Freelance":     "#0891b2",
  "Investimentos": "#10b981",
  "Vendas":        "#e17055",
  "Aluguéis":      "#6d28d9",
  "Bônus":         "#84cc16",
  "Comissão":      "#0e7490",
  "Mesada":        "#65a30d",
};

// Type mapping — authoritative source
export const DEFAULT_CATEGORY_TYPE: Record<string, "despesa" | "receita"> = {
  "Alimentação": "despesa", "Transporte": "despesa", "Saúde": "despesa",
  "Assinaturas": "despesa", "Lazer": "despesa", "Moradia": "despesa",
  "Educação": "despesa", "Vestuário": "despesa", "Pets": "despesa",
  "Beleza": "despesa", "Presentes": "despesa", "Viagem": "despesa",
  "Tecnologia": "despesa", "Impostos": "despesa", "Supermercado": "despesa",
  "Conta de Luz": "despesa", "Conta de Água": "despesa", "Conta de Gás": "despesa",
  "Bebidas": "despesa", "Delivery": "despesa", "Cafeteria": "despesa",
  "Academia": "despesa", "Fast Food": "despesa",
  "Salário": "receita", "Freelance": "receita", "Investimentos": "receita",
  "Vendas": "receita", "Aluguéis": "receita", "Bônus": "receita",
  "Comissão": "receita", "Mesada": "receita",
};

export function getDefaultCategoryColor(name: string): string {
  return DEFAULT_CATEGORY_COLORS[name] || "220 10% 55%";
}

export function getDefaultCategoryHex(name: string): string {
  return DEFAULT_CATEGORY_HEX[name] || "#64748b";
}
