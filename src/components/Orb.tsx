import React, { useEffect, useRef } from 'react';
import { AssistantStatus } from '../context/AppContext.tsx';

interface OrbProps {
  status: AssistantStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
  accentColor?: 'pink' | 'purple' | 'cyan' | 'emerald';
}

export const Orb: React.FC<OrbProps> = ({
  status,
  size = 'md',
  interactive = false,
  onClick,
  accentColor = 'pink',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sizePixels = {
    sm: 80,
    md: 160,
    lg: 260,
    xl: 340,
  }[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = width * 0.32;

      ctx.clearRect(0, 0, width, height);

      // Color scheme setup
      let primaryColor = 'rgba(236, 72, 153, '; // Pink
      let secondaryColor = 'rgba(168, 85, 247, '; // Purple
      let glowColor = 'rgba(6, 182, 212, '; // Cyan

      if (accentColor === 'purple') {
        primaryColor = 'rgba(168, 85, 247, ';
        secondaryColor = 'rgba(192, 132, 252, ';
      } else if (accentColor === 'cyan') {
        primaryColor = 'rgba(6, 182, 212, ';
        secondaryColor = 'rgba(59, 130, 246, ';
      } else if (accentColor === 'emerald') {
        primaryColor = 'rgba(16, 185, 129, ';
        secondaryColor = 'rgba(52, 211, 153, ';
      }

      // Modulation depending on status
      let pulse = Math.sin(tick * 1.5) * 6;
      let waveSpeed = 1;

      if (status === 'listening') {
        pulse = Math.sin(tick * 3) * 14;
        waveSpeed = 2.2;
      } else if (status === 'thinking') {
        pulse = Math.sin(tick * 4) * 10;
        waveSpeed = 3.5;
      } else if (status === 'speaking') {
        pulse = Math.sin(tick * 5) * 18 + Math.cos(tick * 3) * 8;
        waveSpeed = 2.8;
      }

      // Outer ambient glowing aura
      const outerGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.3,
        centerX,
        centerY,
        baseRadius * 1.8 + pulse
      );
      outerGlow.addColorStop(0, primaryColor + '0.7)');
      outerGlow.addColorStop(0.5, secondaryColor + '0.3)');
      outerGlow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.8 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Fluid morphing sphere layers
      for (let layer = 0; layer < 3; layer++) {
        ctx.save();
        ctx.beginPath();
        const layerRadius = baseRadius - layer * 12 + pulse * (1 - layer * 0.2);

        const numPoints = 64;
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const noise =
            Math.sin(angle * 4 + tick * waveSpeed + layer) * (6 + layer * 3) +
            Math.cos(angle * 2 - tick * 1.8) * 4;
          const r = layerRadius + noise;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(
          centerX - layerRadius,
          centerY - layerRadius,
          centerX + layerRadius,
          centerY + layerRadius
        );

        if (layer === 0) {
          grad.addColorStop(0, primaryColor + '0.85)');
          grad.addColorStop(0.5, secondaryColor + '0.9)');
          grad.addColorStop(1, glowColor + '0.8)');
        } else if (layer === 1) {
          grad.addColorStop(0, secondaryColor + '0.7)');
          grad.addColorStop(1, primaryColor + '0.6)');
        } else {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, primaryColor + '0.9)');
          grad.addColorStop(1, secondaryColor + '0.7)');
        }

        ctx.fillStyle = grad;
        ctx.shadowColor = primaryColor + '0.8)';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();
      }

      // Orbital cyber rings
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(tick * 0.4);
      ctx.strokeStyle = primaryColor + '0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, baseRadius * 1.35, baseRadius * 0.6, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-tick * 0.7);
      ctx.strokeStyle = secondaryColor + '0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, baseRadius * 1.45, baseRadius * 0.7, -Math.PI / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status, size, accentColor]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''
      }`}
      style={{ width: sizePixels, height: sizePixels }}
    >
      <canvas
        ref={canvasRef}
        width={sizePixels * 2}
        height={sizePixels * 2}
        style={{ width: sizePixels, height: sizePixels }}
        className="pointer-events-none drop-shadow-[0_0_35px_rgba(236,72,153,0.35)]"
      />
    </div>
  );
};
