import { useEffect, useRef } from "react";
import { detectCapabilities, onReducedMotionChange } from "@/lib/browser-capabilities";

type Particle = { x: number; y: number; z: number; radius: number; vx: number; vy: number; alpha: number; phase: number };

/**
 * Ambient canvas backdrop.
 *
 * Density is decided by viewport size only. Privacy-hardened browsers (Brave and
 * friends) report a falsified `navigator.hardwareConcurrency`/`deviceMemory`, and
 * the previous version used that value to downgrade the scene — which is why the
 * effect looked broken there. Never gate visuals on those values.
 *
 * The loop pauses when the tab is hidden and stops entirely under reduced motion,
 * re-arming live when the preference changes. Nothing survives unmount.
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let teardown: (() => void) | null = null;

    const run = () => {
      const caps = detectCapabilities();
      if (caps.reducedMotion) {
        canvas.style.opacity = "0";
        return null;
      }
      canvas.style.opacity = "1";

      const compact = caps.lightweight;
      const speed = 0.65;
      const particleCount = compact ? 12 : Math.min(34, Math.max(22, Math.floor(window.innerWidth / 48)));
      const waveCount = compact ? 1 : 2;
      const targetFrameMs = compact ? 33 : 20; // ~30fps mobile, ~50fps desktop
      const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: 0, targetActive: 0 };
      const particles: Particle[] = [];
      let width = 0;
      let height = 0;
      let dpr = 1;
      let scrollY = window.scrollY;
      let frame = 0;
      let lastDraw = 0;
      let visible = document.visibilityState === "visible";

      const makeParticle = (initial = false): Particle => {
        const z = 0.25 + Math.random() * 0.75;
        return {
          x: Math.random() * width,
          y: initial ? Math.random() * height : height + 8,
          z,
          radius: 0.35 + z * 0.85,
          vx: (Math.random() - 0.5) * 0.08 * z,
          vy: -(0.035 + Math.random() * 0.09) * z,
          alpha: 0.06 + Math.random() * 0.16,
          phase: Math.random() * Math.PI * 2,
        };
      };

      const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.5);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        while (particles.length < particleCount) particles.push(makeParticle(true));
        particles.length = particleCount;
      };

      const onPointerMove = (event: PointerEvent) => {
        pointer.tx = (event.clientX / Math.max(width, 1)) * 2 - 1;
        pointer.ty = (event.clientY / Math.max(height, 1)) * 2 - 1;
        pointer.targetActive = 1;
      };
      const onPointerLeave = () => { pointer.targetActive = 0; };
      const onScroll = () => { scrollY = window.scrollY; };
      const onVisibility = () => {
        visible = document.visibilityState === "visible";
        if (visible && !frame) frame = requestAnimationFrame(draw);
      };

      const drawMist = (x: number, y: number, radius: number, alpha: number) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(25,196,216,${alpha})`);
        gradient.addColorStop(0.42, `rgba(14,116,144,${alpha * 0.42})`);
        gradient.addColorStop(1, "rgba(3,12,18,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      };

      const draw = (time: number) => {
        frame = 0;
        if (!visible) return;
        if (time - lastDraw < targetFrameMs) {
          frame = requestAnimationFrame(draw);
          return;
        }
        lastDraw = time;
        const t = time * 0.00012 * speed;
        pointer.x += (pointer.tx - pointer.x) * 0.03;
        pointer.y += (pointer.ty - pointer.y) * 0.03;
        pointer.active += (pointer.targetActive - pointer.active) * 0.035;
        ctx.clearRect(0, 0, width, height);

        const scrollDrift = Math.sin(scrollY * 0.001) * 18;
        drawMist(width * (0.18 + Math.sin(t) * 0.025) + pointer.x * 15, height * 0.13 + scrollDrift, Math.max(width, height) * 0.52, compact ? 0.04 : 0.06);
        if (!compact) {
          drawMist(width * (0.84 + Math.cos(t * 0.82) * 0.02) + pointer.x * 10, height * 0.82 - scrollDrift, Math.max(width, height) * 0.46, 0.04);
        }

        if (pointer.active > 0.01) {
          const px = ((pointer.x + 1) / 2) * width;
          const py = ((pointer.y + 1) / 2) * height;
          drawMist(px, py, compact ? 180 : 260, 0.035 * pointer.active);
        }

        ctx.lineWidth = 1;
        for (let line = 0; line < waveCount; line += 1) {
          ctx.beginPath();
          const baseY = height * (0.32 + line * 0.075) + pointer.y * (4 + line);
          for (let x = -20; x <= width + 20; x += 24) {
            const y = baseY + Math.sin(x * 0.008 + t * (4.2 + line * 0.28) + line) * (8 + line * 1.8)
              + Math.sin(x * 0.0025 - t * 3 + line * 0.7) * 11 + scrollDrift * 0.12;
            if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(55,200,218,${0.03 + line * 0.006})`;
          ctx.stroke();
        }

        for (const p of particles) {
          p.x += (p.vx + pointer.x * 0.012 * p.z) * speed;
          p.y += p.vy * speed;
          if (p.y < -8) Object.assign(p, makeParticle(false));
          if (p.x < -8) p.x = width + 8;
          if (p.x > width + 8) p.x = -8;
          const flicker = 0.7 + Math.sin(t * 10 + p.phase) * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(102,220,232,${p.alpha * flicker})`;
          ctx.fill();
        }

        frame = requestAnimationFrame(draw);
      };

      resize();
      window.addEventListener("resize", resize, { passive: true });
      if (caps.finePointer) window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      frame = requestAnimationFrame(draw);

      return () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVisibility);
        ctx.clearRect(0, 0, width, height);
      };
    };

    teardown = run();
    const unsubscribeReduced = onReducedMotionChange(() => {
      teardown?.();
      teardown = run();
    });

    return () => {
      unsubscribeReduced();
      teardown?.();
      teardown = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-300"
    />
  );
}
