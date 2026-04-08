import {
  Utensils, Car, Heart, Repeat, Gamepad2, Home, GraduationCap, Shirt,
  PawPrint, Scissors, Gift, Plane, Smartphone, Receipt,
  Briefcase, TrendingUp, ShoppingBag, DollarSign, Award, Users, Wallet,
  FileText, Landmark, ShoppingCart,
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

export function getDefaultCategoryIcon(name: string) {
  return DEFAULT_CATEGORY_ICONS[name] || FileText;
}
