'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  opacity: number;
  phase: number;
  phaseSpeed: number;
}

type CursorState = {
  x: number;
  y: number;
  angle: number;
  visible: boolean;
};

export function MouseGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const previousRef = useRef({ x: 0, y: 0 });
  const angleRef = useRef(-45);
  const [cursor, setCursor] = useState<CursorState>({
    x: -100,
    y: -100,
    angle: -45,
    visible: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const connectDistance = 172;
    const mouseRadius = 245;
    const red = '255, 0, 15';
    const white = '255, 255, 255';

    function targetParticleCount() {
      if (!canvas) return 280;
      return Math.min(460, Math.max(280, Math.floor(canvas.height / 13)));
    }

    function createParticle(): Particle {
      if (!canvas) {
        return {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          baseVx: 0,
          baseVy: 0,
          radius: 1,
          opacity: 0.5,
          phase: 0,
          phaseSpeed: 0.01,
        };
      }

      const baseVx = (Math.random() - 0.5) * 0.58;
      const baseVy = (Math.random() - 0.5) * 0.58;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        radius: Math.random() * 1.75 + 0.45,
        opacity: Math.random() * 0.58 + 0.34,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.02 + 0.01,
      };
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = Math.max(
        window.innerHeight,
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${canvas.height}px`;

      const target = targetParticleCount();
      while (particlesRef.current.length < target) {
        particlesRef.current.push(createParticle());
      }
      if (particlesRef.current.length > target + 80) {
        particlesRef.current = particlesRef.current.slice(0, target);
      }
    }

    function initParticles() {
      if (!canvas) return;
      particlesRef.current = Array.from({ length: targetParticleCount() }, createParticle);
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height * 0.18,
        0,
        canvas.width / 2,
        canvas.height * 0.18,
        Math.max(canvas.width, window.innerHeight) * 0.92
      );
      gradient.addColorStop(0, 'rgba(255, 0, 15, 0.2)');
      gradient.addColorStop(0.38, 'rgba(60, 0, 80, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouseRadius && distance > 0) {
          const force = (mouseRadius - distance) / mouseRadius;
          particle.vx += (dx / distance) * force * 0.022;
          particle.vy += (dy / distance) * force * 0.022;
        }

        particle.vx += (particle.baseVx - particle.vx) * 0.03;
        particle.vy += (particle.baseVy - particle.vy) * 0.03;
        particle.phase += particle.phaseSpeed;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectDistance) {
            const opacity = (1 - distance / connectDistance) * 0.24;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${white}, ${opacity})`;
            ctx.lineWidth = 0.58;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const particle of particles) {
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const nearMouse = distance < mouseRadius;
        const twinkle = Math.max(0.1, Math.min(1, particle.opacity + Math.sin(particle.phase) * 0.15));

        if (nearMouse) {
          const opacity = (1 - distance / mouseRadius) * 0.62;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${red}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(particle.x, particle.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius * 4.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${red}, ${opacity * 0.75})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = nearMouse
          ? `rgba(${red}, ${Math.min(1, twinkle + 0.44)})`
          : `rgba(${white}, ${twinkle})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    function handlePointerMove(event: PointerEvent) {
      const previous = previousRef.current;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      const hasMovement = Math.abs(dx) + Math.abs(dy) > 1;
      const angle = hasMovement ? Math.atan2(dy, dx) * (180 / Math.PI) + 45 : angleRef.current;

      angleRef.current = angle;
      previousRef.current = { x: event.clientX, y: event.clientY };
      mouseRef.current = { x: event.clientX, y: event.clientY + window.scrollY };
      setCursor({ x: event.clientX, y: event.clientY, angle, visible: true });
    }

    function handlePointerLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
      setCursor((value) => ({ ...value, visible: false }));
    }

    resize();
    initParticles();
    const delayedResize = window.setTimeout(resize, 700);
    const finalResize = window.setTimeout(resize, 1800);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('mouseleave', handlePointerLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.clearTimeout(delayedResize);
      window.clearTimeout(finalResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-x-0 top-0 z-[1] opacity-100" />
      <div
        className="pointer-events-none fixed z-[1000] hidden h-9 w-9 select-none place-items-center text-3xl drop-shadow-[0_0_14px_rgba(255,0,15,0.7)] md:grid"
        style={{
          left: cursor.x,
          top: cursor.y,
          opacity: cursor.visible ? 1 : 0,
          transform: `translate(-50%, -50%) rotate(${cursor.angle}deg)`,
          transition: 'opacity 120ms ease, transform 70ms linear',
        }}
        aria-hidden="true"
      >
        {'\u{1F680}'}
      </div>
    </>
  );
}
