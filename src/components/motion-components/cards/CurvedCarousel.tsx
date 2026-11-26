"use client";

import React, { useEffect, useRef, useState } from "react";

export interface CurvedCarouselItem {
  id: string;
  title: string;
  src: string;
}

export interface CurvedCarouselProps {
  /** Custom gallery items (defaults to the 5 landscape cards) */
  items?: CurvedCarouselItem[];
  /** Degrees per second for the gentle continuous panoramic glide (default: 7.5) */
  speed?: number;
  /** Whether to continuously glide automatically (default: true) */
  autoPlay?: boolean;
  /** Optional extra CSS classes */
  className?: string;
}

const DEFAULT_CARDS: CurvedCarouselItem[] = [
  { id: "hills", title: "Golden Hills", src: "/lab/carousel-hills.jpg" },
  { id: "forest", title: "Misty Pines", src: "/lab/carousel-forest.jpg" },
  { id: "alpine", title: "Snow Peak", src: "/lab/carousel-alpine.jpg" },
  { id: "lake", title: "Mirror Lake", src: "/lab/carousel-lake.jpg" },
  { id: "falls", title: "Forest Falls", src: "/lab/carousel-falls.jpg" },
];

const STAGE_W = 640;
const STAGE_H = 263;
const CARD_W = 114;
const CARD_H = 148;
// Smaller cylinder radius & tighter perspective create a deep concave wrap with clear card gaps
const CYLINDER_R = 320;
const PERSPECTIVE = 420;
const ANGLE_STEP = 26.5;

function getEdgeStyle(theta: number) {
  const absTheta = Math.abs(theta);
  if (absTheta > 68) {
    return { opacity: 0, blur: 16, visible: false };
  }
  // Smooth optical depth blur + fade as cards curve out toward the edges
  const blur = absTheta > 28 ? Math.min(15, ((absTheta - 28) / 36) * 15) : 0;
  const opacity = absTheta > 38 ? Math.max(0, 1 - (absTheta - 38) / 28) : 1;
  return { opacity, blur, visible: true };
}

export function CurvedCarousel({
  items = DEFAULT_CARDS,
  speed = 7.5,
  autoPlay = true,
  className = "",
}: CurvedCarouselProps) {
  // Repeat the 5-card cycle cleanly so wrap-around off-stage is seamless
  const ringItems = React.useMemo(() => {
    const base = items.length > 0 ? items : DEFAULT_CARDS;
    const repeated: (CurvedCarouselItem & { key: string })[] = [];
    const targetCount = Math.max(10, base.length * 2);
    for (let i = 0; i < targetCount; i++) {
      const srcItem = base[i % base.length];
      repeated.push({ ...srcItem, key: `${srcItem.id}-${i}` });
    }
    return repeated;
  }, [items]);

  const totalSpan = ringItems.length * ANGLE_STEP;
  // Start with index 2 ("Snow Peak") centered cleanly at 0 deg
  const initialAngle = -(2 * ANGLE_STEP);

  const outerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [stageScale, setStageScale] = useState(1);

  const stateRef = useRef({
    angle: initialAngle,
    velocity: 0,
    isDragging: false,
    isHovered: false,
    lastX: 0,
    lastTime: 0,
  });

  // Uniform scaling preserves exact 3D proportions inside any card or modal width
  useEffect(() => {
    const el = outerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setStageScale(w / STAGE_W);
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 60fps continuous concave cylinder animation loop
  useEffect(() => {
    let rafId = 0;
    let prevTs = performance.now();

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - prevTs) / 1000));
      prevTs = now;

      const s = stateRef.current;
      if (!s.isDragging) {
        if (Math.abs(s.velocity) > 0.05) {
          s.angle += s.velocity * dt;
          s.velocity *= Math.pow(0.06, dt);
        } else if (autoPlay && !document.hidden) {
          const factor = s.isHovered ? 0.25 : 1;
          s.angle -= speed * factor * dt;
        }
      }

      const halfSpan = totalSpan / 2;
      const count = ringItems.length;

      for (let i = 0; i < count; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        let theta = (((i * ANGLE_STEP + s.angle) % totalSpan) + totalSpan) % totalSpan;
        if (theta >= halfSpan) theta -= totalSpan;

        const { opacity, blur, visible } = getEdgeStyle(theta);
        if (!visible) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          continue;
        }

        el.style.opacity = opacity.toFixed(3);
        el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
        el.style.pointerEvents = "auto";
        el.style.zIndex = String(Math.round(100 + Math.abs(theta)));
        el.style.transform = `translate3d(-50%, -50%, ${CYLINDER_R}px) rotateY(${theta.toFixed(3)}deg) translateZ(${-CYLINDER_R}px)`;
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(rafId);
  }, [ringItems.length, totalSpan, speed, autoPlay]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const s = stateRef.current;
    s.isDragging = true;
    s.velocity = 0;
    s.lastX = e.clientX;
    s.lastTime = performance.now();

    const onMove = (ev: PointerEvent) => {
      if (!s.isDragging) return;
      const now = performance.now();
      const dx = ev.clientX - s.lastX;
      const dt = Math.max(0.008, (now - s.lastTime) / 1000);
      const degDelta = (dx / Math.max(0.35, stageScale)) * 0.16;
      s.angle += degDelta;
      s.velocity = degDelta / dt;
      s.lastX = ev.clientX;
      s.lastTime = now;
    };

    const onUp = () => {
      s.isDragging = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const edgeMask =
    "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.16) 7%, rgba(0,0,0,0.72) 15%, #000 22%, #000 78%, rgba(0,0,0,0.72) 85%, rgba(0,0,0,0.16) 93%, transparent 100%)";

  return (
    <div
      ref={outerRef}
      onPointerEnter={() => {
        stateRef.current.isHovered = true;
      }}
      onPointerLeave={() => {
        stateRef.current.isHovered = false;
      }}
      onPointerDown={handlePointerDown}
      role="region"
      aria-label="Curved panoramic photo carousel"
      style={{
        aspectRatio: `${STAGE_W} / ${STAGE_H}`,
        WebkitMaskImage: edgeMask,
        maskImage: edgeMask,
      }}
      className={`relative w-full max-w-[540px] bg-transparent overflow-hidden select-none cursor-grab active:cursor-grabbing touch-pan-y ${className}`}
    >
      {/* Scaled 3D Concave Stage */}
      <div
        style={{
          width: `${STAGE_W}px`,
          height: `${STAGE_H}px`,
          transform: `scale(${stageScale})`,
          transformOrigin: "top left",
          perspective: `${PERSPECTIVE}px`,
          perspectiveOrigin: "50% 50%",
        }}
        className="relative"
      >
        {ringItems.map((card, idx) => {
          const halfSpan = totalSpan / 2;
          let initTheta = (((idx * ANGLE_STEP + initialAngle) % totalSpan) + totalSpan) % totalSpan;
          if (initTheta >= halfSpan) initTheta -= totalSpan;
          const { opacity, blur, visible } = getEdgeStyle(initTheta);

          return (
            <div
              key={card.key}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              style={{
                width: `${CARD_W}px`,
                height: `${CARD_H}px`,
                left: "50%",
                top: "50%",
                opacity,
                filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none",
                zIndex: Math.round(100 + Math.abs(initTheta)),
                transform: `translate3d(-50%, -50%, ${CYLINDER_R}px) rotateY(${initTheta.toFixed(3)}deg) translateZ(${-CYLINDER_R}px)`,
                backfaceVisibility: "hidden",
                pointerEvents: visible ? "auto" : "none",
              }}
              className="absolute rounded-[12px] overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.16)] ring-1 ring-black/[0.06] will-change-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.src}
                alt={card.title}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none select-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] pointer-events-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CurvedCarousel;
