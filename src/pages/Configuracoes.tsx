import { Settings } from "lucide-react";

const Configuracoes = () => {
  return (
    <div className="pt-2 pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-display text-xl font-bold">Configurações</h1>
      </div>
      <div className="rounded-2xl border border-border/20 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-sm">Em breve — esta página está em construção.</p>
      </div>
    </div>
  );
};

export default Configuracoes;
