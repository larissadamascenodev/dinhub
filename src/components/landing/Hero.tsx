import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import ParticleSphere from './ParticleSphere';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  videoSrc?: string;
}

const Hero = ({ videoSrc }: HeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subHeadlineRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial State (gsap.set)
      gsap.set([overlayRef.current, hudRef.current, scrollIndicatorRef.current, sphereRef.current], {
        opacity: 0,
      });
      gsap.set(subHeadlineRef.current, { opacity: 0, y: 20 });
      gsap.set(hudRef.current, { y: -30 });
      gsap.set(sphereRef.current, { scale: 0.8 });
      
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        gsap.set(words, { 
          clipPath: 'inset(100% 0 0 0)',
          y: 40,
        });
      }

      // 2. Timeline
      const tl = gsap.timeline({
        delay: 0.4,
      });

      // Overlay fade in
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 1.2,
        ease: 'power3.inOut',
      });

      // Sphere reveal
      tl.to(sphereRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'expo.out',
      }, "-=0.6");

      // HUD superior
      tl.to(hudRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, "-=1");

      // Headline reveal
      if (words) {
        tl.to(words, {
          clipPath: 'inset(0% 0 0 0)',
          y: 0,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
        }, "-=0.8");
      }

      // Sub-headline fade up
      tl.to(subHeadlineRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      }, "-=0.4");

      // Scroll indicator
      tl.to(scrollIndicatorRef.current, {
        opacity: 1,
        duration: 0.8,
        onComplete: () => {
          gsap.to(scrollIndicatorRef.current, {
            opacity: 0.4,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
      }, "-=0.2");

      // ScrollTrigger for parallax and fade
      gsap.to(contentRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        y: 100,
        opacity: 0,
        ease: 'none',
      });

      gsap.to(sphereRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        y: -50,
        scale: 1.2,
        opacity: 0,
        ease: 'none',
      });

      gsap.to(scrollIndicatorRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=200',
          scrub: 1,
        },
        opacity: 0,
        y: 30,
        ease: 'none',
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const headlineText = "Seu dinheiro some todo mês e você não sabe porque?";
  const words = headlineText.split(' ');

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[100svh] bg-[#030303] overflow-hidden flex flex-col items-center justify-center font-sora"
    >
      {/* Background Video */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* Particle Sphere Background */}
      <div 
        ref={sphereRef}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60"
      >
        <ParticleSphere state="idle" />
      </div>

      {/* Dark Overlay with Gradient */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black z-10 pointer-events-none" 
      />

      {/* HUD Superior Removido em favor da Navbar Global */}

      {/* Content */}
      <div ref={contentRef} className="relative z-20 flex flex-col items-center max-w-7xl px-6 w-full">
        <div className="flex flex-col items-center gap-6 mb-12">
          {/* Social Proof / Users Info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 py-2 px-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#030303] overflow-hidden">
                  <img 
                    src={`https://i.pravatar.cc/150?u=user${i + 10}`} 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-[#030303] bg-[#111] flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#00e676]">+2k</span>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Sparkles key={s} className="w-2.5 h-2.5 text-[#00e676] fill-[#00e676]" />
                ))}
                <span className="text-[10px] font-bold text-white ml-1">4.9/5</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                Mais de <span className="text-white/60">2.800 usuários</span> economizando hoje
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Neural Engine Online</span>
          </div>
        </div>

        <h1 
          ref={headlineRef}
          className="text-white font-black leading-[0.95] tracking-tighter text-center mb-10 overflow-hidden"
          style={{ 
            fontSize: 'clamp(2rem, 7vw, 5.5rem)',
            width: '100%',
            maxWidth: 'none',
            textWrap: 'balance' as any
          }}
        >
          {words.map((word, i) => (
            <span key={i} className="inline-block mr-[0.25em] last:mr-0 overflow-hidden py-2">
              <span className={`word inline-block ${["some", "todo", "mês"].includes(word.toLowerCase().replace(/[?.,]/g, "")) ? "bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent italic font-light tracking-tighter" : ""}`}>
                {word}
              </span>
            </span>
          ))}
        </h1>
        
        <p 
          ref={subHeadlineRef}
          className="font-inter font-light tracking-tight text-center max-w-3xl mb-14 leading-tight opacity-40"
          style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
          }}
        >
          O DinHub analisa cada centavo, te avisa antes de virar problema e mostra o que fazer.
        </p>

        <div className="flex flex-col items-center gap-8">
          <button className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-[#00e676] text-black font-black text-sm uppercase tracking-widest hover:scale-105 hover:shadow-[0_0_40px_rgba(0,230,118,0.3)] transition-all duration-500">
            Iniciar Sincronização
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Scroll Indicator - Animated Mouse */}
      <div 
        ref={scrollIndicatorRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1.5">
          <motion.div 
            animate={{ 
              y: [0, 12, 0],
              opacity: [1, 0, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-1 h-2 bg-[#00e676] rounded-full"
          />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">scroll</span>
      </div>

      <style>{`
        .word {
          display: inline-block;
        }
      `}</style>
    </section>
  );
};

export default Hero;