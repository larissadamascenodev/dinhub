import { memo } from "react";

interface Props {
  activeTab: "transacoes" | "eventos";
  onTabChange: (tab: "transacoes" | "eventos") => void;
}

const MobileToggle = memo(({ activeTab, onTabChange }: Props) => (
  <div className="fp-card p-1 flex gap-1">
    {(["transacoes", "eventos"] as const).map((tab) => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-250 ${
          activeTab === tab
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {tab === "transacoes" ? "Transações" : "Próximos Eventos"}
      </button>
    ))}
  </div>
));

MobileToggle.displayName = "MobileToggle";
export default MobileToggle;
