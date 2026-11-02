import React, { useEffect, useRef } from 'react';
import { GameStatus } from '../types/game.ts';

interface StudioStageCanvasProps {
  status: GameStatus;
  burstTrigger: number;
  shakeTrigger: number;
  isLightningRound?: boolean;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  isStar: boolean;
}

const KIDS_CONFETTI_COLORS = [
  '#007AFF',
  '#FFD600',
  '#EF4444',
  '#22C55E',
  '#A855F7',
  '#F97316',
  '#EC4899',
];

export const StudioStageCanvas: React.FC<StudioStageCanvasProps> = React.memo(
  ({ status, burstTrigger, shakeTrigger, isLightningRound = false }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stateRef = useRef({
      status,
      isLightningRound,
      shakeIntensity: 0,
      hitstopRemaining: 0,
    });

    const particlesRef = useRef<Particle[]>(
      Array.from({ length: 120 }, () => ({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 10,
        color: '#FFD600',
        alpha: 1,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 1,
        isStar: false,
      }))
    );

    useEffect(() => {
      stateRef.current.status = status;
      stateRef.current.isLightningRound = isLightningRound;
    }, [status, isLightningRound]);

    // Trigger gentle star & confetti burst
    useEffect(() => {
      if (burstTrigger <= 0) return;
      const canvas = canvasRef.current;
      const w = canvas ? canvas.width : 1440;
      const h = canvas ? canvas.height : 900;

      const pool = particlesRef.current;
      let spawned = 0;
      for (let i = 0; i < pool.length && spawned < 55; i++) {
        const p = pool[i];
        if (!p.active) {
          p.active = true;
          p.x = w * (0.25 + Math.random() * 0.5);
          p.y = h * 0.42;
          const angle = -Math.PI * (0.15 + Math.random() * 0.7);
          const speed = 180 + Math.random() * 380;
          p.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 140;
          p.vy = Math.sin(angle) * speed;
          p.size = 8 + Math.random() * 9;
          p.color =
            KIDS_CONFETTI_COLORS[Math.floor(Math.random() * KIDS_CONFETTI_COLORS.length)];
          p.alpha = 1;
          p.rotation = Math.random() * Math.PI * 2;
          p.vRot = (Math.random() - 0.5) * 6;
          p.life = 0;
          p.maxLife = 1.7 + Math.random() * 1.1;
          p.isStar = i % 3 === 0;
          spawned++;
        }
      }
    }, [burstTrigger]);

    // Gentle bounce / shake
    useEffect(() => {
      if (shakeTrigger <= 0) return;
      stateRef.current.hitstopRemaining = 0.035;
      stateRef.current.shakeIntensity = 6;
    }, [shakeTrigger]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId = 0;
      let lastTime = performance.now();
      let elapsedTotal = 0;

      const handleResize = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      handleResize();
      window.addEventListener('resize', handleResize);

      // Soft bokeh circles + floating 3D math operators
      const bokehOrbs = Array.from({ length: 22 }, (_, i) => ({
        xRatio: (i * 0.173) % 1,
        yRatio: (i * 0.239) % 1,
        radius: 24 + (i % 5) * 18,
        speedY: 5 + (i % 4) * 3,
        phase: i * 1.1,
        color:
          i % 4 === 0
            ? 'rgba(255, 214, 0, 0.09)'
            : i % 4 === 1
            ? 'rgba(56, 189, 248, 0.10)'
            : i % 4 === 2
            ? 'rgba(236, 72, 153, 0.07)'
            : 'rgba(255, 255, 255, 0.08)',
      }));

      const floatingSymbols = [
        { symbol: '+', color: '#22C55E', xRatio: 0.08, yRatio: 0.22, phase: 0.2, size: 42 },
        { symbol: '−', color: '#F97316', xRatio: 0.91, yRatio: 0.24, phase: 1.5, size: 42 },
        { symbol: '×', color: '#007AFF', xRatio: 0.06, yRatio: 0.62, phase: 2.8, size: 40 },
        { symbol: '÷', color: '#A855F7', xRatio: 0.93, yRatio: 0.64, phase: 4.1, size: 40 },
        { symbol: '1', color: '#007AFF', xRatio: 0.14, yRatio: 0.42, phase: 0.9, size: 30 },
        { symbol: '2', color: '#FFD600', xRatio: 0.86, yRatio: 0.44, phase: 2.1, size: 30 },
      ];

      const drawStar = (cx: number, cy: number, spikes: number, outerR: number, innerR: number) => {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerR);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerR;
          y = cy + Math.sin(rot) * outerR;
          ctx.lineTo(x, y);
          rot += step;
          x = cx + Math.cos(rot) * innerR;
          y = cy + Math.sin(rot) * innerR;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerR);
        ctx.closePath();
        ctx.fill();
      };

      const render = (now: number) => {
        const rawDt = (now - lastTime) / 1000;
        lastTime = now;
        const dt = Math.min(rawDt, 0.05);

        if (stateRef.current.hitstopRemaining > 0) {
          stateRef.current.hitstopRemaining = Math.max(0, stateRef.current.hitstopRemaining - dt);
          animationFrameId = requestAnimationFrame(render);
          return;
        }

        elapsedTotal += dt;
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();

        if (stateRef.current.shakeIntensity > 0.2) {
          const sx = (Math.random() - 0.5) * stateRef.current.shakeIntensity * 1.8;
          const sy = (Math.random() - 0.5) * stateRef.current.shakeIntensity * 1.8;
          ctx.translate(sx, sy);
          stateRef.current.shakeIntensity *= Math.pow(0.02, dt);
        } else {
          stateRef.current.shakeIntensity = 0;
        }

        // 1. Sky / Classroom Warm Bokeh Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#0284C7');
        skyGrad.addColorStop(0.45, '#072B59');
        skyGrad.addColorStop(0.76, '#1E293B');
        skyGrad.addColorStop(1, '#451A03');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Soft Out-of-Focus Classroom Bookshelf Silhouette (Bokeh Depth)
        ctx.fillStyle = 'rgba(217, 119, 6, 0.08)';
        ctx.fillRect(w * 0.04, h * 0.14, w * 0.16, h * 0.58);
        ctx.fillRect(w * 0.8, h * 0.14, w * 0.16, h * 0.58);

        // Soft Bokeh Light Circles
        for (const orb of bokehOrbs) {
          orb.yRatio -= (orb.speedY * dt) / Math.max(500, h);
          if (orb.yRatio < -0.1) orb.yRatio = 1.05;
          const ox = orb.xRatio * w + Math.sin(elapsedTotal * 0.6 + orb.phase) * 20;
          const oy = orb.yRatio * h;
          ctx.fillStyle = orb.color;
          ctx.beginPath();
          ctx.arc(ox, oy, orb.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Warm Wooden Desk Surface at Bottom (#EAB308 / #D97706)
        const deskY = h * 0.78;
        const woodGrad = ctx.createLinearGradient(0, deskY, 0, h);
        woodGrad.addColorStop(0, '#92400E');
        woodGrad.addColorStop(0.15, '#78350F');
        woodGrad.addColorStop(1, '#451A03');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, deskY, w, h - deskY);

        // Wooden Table Top Highlight Rim (#EAB308)
        ctx.fillStyle = '#D97706';
        ctx.fillRect(0, deskY, w, 6);
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(0, deskY, w, 2);

        // 4. Floating 3D Math Operators (+, −, ×, ÷)
        for (const item of floatingSymbols) {
          const fx = item.xRatio * w + Math.cos(elapsedTotal * 1.1 + item.phase) * 8;
          const fy = item.yRatio * h + Math.sin(elapsedTotal * 1.4 + item.phase) * 12;

          ctx.save();
          ctx.translate(fx, fy);
          ctx.rotate(Math.sin(elapsedTotal * 0.9 + item.phase) * 0.12);

          // 3D badge circle
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.beginPath();
          ctx.arc(0, 5, item.size * 0.68, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(0, 0, item.size * 0.68, 0, Math.PI * 2);
          ctx.fill();

          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `900 ${item.size * 0.75}px Fredoka, Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.symbol, 0, 2);
          ctx.restore();
        }

        // 5. Confetti & Star Reward Particles
        const pool = particlesRef.current;
        for (let i = 0; i < pool.length; i++) {
          const p = pool[i];
          if (!p.active) continue;

          p.life += dt;
          if (p.life >= p.maxLife) {
            p.active = false;
            continue;
          }

          p.vy += 460 * dt;
          p.vx *= Math.pow(0.48, dt);
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.vRot * dt;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          if (p.isStar) {
            drawStar(0, 0, 5, p.size, p.size * 0.45);
          } else {
            ctx.beginPath();
            ctx.roundRect(-p.size / 2, -p.size / 2, p.size, p.size, 3);
            ctx.fill();
          }
          ctx.restore();
        }

        ctx.restore();
        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />
    );
  }
);
