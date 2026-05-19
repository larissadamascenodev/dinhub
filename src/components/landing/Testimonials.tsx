import React from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Section, H2, Card, Reveal, NEON } from "./shared";

type T = { name: string; role: string; city: string; photo: string; text: string };

const data: T[] = [
  { name: "Mariana Silva", role: "Designer", city: "São Paulo, SP", photo: "https://randomuser.me/api/portraits/women/12.jpg", text: "Descobri que gastava R$ 340/mês em delivery sem perceber. Em 2 meses cortei pela metade e finalmente comecei a guardar para a viagem que adiava há anos." },
  { name: "Rafael Almeida", role: "Autônomo", city: "Belo Horizonte, MG", photo: "https://randomuser.me/api/portraits/men/32.jpg", text: "Eu vivia no vermelho no fim do mês e nunca entendia o porquê. O DinHub me mostrou R$ 1.200 em assinaturas esquecidas. Hoje sei exatamente onde cada real entra e sai." },
  { name: "Camila Ferreira", role: "Enfermeira", city: "Recife, PE", photo: "https://randomuser.me/api/portraits/women/45.jpg", text: "A Huby me avisou que ia estourar o limite 5 dias antes. Reorganizei tudo e não paguei juros. Em 6 meses montei minha reserva de emergência de R$ 6 mil." },
  { name: "Lucas Mendonça", role: "Engenheiro", city: "Curitiba, PR", photo: "https://randomuser.me/api/portraits/men/52.jpg", text: "Em 3 meses percebi que gastava R$ 580 por mês em coisas que nem lembrava. Hoje tenho meta de juntar R$ 20 mil até o fim do ano e estou no caminho." },
  { name: "Fernanda Costa", role: "Professora", city: "Salvador, BA", photo: "https://randomuser.me/api/portraits/women/68.jpg", text: "Sempre tive medo de ver minha situação financeira. O DinHub tornou isso simples e motivador. Meu score subiu de 61 para 84 em 4 meses." },
  { name: "Bruno Tavares", role: "Médico", city: "Porto Alegre, RS", photo: "https://randomuser.me/api/portraits/men/74.jpg", text: "Mesmo ganhando bem eu não sabia para onde ia o dinheiro. O radar da Huby identificou R$ 2.300 em gastos desnecessários no primeiro mês." },
];

export const Testimonials: React.FC = () => {
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [visible, setVisible] = React.useState(3);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(3);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % data.length), 4000);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => setIdx((i) => (i - 1 + data.length) % data.length);
  const next = () => setIdx((i) => (i + 1) % data.length);

  return (
    <Section>
      <Reveal>
        <H2 className="text-center max-w-[820px] mx-auto">Quem começou não quer mais parar.</H2>
      </Reveal>

      <div className="mt-12 relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${(idx * 100) / visible}%)` }}
          >
            {data.map((t, i) => {
              const isCenter = (i - idx + data.length) % data.length === Math.floor(visible / 2);
              return (
                <div key={i} className="shrink-0 px-3" style={{ width: `${100 / visible}%` }}>
                  <Card
                    className="p-6 h-full transition-all"
                    style={{
                      transform: isCenter && visible > 1 ? "scale(1.03)" : "scale(1)",
                      borderColor: isCenter && visible > 1 ? `${NEON}55` : "#1a1a1a",
                      boxShadow: isCenter && visible > 1 ? `0 0 30px ${NEON}22` : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={t.photo} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
                      <div>
                        <p className="text-white font-bold text-sm">{t.name}</p>
                        <p className="text-white/50 text-xs">{t.role} — {t.city}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mt-3">
                      {[1, 2, 3, 4, 5].map((s) => (<Star key={s} size={14} style={{ color: NEON }} fill={NEON} />))}
                    </div>
                    <p className="text-white/80 text-sm mt-4 leading-relaxed">"{t.text}"</p>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={prev} aria-label="Anterior" className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 h-11 w-11 rounded-full items-center justify-center" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} aria-label="Próximo" className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 h-11 w-11 rounded-full items-center justify-center" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
          <ChevronRight size={20} />
        </button>

        <div className="flex justify-center gap-2 mt-8">
          {data.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className="h-2 rounded-full transition-all" style={{ width: i === idx ? "24px" : "8px", background: i === idx ? NEON : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
      </div>

      <Reveal delay={0.2}>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: "rgba(0,230,118,0.08)", border: `1px solid ${NEON}33` }}>
            <Star size={14} style={{ color: NEON }} fill={NEON} />
            <span className="text-white font-bold text-sm">4.9</span>
            <span className="text-white/70 text-sm">— mais de 2.800 usuários satisfeitos</span>
          </div>
        </div>
      </Reveal>
    </Section>
  );
};
