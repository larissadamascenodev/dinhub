import { memo, useMemo } from "react";
import { Bell, Flame } from "lucide-react";

const DashboardHeader = memo(() => {
  const { greeting, dateStr } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    let g = "Bom dia";
    if (hour >= 12 && hour < 18) g = "Boa tarde";
    else if (hour >= 18) g = "Boa noite";

    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const d = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
    return { greeting: g, dateStr: d };
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          {greeting}, <span className="text-primary">Olá</span>
        </h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-medium">
          <Flame className="h-4 w-4" />
          <span>0</span>
        </div>
        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-bold">
          U
        </div>
      </div>
    </div>
  );
});

DashboardHeader.displayName = "DashboardHeader";
export default DashboardHeader;
