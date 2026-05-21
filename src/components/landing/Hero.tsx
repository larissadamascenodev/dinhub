import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const headline = "Seu dinheiro some todo mês e você não sabe por quê.";
  const words = headline.split(" ");

  const avatars = [
    "https://i.pravatar.cc/150?u=1",
    "https://i.pravatar.cc/150?u=2",
    "https://i.pravatar.cc/150?u=3",
    "https://i.pravatar.cc/150?u=4",
    "https://i.pravatar.cc/150?u=5",
  ];

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-5 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] aspect-square max-w-[1200px] rounded-full bg-[#00e676]/10 blur-[120px] pointer-events-none" />

      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-3 p-1 pr-4 rounded-full border border-[#00e676]/20 bg-[#00e676]/5 mb-10"
      >
        <div className="flex -space-x-2">
          {avatars.map((url, i) => (
            <img 
              key={i} 
              src={url} 
              alt="User" 
              className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] object-cover"
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-[#00e676]">
          +2.847 pessoas assumindo o controle
        </span>
      </motion.div>

      {/* Headline */}
      <h1 className="text-center font-sora font-extrabold max-w-5xl leading-[1.1] mb-12">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-block mr-[0.2em] last:mr-0 ${
              word.includes("por") || word.includes("quê.") ? "text-[#00e676]" : "text-white"
            } ${word === "não" && words[i+1] === "sabe" ? "text-[#00e676]" : ""}`}
            style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* Huby Bubble */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="max-w-[400px] p-6 rounded-[18px] border border-[#00e676]/20 bg-[#00e676]/7 backdrop-blur-sm mb-12 text-center"
      >
        <p className="text-[#ffffff] leading-relaxed">
          Oi. Eu sou a <span className="text-[#00e676] font-bold">Huby</span>. Posso te dizer agora mesmo para onde foi seu dinheiro esse mês — e o que você precisa fazer diferente.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="flex flex-col items-center gap-4"
      >
        <a 
          href="/auth"
          className="group relative flex items-center gap-2 px-8 py-5 rounded-full bg-[#00e676] text-[#0a0a0a] font-sora font-bold text-lg shadow-[0_0_30px_rgba(0,230,118,0.25)] hover:scale-105 hover:shadow-[0_0_40px_rgba(0,230,118,0.4)] transition-all duration-300"
        >
          Conversar com a Huby
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
        <span className="text-sm text-[#444] font-medium">
          3 dias grátis · Sem cartão
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
