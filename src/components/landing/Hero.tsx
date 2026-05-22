import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

  const headlineText = "Domine sua realidade.";
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

      {/* HUD Superior */}
      <header 
        ref={hudRef}
        className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-30"
      >
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center border border-[#00e676]/20 group-hover:border-[#00e676]/50 transition-colors">
            <Sparkles className="w-5 h-5 text-[#00e676]" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-white uppercase italic">Huby</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-10">
          {[
            { label: 'Terminal', icon: Cpu },
            { label: 'Segurança', icon: ShieldCheck },
            { label: 'Membro', icon: Sparkles }
          ].map((item) => (
            <a 
              key={item.label} 
              href={`#${item.label.toLowerCase()}`}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/40 hover:text-white transition-all duration-300"
            >
              <item.icon className="w-3 h-3 text-[#00e676]/50 group-hover:text-[#00e676] transition-colors" />
              {item.label}
            </a>
          ))}
        </nav>

        <a 
          href="/auth"
          className="relative px-8 py-3 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-[#00e676] hover:scale-105 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          Acessar Terminal
        </a>
      </header>

      {/* Content */}
      <div ref={contentRef} className="relative z-20 flex flex-col items-center max-w-5xl px-6">
        <div className="mb-8 flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Neural Engine Online</span>
        </div>

        <h1 
          ref={headlineRef}
          className="text-white font-black leading-[0.9] tracking-tighter text-center mb-10 overflow-hidden uppercase"
          style={{ 
            fontSize: 'clamp(2.5rem, 10vw, 8rem)',
            textWrap: 'balance' as any
          }}
        >
          {words.map((word, i) => (
            <span key={i} className="inline-block mr-[0.25em] last:mr-0 overflow-hidden py-2">
              <span className="word inline-block">
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
          Organize sua vida inteira com <span className="text-white font-medium opacity-100">precisão absoluta</span> através da inteligência financeira de elite.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <button className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-[#00e676] text-black font-black text-sm uppercase tracking-widest hover:scale-105 hover:shadow-[0_0_40px_rgba(0,230,118,0.3)] transition-all duration-500">
            Iniciar Sincronização
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
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