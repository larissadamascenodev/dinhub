import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  videoSrc?: string;
}

const Hero = ({ videoSrc = "https://cdn.pixabay.com/video/2023/10/20/185731-876356775_large.mp4" }: HeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subHeadlineRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial State (gsap.set)
      gsap.set([overlayRef.current, hudRef.current, subHeadlineRef.current, scrollIndicatorRef.current], {
        opacity: 0,
      });
      gsap.set(hudRef.current, { y: -30 });
      
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        gsap.set(words, { 
          clipPath: 'inset(100% 0 0 0)',
          y: 40,
        });
      }

      // 2. Timeline
      const tl = gsap.timeline({
        delay: 0.4, // 0.4s de silêncio antes da timeline começar
      });

      // Overlay fade in
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      });

      // HUD superior
      tl.to(hudRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, "-=0.3"); // delay 0.3s (starts 0.3s before previous ends or relative) -> the prompt said "delay 0.3s" after HUD start? 
      // Re-reading: "HUD superior desce de -30px... delay 0.3s" - usually means offset from previous or absolute. 
      // Let's use absolute labels for clarity.

      // Headline reveal
      if (words) {
        tl.to(words, {
          clipPath: 'inset(0% 0 0 0)',
          y: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
        }, ">-0.2"); // Começa um pouco antes do HUD terminar
      }

      // Sub-headline fade up
      tl.to(subHeadlineRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, ">0.2"); // delay 0.2s depois da headline

      // Scroll indicator
      tl.to(scrollIndicatorRef.current, {
        opacity: 1,
        duration: 0.8,
        onComplete: () => {
          // Pulse animation
          gsap.to(scrollIndicatorRef.current, {
            opacity: 0.4,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
      });

      // ScrollTrigger for scroll indicator
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=100',
        onLeave: () => {
          gsap.to(scrollIndicatorRef.current, { opacity: 0, duration: 0.5 });
        },
        onEnterBack: () => {
          gsap.to(scrollIndicatorRef.current, { opacity: 1, duration: 0.5 });
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const headlineText = "Domine sua realidade financeira com precisão.";
  const words = headlineText.split(' ');

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[100svh] bg-[#030303] overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Dark Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/55 z-10 pointer-events-none" 
      />

      {/* HUD Superior */}
      <header 
        ref={hudRef}
        className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-30"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full" />
          </div>
          <span className="font-sora font-bold text-xl tracking-tighter text-white uppercase">Huby</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          {['Home', 'Sobre', 'Projetos', 'Contato'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </nav>

        <button className="md:hidden text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center max-w-5xl px-6">
        <h1 
          ref={headlineRef}
          className="text-white font-sora font-bold leading-[1.1] tracking-tighter text-center mb-6 overflow-hidden"
          style={{ 
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            textWrap: 'balance' as any
          }}
        >
          {words.map((word, i) => (
            <span key={i} className="inline-block mr-[0.3em] last:mr-0 overflow-hidden py-2">
              <span className="word inline-block">
                {word}
              </span>
            </span>
          ))}
        </h1>
        
        <p 
          ref={subHeadlineRef}
          className="font-inter font-light tracking-tight text-center max-w-2xl"
          style={{ 
            fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.55)'
          }}
        >
          A inteligência financeira de elite para quem busca o controle absoluto do amanhã. Organize, analise e evolua com tecnologia de ponta.
        </p>
      </div>

      {/* Scroll Indicator */}
      <div 
        ref={scrollIndicatorRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
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