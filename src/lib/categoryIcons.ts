import {
  Utensils, Car, Heart, Repeat, Gamepad2, Home, GraduationCap, Shirt,
  PawPrint, Scissors, Gift, Plane, Smartphone, Receipt,
  Briefcase, TrendingUp, ShoppingBag, DollarSign, Award, Users, Wallet,
  FileText, Landmark, ShoppingCart, Zap, Droplets, Flame,
  CupSoda, Truck, Coffee, Dumbbell, Plug, Pizza,
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
  "Delivery": Truck,
  "Cafeteria": Coffee,
  "Academia": Dumbbell,
  "Energia": Plug,
  "Fast Food": Pizza,
  "Salário": DollarSign,
  "Freelance": Briefcase,
  "Investimentos": TrendingUp,
  "Vendas": ShoppingBag,
  "Aluguéis": Home,
  "Bônus": Award,
  "Comissão": Users,
  "Mesada": Wallet,
  "Saldo inicial": Landmark,
};

// HSL colors (without hsl() wrapper) — unique per category for chart differentiation
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  // Despesas
  "Alimentação":   "25 90% 55%",    // laranja
  "Transporte":    "210 70% 55%",   // azul
  "Saúde":         "350 70% 55%",   // vermelho rosado
  "Assinaturas":   "270 60% 58%",   // roxo
  "Lazer":         "45 85% 55%",    // amarelo dourado
  "Moradia":       "160 55% 45%",   // verde água
  "Educação":      "190 75% 50%",   // azul claro / ciano
  "Vestuário":     "300 55% 55%",   // magenta / rosa
  "Pets":          "30 75% 50%",    // marrom alaranjado
  "Beleza":        "330 65% 60%",   // rosa claro
  "Presentes":     "340 70% 55%",   // rosa intenso
  "Viagem":        "200 80% 55%",   // azul céu
  "Tecnologia":    "230 65% 58%",   // azul índigo
  "Impostos":      "0 60% 48%",     // vermelho escuro
  "Supermercado":  "150 70% 45%",   // verde
  "Conta de Luz":  "55 80% 50%",    // amarelo
  "Conta de Água": "195 80% 50%",   // azul água
  "Conta de Gás":  "15 80% 50%",    // laranja avermelhado
  "Bebidas":       "320 55% 55%",   // rosa/magenta
  "Delivery":      "170 60% 45%",   // verde azulado
  "Cafeteria":     "28 65% 45%",    // marrom café
  "Academia":      "260 55% 55%",   // roxo fitness
  "Energia":       "48 85% 50%",    // amarelo elétrico
  "Fast Food":     "10 75% 52%",    // vermelho tomate
  // Receitas
  "Salário":       "150 100% 45%",  // verde neon (primary)
  "Freelance":     "175 65% 45%",   // teal
  "Investimentos": "140 70% 50%",   // verde esmeralda
  "Vendas":        "120 55% 48%",   // verde oliva
  "Aluguéis":      "40 75% 50%",    // âmbar
  "Bônus":         "60 70% 50%",    // amarelo lime
  "Comissão":      "180 60% 48%",   // ciano escuro
  "Mesada":        "100 55% 50%",   // verde lima
};

export function getDefaultCategoryIcon(name: string) {
  return DEFAULT_CATEGORY_ICONS[name] || FileText;
}

export function getDefaultCategoryColor(name: string): string {
  return DEFAULT_CATEGORY_COLORS[name] || "220 10% 55%";
}
