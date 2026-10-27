import React, { useEffect, useRef } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';

class Particle {
  constructor(emoji, x, y, combo = 1) {
    this.emoji = emoji;
    this.x = x;
    this.y = y;
    // Initial explosive velocity
    this.vx = (Math.random() - 0.5) * 4.5;
    this.vy = -(4.5 + Math.random() * 5.5 + Math.min(combo * 0.4, 4));
    this.gravity = 0.08;
    this.wobbleSpeed = 0.04 + Math.random() * 0.06;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleAmp = 1.8 + Math.random() * 2.2;
    this.scale = 0.4;
    this.maxScale = 1.2 + Math.min(combo * 0.08, 0.8);
    this.alpha = 1.0;
    this.life = 0;
    this.maxLife = 70 + Math.random() * 40;
    this.combo = combo;
  }

  update() {
    this.life++;
    this.x += this.vx + Math.sin(this.life * this.wobbleSpeed + this.wobblePhase) * this.wobbleAmp;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.98;

    // Scale growth then gentle shrinkage
    if (this.life < 12) {
      this.scale += (this.maxScale - this.scale) * 0.3;
    } else if (this.life > this.maxLife - 25) {
      this.alpha -= 0.04;
      this.scale *= 0.96;
    }

    return this.alpha > 0.01 && this.life < this.maxLife;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.font = `${Math.floor(28 * this.scale)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText(this.emoji, this.x, this.y);

    // Render combo badge with Crimson & Gold styling
    if (this.combo >= 3 && this.life < 35) {
      ctx.font = `bold ${Math.floor(12 * this.scale)}px monospace`;
      ctx.fillStyle = '#E50914';
      ctx.shadowColor = 'rgba(229, 9, 20, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(`${this.combo}x`, this.x + 18, this.y - 12);
    }

    ctx.restore();
  }
}

class SparkParticle {
  constructor(x, y, color = '#E50914') {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2;
    this.gravity = 0.08;
    this.radius = 1.5 + Math.random() * 2;
    this.alpha = 1.0;
    this.color = color;
    this.life = 0;
    this.maxLife = 25 + Math.random() * 25;
  }

  update() {
    this.life++;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.alpha -= 1 / this.maxLife;
    return this.alpha > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function ReactionCanvas() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const { reactionBurstTrigger } = useWatchParty();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (!reactionBurstTrigger || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const { emoji, x, y, combo } = reactionBurstTrigger;

    const spawnX = (x ?? 0.5) * canvas.width;
    const spawnY = (y ?? 0.85) * canvas.height;

    const count = 4 + Math.min(Math.floor((combo || 1) / 2), 6);
    for (let i = 0; i < count; i++) {
      const jitterX = spawnX + (Math.random() - 0.5) * 40;
      const jitterY = spawnY + (Math.random() - 0.5) * 20;
      particlesRef.current.push(new Particle(emoji, jitterX, jitterY, combo || 1));
    }

    // Spawn radiant spark particles (Crimson & Violet)
    const sparkCount = 6 + Math.min(combo || 1, 8);
    for (let s = 0; s < sparkCount; s++) {
      const color = s % 2 === 0 ? '#E50914' : '#8B5CF6';
      particlesRef.current.push(new SparkParticle(spawnX, spawnY, color));
    }

    if (!animFrameRef.current) {
      startLoop();
    }
  }, [reactionBurstTrigger]);

  function startLoop() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const active = [];
      for (const p of particlesRef.current) {
        if (p.update()) {
          p.draw(ctx);
          active.push(p);
        }
      }
      particlesRef.current = active;

      if (active.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  );
}
