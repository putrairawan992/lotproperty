import { useEffect, useRef } from "react";

export default function GoldParticlesCanvas({ width = 380, height = 80 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      glow: number;
    }> = [];

    // Track mouse
    let mouse = { x: -9999, y: -9999 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Initial particles
    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.5 + 0.3,
        glow: Math.random() * 4 + 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.globalCompositeOperation = "screen";

      // Draw and update particles
      particles.forEach((p) => {
        // Apply physics
        p.x += p.vx;
        p.y += p.vy;

        // Mouse avoidance
        if (mouse.x !== -9999) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 45) {
            const force = (45 - dist) / 45;
            p.vx += (dx / dist) * force * 0.08;
            p.vy += (dy / dist) * force * 0.08;
          }
        }

        // Slow down velocity drift
        p.vx *= 0.97;

        // Draw particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 222, 130, ${p.alpha})`;
        ctx.shadowBlur = p.glow;
        ctx.shadowColor = "#E8A500";
        ctx.fill();
        ctx.restore();

        // Respawn if off bounds or faded
        if (p.y < -5 || p.x < -5 || p.x > width + 5) {
          p.x = Math.random() * width;
          p.y = height + 5;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = -Math.random() * 0.4 - 0.1;
          p.alpha = Math.random() * 0.5 + 0.3;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
