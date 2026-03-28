import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";

const Configuracoes = () => {
  const navigate = useNavigate();

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar</span>
        </button>
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
    </div>
  );
};

export default Configuracoes;
