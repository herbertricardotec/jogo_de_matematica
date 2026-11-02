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
}

const CONFETTI_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FDE047'];

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
      Array.from({ length: 140 }, () => ({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 8,
        color: '#F59E0B',
        alpha: 1,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 1,
      }))
    );

    useEffect(() => {
      stateRef.current.status = status;
      stateRef.current.isLightningRound = isLightningRound;
    }, [status, isLightningRound]);

    // Trigger particle burst from pool
    useEffect(() => {
      if (burstTrigger <= 0) return;
      const canvas = canvasRef.current;
      const w = canvas ? canvas.width : 1440;
      const h = canvas ? canvas.height : 900;

      const pool = particlesRef.current;
      let spawned = 0;
      for (let i = 0; i < pool.length && spawned < 65; i++) {
        const p = pool[i];
        if (!p.active) {
          p.active = true;
          p.x = w * (0.25 + Math.random() * 0.5);
          p.y = h * 0.45;
          const angle = -Math.PI * (0.15 + Math.random() * 0.7);
          const speed = 220 + Math.random() * 460;
          p.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 180;
          p.vy = Math.sin(angle) * speed;
          p.size = 6 + Math.random() * 8;
          p.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
          p.alpha = 1;
          p.rotation = Math.random() * Math.PI * 2;
          p.vRot = (Math.random() - 0.5) * 8;
          p.life = 0;
          p.maxLife = 1.6 + Math.random() * 1.1;
          spawned++;
        }
      }
    }, [burstTrigger]);

    // Trigger brief hitstop + decaying camera shake
    useEffect(() => {
      if (shakeTrigger <= 0) return;
      stateRef.current.hitstopRemaining = 0.045; // 45ms hitstop
      stateRef.current.shakeIntensity = 9;
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

      const ambientOrbs = Array.from({ length: 28 }, (_, i) => ({
        xRatio: (i * 0.137) % 1,
        yRatio: (i * 0.293) % 1,
        radius: 2 + (i % 4) * 1.5,
        speedY: 12 + (i % 5) * 6,
        phase: i * 0.9,
      }));

      const render = (now: number) => {
        const rawDt = (now - lastTime) / 1000;
        lastTime = now;
        const dt = Math.min(rawDt, 0.05); // Clamped delta time for 60fps stability

        if (stateRef.current.hitstopRemaining > 0) {
          stateRef.current.hitstopRemaining = Math.max(0, stateRef.current.hitstopRemaining - dt);
          animationFrameId = requestAnimationFrame(render);
          return;
        }

        elapsedTotal += dt;
        const w = canvas.width;
        const h = canvas.height;
        const { status: curStatus, isLightningRound: lightning } = stateRef.current;

        ctx.save();

        // Decaying camera shake
        if (stateRef.current.shakeIntensity > 0.2) {
          const sx = (Math.random() - 0.5) * stateRef.current.shakeIntensity * 2;
          const sy = (Math.random() - 0.5) * stateRef.current.shakeIntensity * 2;
          ctx.translate(sx, sy);
          stateRef.current.shakeIntensity *= Math.pow(0.015, dt);
        } else {
          stateRef.current.shakeIntensity = 0;
        }

        // 1. Studio Backdrop Gradient (60% Dominant Velvet Midnight Navy)
        const bgGrad = ctx.createRadialGradient(
          w * 0.5,
          h * 0.25,
          40,
          w * 0.5,
          h * 0.55,
          Math.max(w, h) * 0.85
        );
        if (lightning) {
          bgGrad.addColorStop(0, '#1E1B4B');
          bgGrad.addColorStop(0.55, '#0F172A');
          bgGrad.addColorStop(1, '#060913');
        } else {
          bgGrad.addColorStop(0, '#132043');
          bgGrad.addColorStop(0.6, '#0A1128');
          bgGrad.addColorStop(1, '#050814');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Sweeping Broadcast Studio Spotlights
        const numBeams = 4;
        for (let i = 0; i < numBeams; i++) {
          const anchorX = w * (0.15 + (i / (numBeams - 1)) * 0.7);
          const anchorY = -20;
          const speed = curStatus === 'ROUND_REVEAL' || curStatus === 'GAME_OVER' ? 1.8 : 0.65;
          const swingAngle =
            Math.sin(elapsedTotal * speed + i * 1.6) * 0.32 + (i < 2 ? 0.12 : -0.12);

          const beamLength = h * 1.15;
          const targetX = anchorX + Math.sin(swingAngle) * beamLength;
          const targetY = anchorY + Math.cos(swingAngle) * beamLength;
          const spread = w * 0.14;

          const beamGrad = ctx.createLinearGradient(anchorX, anchorY, targetX, targetY);
          const isGold = i % 2 === 0;
          beamGrad.addColorStop(
            0,
            isGold ? 'rgba(245, 158, 11, 0.14)' : 'rgba(59, 130, 246, 0.14)'
          );
          beamGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(anchorX - 16, anchorY);
          ctx.lineTo(anchorX + 16, anchorY);
          ctx.lineTo(targetX + spread, targetY);
          ctx.lineTo(targetX - spread, targetY);
          ctx.closePath();
          ctx.fill();
        }

        // 3. Perspective Studio Stage Floor Grid (Bottom 28% of viewport)
        const horizonY = h * 0.74;
        const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
        floorGrad.addColorStop(0, 'rgba(15, 23, 42, 0.2)');
        floorGrad.addColorStop(1, 'rgba(8, 13, 30, 0.92)');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, horizonY, w, h - horizonY);

        // Glowing horizon stage rim
        ctx.strokeStyle = lightning ? 'rgba(245, 158, 11, 0.45)' : 'rgba(56, 189, 248, 0.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(w, horizonY);
        ctx.stroke();

        // Perspective radial floor lines
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.lineWidth = 1;
        const vanishX = w * 0.5;
        for (let i = -6; i <= 6; i++) {
          ctx.beginPath();
          ctx.moveTo(vanishX + i * (w * 0.05), horizonY);
          ctx.lineTo(vanishX + i * (w * 0.16), h);
          ctx.stroke();
        }

        // 4. Floating Studio Dust Particles
        for (const orb of ambientOrbs) {
          orb.yRatio -= (orb.speedY * dt) / Math.max(400, h);
          if (orb.yRatio < 0) orb.yRatio = 1;
          const ox =
            orb.xRatio * w + Math.sin(elapsedTotal * 0.8 + orb.phase) * 18;
          const oy = orb.yRatio * h;
          const alpha = 0.12 + 0.12 * Math.sin(elapsedTotal * 1.5 + orb.phase);
          ctx.fillStyle = `rgba(248, 250, 252, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(ox, oy, orb.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Pooled Burst Confetti Particles
        const pool = particlesRef.current;
        for (let i = 0; i < pool.length; i++) {
          const p = pool[i];
          if (!p.active) continue;

          p.life += dt;
          if (p.life >= p.maxLife) {
            p.active = false;
            continue;
          }

          p.vy += 540 * dt; // Gravity
          p.vx *= Math.pow(0.45, dt); // Air drag
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.vRot * dt;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, (p.size * 2) / 3);
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
