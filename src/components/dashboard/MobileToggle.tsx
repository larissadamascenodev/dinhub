import { memo } from "react";

interface MobileToggleProps {
  activeTab: "transacoes" | "eventos";
  onTabChange: (tab: "transacoes" | "eventos") => void;
}

const MobileToggle = memo(({ activeTab, onTabChange }: MobileToggleProps) => (
  <div className="flex rounded-xl bg-secondary p-1 gap-1">
    <button
      onClick={() => onTabChange("transacoes")}
      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === "transacoes"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      Transações
    </button>
    <button
      onClick={() => onTabChange("eventos")}
      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === "eventos"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      Próximos Eventos
    </button>
  </div>
));

MobileToggle.displayName = "MobileToggle";
export default MobileToggle;
