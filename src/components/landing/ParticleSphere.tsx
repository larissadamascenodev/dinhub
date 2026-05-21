import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
}

interface ParticleSphereProps {
  state: 'idle' | 'active' | 'responding';
}

const ParticleSphere: React.FC<ParticleSphereProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const resize = () => {
      const size = Math.min(window.innerWidth * 0.9, 450);
      canvas.width = size;
      canvas.height = size;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const particleCount = 130;
    const radius = canvas.width * 0.35;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        px: 0,
        py: 0
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let rotationSpeed = 0.003;
      if (state === 'active') rotationSpeed = 0.007;
      if (state === 'responding') rotationSpeed = 0.018;

      rotationRef.current.y += rotationSpeed;
      rotationRef.current.x += rotationSpeed * 0.5;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const focalLength = 400;

      // Project particles
      particles.forEach(p => {
        // Rotate Y
        let x = p.x * Math.cos(rotationRef.current.y) - p.z * Math.sin(rotationRef.current.y);
        let z = p.x * Math.sin(rotationRef.current.y) + p.z * Math.cos(rotationRef.current.y);
        
        // Rotate X
        let y = p.y * Math.cos(rotationRef.current.x) - z * Math.sin(rotationRef.current.x);
        z = p.y * Math.sin(rotationRef.current.x) + z * Math.cos(rotationRef.current.x);

        const scale = focalLength / (focalLength + z);
        p.px = centerX + x * scale;
        p.py = centerY + y * scale;

        // Draw particle
        const alpha = Math.max(0.1, (z + radius) / (2 * radius));
        ctx.fillStyle = `rgba(0, 230, 118, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      ctx.strokeStyle = `rgba(0, 230, 118, ${state === 'responding' ? 0.3 : 0.15})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].px - particles[j].px;
          const dy = particles[i].py - particles[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(particles[i].px, particles[i].py);
            ctx.lineTo(particles[j].px, particles[j].py);
            ctx.stroke();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [state]);

  let scaleClass = "scale-100";
  if (state === 'responding') scaleClass = "animate-pulse scale-105";

  return (
    <div className={`relative transition-all duration-700 ${scaleClass}`}>
      <div className={`absolute inset-0 bg-[#00e676]/20 rounded-full blur-[80px] transition-all duration-700 ${state === 'responding' ? 'opacity-100 scale-125' : 'opacity-40'}`} />
      <canvas ref={canvasRef} className="relative z-10" />
    </div>
  );
};

export default ParticleSphere;
