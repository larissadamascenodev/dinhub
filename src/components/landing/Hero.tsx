import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Calendar, XCircle } from 'lucide-react';
import SubtleParticles from './SubtleParticles';

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
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subHeadlineRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial State (gsap.set)
      gsap.set([overlayRef.current, hudRef.current, scrollIndicatorRef.current, sphereRef.current], {
        opacity: 0,
      });
      gsap.set(hudRef.current, { y: -30 });
      gsap.set(sphereRef.current, { scale: 0.8 });
      
      const revealElements = [
        badgeRef.current,
        subHeadlineRef.current,
        buttonsRef.current,
        labelsRef.current
      ];

      gsap.set(revealElements, { 
        opacity: 0,
        y: 20,
        clipPath: 'inset(100% 0 0 0)',
      });

      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        gsap.set(words, { 
          clipPath: 'inset(100% 0 0 0)',
          y: 40,
        });
      }

      // 2. Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: "play none none reverse", // Plays on enter, reverses on leave (so it can play again)
        },
        delay: 0.2,
      });

      // Overlay fade in (only on first load or manual)
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 1.2,
        ease: 'power3.inOut',
      }, 0);

      // Sphere reveal
      tl.to(sphereRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'expo.out',
      }, 0.2);

      // HUD superior
      tl.to(hudRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, 0.5);

      // Social Proof Badge
      tl.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.8,
        ease: 'power3.out',
      }, 0.6);

      // Headline reveal
      if (words) {
        tl.to(words, {
          clipPath: 'inset(0% 0 0 0)',
          y: 0,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
        }, 0.7);
      }

      // Sub-headline reveal
      tl.to(subHeadlineRef.current, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.9,
        ease: 'power3.out',
      }, 0.9);

      // Buttons reveal
      tl.to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.8,
        ease: 'power3.out',
      }, 1.1);

      // Labels reveal
      tl.to(labelsRef.current, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.8,
        ease: 'power3.out',
      }, 1.2);

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
      }, 1.4);

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
      className="relative w-full h-[100svh] min-h-[600px] bg-[#030303] overflow-hidden flex flex-col items-center justify-center font-sora py-20"
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

      {/* Subtle Particles Background */}
      <div 
        ref={sphereRef}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <SubtleParticles />
      </div>

      {/* Dark Overlay with Gradient and Transition to Next Section */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#0a0a0a] z-10 pointer-events-none" 
      />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      {/* HUD Superior Removido em favor da Navbar Global */}

      {/* Content */}
      <div ref={contentRef} className="relative z-20 flex flex-col items-center max-w-7xl px-4 sm:px-6 w-full text-center">
        <div className="flex flex-col items-center gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Social Proof / Users Info */}
          <div ref={badgeRef} className="flex flex-row items-center gap-3 sm:gap-6 py-2 px-4 sm:px-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="flex -space-x-1.5 sm:-space-x-3 shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-5 h-5 sm:w-8 sm:h-8 rounded-full border border-[#030303] overflow-hidden">
                  <img 
                    src={`https://i.pravatar.cc/150?u=user${i + 10}`} 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full border border-[#030303] bg-[#111] flex items-center justify-center">
                <span className="text-[7px] sm:text-[10px] font-bold text-[#00e676]">+2k</span>
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Sparkles key={s} className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 text-[#00e676] fill-[#00e676]" />
                ))}
                <span className="text-[8px] sm:text-[10px] font-bold text-white ml-1">4.9/5</span>
              </div>
              <p className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.05em] sm:tracking-widest text-white/20 whitespace-nowrap">
                Mais de <span className="text-white/40">2.800 usuários</span> economizando hoje
              </p>
            </div>
          </div>
        </div>

        <h1 
          ref={headlineRef}
          className="text-white font-black leading-[0.95] tracking-tighter text-center mb-6 md:mb-10 overflow-hidden"
          style={{ 
            fontSize: 'clamp(1.4rem, 6.5vw, 5.5rem)',
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
          className="font-inter font-light tracking-tight text-center max-w-3xl mb-10 md:mb-14 leading-tight opacity-40 px-2 sm:px-0"
          style={{ 
            fontSize: 'clamp(0.85rem, 2.5vw, 1.6rem)',
          }}
        >
          O DinHub analisa cada centavo, te avisa antes de virar problema e mostra o que fazer.
        </p>

        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-6 w-full max-w-[350px] sm:max-w-none px-2 sm:px-0">
            <button className="group relative flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-12 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl bg-white text-black font-black text-[9px] sm:text-sm uppercase tracking-widest hover:scale-105 transition-all duration-500 shadow-[0_20px_50px_rgba(255,255,255,0.1)] whitespace-nowrap">
              Começar Grátis
              <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
            
            <button className="group relative flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-12 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl border border-white/20 bg-transparent text-white font-black text-[9px] sm:text-sm uppercase tracking-widest hover:bg-white/5 hover:border-white/40 transition-all duration-500 whitespace-nowrap">
              Demonstração
            </button>
          </div>

          {/* Micro-info labels */}
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-8 text-[7px] md:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/30 whitespace-nowrap">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-2 sm:w-3 h-2 sm:h-3 text-[#00e676]/60" />
              Teste 3 dias grátis
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <XCircle className="w-2 sm:w-3 h-2 sm:h-3 text-[#00e676]/60" />
              Cancele quando quiser
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Animated Mouse */}
      <div 
        ref={scrollIndicatorRef}
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-3 z-20"
      >
        <div className="w-3.5 h-6 sm:w-6 sm:h-10 rounded-full border-2 border-white/20 flex justify-center p-0.5 sm:p-1.5">
          <motion.div 
            animate={{ 
              y: [0, 6, 0],
              opacity: [1, 0, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-0.5 h-1 sm:w-1 sm:h-2 bg-[#00e676] rounded-full"
          />
        </div>
        <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-white/30">scroll</span>
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