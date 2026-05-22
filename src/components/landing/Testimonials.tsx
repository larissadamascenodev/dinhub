import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Mariana Silva",
    role: "Designer, SP",
    text: "Descobri que gastava R$340/mês em delivery sem perceber. Em 2 meses cortei pela metade.",
    image: "https://i.pravatar.cc/150?u=marianas"
  },
  {
    name: "Rafael Almeida",
    role: "Autônomo, BH",
    text: "A Huby me mostrou R$1.200 em assinaturas esquecidas. Hoje sei onde cada real vai.",
    image: "https://i.pravatar.cc/150?u=rafaela"
  },
  {
    name: "Camila Ferreira",
    role: "Enfermeira, Recife",
    text: "A Huby me avisou que ia estourar o limite 5 dias antes. Em 6 meses montei R$6 mil de reserva.",
    image: "https://i.pravatar.cc/150?u=camilaf"
  },
  {
    name: "Lucas Mendonça",
    role: "Engenheiro, Curitiba",
    text: "Em 3 meses percebi que gastava R$580 em coisas que nem lembrava.",
    image: "https://i.pravatar.cc/150?u=lucasm"
  },
  {
    name: "Fernanda Costa",
    role: "Professora, Salvador",
    text: "Meu score subiu de 61 para 84 em 4 meses.",
    image: "https://i.pravatar.cc/150?u=fernandac"
  },
  {
    name: "Bruno Tavares",
    role: "Médico, Porto Alegre",
    text: "O radar identificou R$2.300 em gastos desnecessários no primeiro mês.",
    image: "https://i.pravatar.cc/150?u=brunot"
  }
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % (testimonials.length));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-padding px-4 sm:px-6 bg-[#0a0a0a]">
      <div className="fluid-container">
        <div className="text-center mb-16 md:mb-24 lg:mb-32 space-y-6 md:space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md"
          >
            <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] text-[#00e676] uppercase">Depoimentos</span>
          </motion.div>
          
          <h2 className="display-title text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl">
            O que acontece quando você finalmente vê<br className="hidden lg:block" /> para onde vai o seu dinheiro.
          </h2>
          <div className="pt-6 sm:pt-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#111] border border-white/5 text-white/40 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                4.9 ★ — mais de 2.800 usuários satisfeitos
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden h-[380px] sm:h-[400px] flex items-center justify-center">
            <div 
                className="flex gap-4 sm:gap-6 transition-all duration-700 ease-in-out" 
                style={{ 
                    transform: `translateX(calc(-${index * 100}% - ${index * (window.innerWidth < 640 ? 16 : 24)}px))` 
                }}
            >
                {testimonials.map((t, i) => (
                    <div 
                        key={i} 
                        className={`shrink-0 w-[calc(100vw-32px)] sm:w-[350px] md:w-[400px] p-6 sm:p-8 glass-card transition-all duration-500 border-white/5 ${
                            index === i ? 'border-[#00e676]/30 scale-100 opacity-100 shadow-[0_0_50px_rgba(0,230,118,0.1)]' : 'scale-90 opacity-20'
                        }`}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <img src={t.image} alt={t.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-white/10" />
                            <div>
                                <h4 className="text-white font-bold text-sm sm:text-base">{t.name}</h4>
                                <p className="text-white/20 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{t.role}</p>
                            </div>
                        </div>
                        <p className="text-white/50 leading-relaxed italic text-sm sm:text-base">"{t.text}"</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-12">
            {testimonials.map((_, i) => (
                <button 
                    key={i} 
                    onClick={() => setIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`touch-target transition-all duration-500 group`} 
                >
                    <div className={`h-1 rounded-full transition-all duration-500 ${index === i ? 'bg-[#00e676] w-8' : 'bg-white/10 w-4 group-hover:bg-white/20'}`} />
                </button>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
