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
    <section className="py-32 px-5 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#00e676] uppercase">Depoimentos</span>
          <h2 className="font-sora font-extrabold text-white text-4xl md:text-5xl">
            O que acontece quando você finalmente vê para onde vai o seu dinheiro.
          </h2>
          <div className="pt-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#111] border border-[#1a1a1a] text-[#a0a0a0] text-xs font-medium">
                4.9 ★ — mais de 2.800 usuários satisfeitos
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden h-[400px] flex items-center justify-center">
            <div className="flex gap-6 transition-all duration-700 ease-in-out" style={{ transform: `translateX(calc(-${index * (100 / (window.innerWidth < 768 ? 1 : 3))}%))` }}>
                {testimonials.map((t, i) => (
                    <div 
                        key={i} 
                        className={`shrink-0 w-full md:w-[calc(33.333%-16px)] p-8 bg-[#0f0f0f] border rounded-[24px] transition-all duration-500 ${
                            index === i ? 'border-[#00e676] scale-105 shadow-[0_0_30px_rgba(0,230,118,0.1)]' : 'border-[#1a1a1a] scale-100 opacity-40'
                        }`}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-[#1a1a1a]" />
                            <div>
                                <h4 className="text-white font-bold text-sm">{t.name}</h4>
                                <p className="text-[#444] text-[10px] font-bold uppercase tracking-widest">{t.role}</p>
                            </div>
                        </div>
                        <p className="text-[#a0a0a0] leading-relaxed italic">"{t.text}"</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-10">
            {testimonials.map((_, i) => (
                <button 
                    key={i} 
                    onClick={() => setIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${index === i ? 'bg-[#00e676] w-6' : 'bg-[#1a1a1a]'}`} 
                />
            ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
