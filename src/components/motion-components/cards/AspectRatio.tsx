"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

/* ── inlined from lab/motion ──────────────────────── */
/* ── elastic, as numbers a person can hold ─────────────────
   Several blocks here are the same idea in different clothes:
   something travels, stretches on the way, and overshoots
   when it lands. Their character lives in a duration and in
   one control point of a bezier — which is exactly the kind
   of thing nobody should have to name in order to tune.

   So the outside of every elastic knob is 0..100 and the
   inside is real units, and **50 is always what the component
   was already tuned to**. Turn every knob on the bench to the
   middle and nothing has changed. That is what makes these
   safe to expose: the default is not a number somebody has to
   remember, it is the middle of the slider.

   Both ends have to be shippable, which is the constraint
   that actually shapes these curves. The ranges below stop
   where the effect stops being the thing it is — a bar that
   moves in 40ms still reads as a bar snapping to a slot; one
   that moves in 20ms reads as broken. */

/* How long it takes, slower to faster, as a multiplier on
   whatever the component's own tuned duration is. 0 is a
   little over half again as slow, 100 is two and a half times
   as fast, 50 is exactly 1. */
const rate = (speed: number) => 1.6 - (speed / 100) * 1.2;

/* SHEEP was Bencho's own pictures, which is not licensed
   to travel. Point this at yours. */
const SHEEP: string = "/lab/mount.jpg";

/* ══ Aspect ═══════════════════════════════════════════════
   A picture and five shapes to put it in.

   THE FIVE FORMATS HAVE THE SAME AREA (~42,780 px²). That is
   the whole idea and it is not how most crop switchers are
   built — the common version fixes the width and lets the
   height do whatever the ratio says, which means Widescreen
   is dwarfed by Story and switching feels like the picture
   grew rather than like it was cropped. Equal area is what a
   crop actually is: the same amount of picture, held a
   different way. 207x207, 179x239, 155x276, 239x179 and
   276x155 are within 0.16% of each other.

   It also decides the frame. Every shape fits inside one
   276x276 square, so the block's bounding box is the biggest
   any of them gets and the wall never rescales it mid-move.

   NO CROP IN THE FILE. The source is 3:4 and stays that way
   — see scripts/sheep.sh — so `cover` does all five crops
   from one picture. Switching ratios pairs the equal-area
   frame morph with a calm optical soft-focus resolve and
   single sheen pass as the newly cropped image settles. */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* the square the five shapes fit inside, and the block's
   own width */
const W = 276;
const GAP = 16;
const BAR = 36;

const SHAPES = [
  { id: "square", w: 207, h: 207, name: "Square", ratio: "1:1", label: "Square, 1 by 1" },
  { id: "portrait", w: 179, h: 239, name: "Portrait", ratio: "3:4", label: "Portrait, 3 by 4" },
  { id: "story", w: 155, h: 276, name: "Story", ratio: "9:16", label: "Story, 9 by 16" },
  { id: "land", w: 239, h: 179, name: "Landscape", ratio: "4:3", label: "Landscape, 4 by 3" },
  { id: "wide", w: 276, h: 155, name: "Widescreen", ratio: "16:9", label: "Widescreen, 16 by 9" },
] as const;

/* ── the icons are the shapes ──────────────────────────────
   Drawn rather than imported, and lucide does ship a
   rectangle in each orientation. The reason not to use them
   is that here the icon is not a symbol FOR the format, it
   IS the format — so it has to be at the real ratio, and
   lucide's rectangles are at whatever ratio looked right in
   a 24 grid.

   Same constant area (144 px²) across all five formats, for
   the same reason: marks of visibly different size would say
   the formats are different sizes, which is the thing the
   block is at pains to say they are not. */
const MARK = {
  square: { x: 3, y: 3, w: 12, h: 12 },
  portrait: { x: 3.8, y: 2.08, w: 10.4, h: 13.85 },
  story: { x: 4.5, y: 1, w: 9, h: 16 },
  land: { x: 2.08, y: 3.8, w: 13.85, h: 10.4 },
  wide: { x: 1, y: 4.5, w: 16, h: 9 },
} as const;

const BASE = 520;
const SPHERE_SIZE = 84;

interface SpherePoint {
  x: number;
  y: number;
  z: number;
  size: number;
  phase: number;
  jitter: number;
}

/**
 * Crisp 3D rotating white particle sphere rendered while the morphed
 * aspect ratio resolves into focus.
 */
function ParticleSphere({
  seed,
  durationMs,
}: {
  seed: number;
  durationMs: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SPHERE_SIZE * dpr;
    canvas.height = SPHERE_SIZE * dpr;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const count = 760;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const points: SpherePoint[] = Array.from({ length: count }, (_, i) => {
      const y = 1 - (i / (count - 1)) * 2;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i + seed * 0.65;
      const shell = 0.86 + ((i * 53) % 17) * 0.01;
      return {
        x: Math.cos(theta) * rAtY * shell,
        y: y * shell,
        z: Math.sin(theta) * rAtY * shell,
        size: 0.55 + ((i * 19) % 10) * 0.065,
        phase: (i * 0.37) % (Math.PI * 2),
        jitter: ((i * 31) % 11) * 0.015,
      };
    });

    const start = performance.now();
    let rafId = 0;

    const renderFrame = (now: number) => {
      const elapsed = now - start;
      const raw = clamp(elapsed / Math.max(400, durationMs), 0, 1);

      const envelope = reducedMotion
        ? 0.92
        : raw < 0.14
          ? raw / 0.14
          : raw > 0.82
            ? Math.max(0, 1 - (raw - 0.82) / 0.18)
            : 1;

      const scaleIn = reducedMotion ? 1 : 0.86 + 0.14 * Math.min(1, raw / 0.18);
      const radius = SPHERE_SIZE * 0.42 * scaleIn;
      const cx = SPHERE_SIZE / 2;
      const cy = SPHERE_SIZE / 2;

      const angleY = reducedMotion ? 0.35 : elapsed * 0.0013;
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const tiltX = 0.24;
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SPHERE_SIZE, SPHERE_SIZE);

      /* Subtle radial depth shadow behind the sphere so white points stay crisp */
      const backdrop = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.18);
      backdrop.addColorStop(0, `rgba(14, 16, 20, ${(0.3 * envelope).toFixed(3)})`);
      backdrop.addColorStop(0.68, `rgba(14, 16, 20, ${(0.14 * envelope).toFixed(3)})`);
      backdrop.addColorStop(1, "rgba(14, 16, 20, 0)");
      ctx.fillStyle = backdrop;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      for (const p of points) {
        /* 3D rotation around Y then tilt around X */
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const perspective = 2.6 / (2.6 - z2 * 0.65);
        const px = cx + x1 * radius * perspective;
        const py = cy + y2 * radius * perspective;

        /* Emphasize depth + rim glow while keeping center light & airy */
        const depthFade = clamp(0.28 + (z2 + 1) * 0.36, 0.2, 1);
        const rimBoost = clamp(Math.hypot(x1, y2) * 0.48 + 0.52, 0.5, 1);
        const twinkle = reducedMotion
          ? 0.9
          : 0.72 + 0.28 * Math.sin(elapsed * 0.005 + p.phase);
        const alpha = clamp(
          envelope * depthFade * rimBoost * twinkle * (0.85 + p.jitter),
          0,
          1
        );
        if (alpha <= 0.02) continue;

        const dotSize = p.size * (0.82 + (z2 + 1) * 0.18);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotion && raw < 1) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [seed, durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className="asp-sphere"
      aria-label="Generating image"
      role="status"
    />
  );
}

export interface AspectRatioProps {
  corner?: number;
  /* how quickly the frame changes shape, 0..100 — 50 is the
     tuned 520ms */
  morph?: number;
  src?: string;
}

export function AspectRatio({
  corner = 20,
  /* how quickly the frame changes shape, 0..100 — 50 is the
     tuned 520ms */
  morph = 50,
  src = SHEEP,
}: AspectRatioProps = {}) {
  const [at, setAt] = useState(3);
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genSeed, setGenSeed] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const genTimer = useRef(0);

  const numericCorner = Number.isFinite(Number(corner)) ? Number(corner) : 20;
  const numericMorph = Number.isFinite(Number(morph)) ? Number(morph) : 50;
  const ms = Math.round(BASE * rate(clamp(numericMorph, 0, 100)));
  const genMs = Math.round(clamp(3500 * rate(clamp(numericMorph, 0, 100)), 2800, 4200));
  const shape = SHAPES[at];
  const activeMark = MARK[shape.id];

  useEffect(() => () => window.clearTimeout(genTimer.current), []);

  // Close the aspect ratio popover on outside pointer press
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node | null)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const pick = (i: number, closeAfter = true) => {
    if (closeAfter) setOpen(false);
    if (i === at) return;

    setAt(i);
    window.clearTimeout(genTimer.current);
    setGenerating(true);
    setGenSeed((s) => s + 1);
    genTimer.current = window.setTimeout(() => {
      setGenerating(false);
    }, genMs);
  };

  /* ── keyboard navigation for the popover radio list ──────
     Arrows move directly through the five aspect ratios when
     focused either on the closed trigger or inside the open list;
     Escape closes the popover and returns focus to the trigger. */
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const d =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!d) return;
    e.preventDefault();
    const next = (at + d + SHAPES.length) % SHAPES.length;
    pick(next, false);
    if (open) {
      optionRefs.current[next]?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className="asp"
      style={{
        width: W,
        height: W + GAP + BAR,
        ["--asp-ms" as string]: `${ms}ms`,
        ["--asp-gen-ms" as string]: `${genMs}ms`,
      }}
    >
      {/* The stage is the full square and never changes, so
          the picture is centred in a box that is not moving.
          Sizing the stage to the picture instead would make
          the control below climb and drop as the shape changed. */}
      <div className="asp-stage" style={{ height: W }}>
        {/* ── width and height, NEVER a scale ─────────────
            The same rule the detail overlay's block follows,
            for the same reason: a scaled box drags its corner
            radius with it, and the corner has to read as the
            same rounded frame throughout rather than as a
            rectangle being stretched. `cover` is what keeps
            the picture itself undistorted while the frame
            moves — so this reads as a crop changing, which is
            what it is, rather than as an image being
            squashed. */}
        <div
          className="asp-pic"
          data-generating={generating ? "true" : undefined}
          style={{
            width: shape.w,
            height: shape.h,
            borderRadius: clamp(numericCorner, 0, 40),
          }}
        >
          <div
            key={genSeed}
            className="asp-media"
            data-generating={generating ? "true" : undefined}
            style={{
              backgroundImage: src ? `url(${src})` : undefined,
            }}
          />
          {generating && (
            <>
              <div
                key={`sheen-${genSeed}`}
                className="asp-sheen"
                aria-hidden="true"
              />
              <ParticleSphere
                key={`sphere-${genSeed}`}
                seed={genSeed}
                durationMs={genMs}
              />
            </>
          )}
        </div>
      </div>

      {/* Bottom Aspect Ratio Trigger + Floating Light Glass Popover */}
      <div className="asp-picker" onKeyDown={onMenuKeyDown}>
        <div
          className="asp-menu"
          role="radiogroup"
          aria-label="Aspect ratio"
          data-open={open ? "true" : undefined}
          hidden={!open}
        >
          {SHAPES.map((s, i) => {
            const m = MARK[s.id];
            const selected = i === at;
            return (
              <button
                key={s.id}
                type="button"
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                className="asp-opt"
                role="radio"
                aria-checked={selected}
                aria-label={s.label}
                tabIndex={selected ? 0 : -1}
                onClick={() => pick(i, true)}
              >
                <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
                  <rect
                    x={m.x}
                    y={m.y}
                    width={m.w}
                    height={m.h}
                    rx={2}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  />
                </svg>
                <span className="asp-opt-name">{s.name}</span>
                <span className="asp-opt-ratio">{s.ratio}</span>
              </button>
            );
          })}
        </div>

        <button
          ref={triggerRef}
          type="button"
          className="asp-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Aspect ratio: ${shape.name} ${shape.ratio}`}
          onClick={() => {
            const nextOpen = !open;
            setOpen(nextOpen);
            if (nextOpen) {
              requestAnimationFrame(() => optionRefs.current[at]?.focus());
            }
          }}
        >
          <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
            <rect
              x={activeMark.x}
              y={activeMark.y}
              width={activeMark.w}
              height={activeMark.h}
              rx={2}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            />
          </svg>
          <span className="asp-trigger-name">{shape.name}</span>
          <span className="asp-trigger-ratio">{shape.ratio}</span>
          <svg
            className="asp-trigger-caret"
            width={14}
            height={14}
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M4.5 9.75 8 6.25l3.5 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export { AspectRatio as Aspect };
export default AspectRatio;
