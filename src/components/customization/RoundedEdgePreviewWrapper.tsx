"use client";

import React, { useLayoutEffect, useEffect, useRef } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const ROUNDED_EDGE_KEY = "rounded_edge";
export const ROUNDED_EDGE_DEFAULT = 100;

export function getRoundedEdgePercent(overrides?: Record<string, string>): number {
  const raw = overrides?.[ROUNDED_EDGE_KEY];
  if (raw === undefined || raw === null || raw === "") return ROUNDED_EDGE_DEFAULT;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return ROUNDED_EDGE_DEFAULT;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function buildSquirclePath(
  width: number,
  height: number,
  cornerRadius: number,
  cornerSmoothing = 1.0,
  inset = 0
): string {
  const w = Math.max(1, width - inset * 2);
  const h = Math.max(1, height - inset * 2);
  const budget = Math.min(w, h) / 2;
  const r = Math.min(Math.max(cornerRadius - inset, 0), budget);

  if (r <= 0.15) {
    const x1 = inset.toFixed(3);
    const y1 = inset.toFixed(3);
    const x2 = (w + inset).toFixed(3);
    const y2 = (h + inset).toFixed(3);
    return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`;
  }

  let p = (1 + cornerSmoothing) * r;
  const maxSmoothing = budget / r - 1;
  const smoothing = Math.min(cornerSmoothing, Math.max(0, maxSmoothing));
  p = Math.min(p, budget);

  const arcMeasure = 90 * (1 - smoothing);
  const arcSectionLength = Math.sin(toRadians(arcMeasure / 2)) * r * Math.sqrt(2);
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4Distance = r * Math.tan(toRadians(angleAlpha / 2));
  const angleBeta = 45 * smoothing;
  const c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));
  const b = (p - arcSectionLength - c - d) / 3;
  const a = 2 * b;

  const aStr = a.toFixed(3);
  const cStr = c.toFixed(3);
  const dStr = d.toFixed(3);
  const arc = arcSectionLength.toFixed(3);
  const apb = (a + b).toFixed(3);
  const apbpc = (a + b + c).toFixed(3);
  const bpc = (b + c).toFixed(3);

  const startX = (w - p + inset).toFixed(3);
  const startY = inset.toFixed(3);
  const rightX = (w + inset).toFixed(3);
  const bottomY = (h + inset).toFixed(3);
  const leftX = inset.toFixed(3);
  const bottomStartY = (h - p + inset).toFixed(3);
  const leftBottomX = (p + inset).toFixed(3);
  const leftTopY = (p + inset).toFixed(3);

  return (
    `M ${startX} ${startY} ` +
    `c ${aStr} 0 ${apb} 0 ${apbpc} ${dStr} ` +
    `a ${r.toFixed(3)} ${r.toFixed(3)} 0 0 1 ${arc} ${arc} ` +
    `c ${dStr} ${cStr} ${dStr} ${bpc} ${dStr} ${apbpc} ` +
    `L ${rightX} ${bottomStartY} ` +
    `c 0 ${aStr} 0 ${apb} -${dStr} ${apbpc} ` +
    `a ${r.toFixed(3)} ${r.toFixed(3)} 0 0 1 -${arc} ${arc} ` +
    `c -${cStr} ${dStr} -${bpc} ${dStr} -${apbpc} ${dStr} ` +
    `L ${leftBottomX} ${bottomY} ` +
    `c -${aStr} 0 -${apb} 0 -${apbpc} -${dStr} ` +
    `a ${r.toFixed(3)} ${r.toFixed(3)} 0 0 1 -${arc} -${arc} ` +
    `c -${dStr} -${cStr} -${dStr} -${bpc} -${dStr} -${apbpc} ` +
    `L ${leftX} ${leftTopY} ` +
    `c 0 -${aStr} 0 -${apb} ${dStr} -${apbpc} ` +
    `a ${r.toFixed(3)} ${r.toFixed(3)} 0 0 1 ${arc} -${arc} ` +
    `c ${cStr} -${dStr} ${bpc} -${dStr} ${apbpc} -${dStr} Z`
  );
}

// Matches Figma squircle path signature produced by getSquirclePath()
const SQUIRCLE_SIGNATURE_RE =
  /^M\s+([\d.]+)\s+([\d.]+)\s+c\s+[\d.-]+\s+0\s+[\d.-]+\s+0\s+[\d.-]+\s+[\d.-]+\s+a\s+([\d.]+)\s+([\d.]+)\s+0\s+0\s+1/;

interface ElementRadiusState {
  origTL: string;
  origTR: string;
  origBR: string;
  origBL: string;
  origClipPath: string;
  baseTL: number;
  baseTR: number;
  baseBR: number;
  baseBL: number;
  lastAppliedTL?: string;
  lastAppliedTR?: string;
  lastAppliedBR?: string;
  lastAppliedBL?: string;
  lastAppliedClip?: string;
  clipMeta?: {
    cornerRadius: number;
    inset: number;
  } | null;
}

interface SvgPathState {
  origD: string;
  lastAppliedD?: string;
  cornerRadius: number;
  inset: number;
}

function parseRadiusPx(value: string, sizeRef: number): number {
  if (!value) return 0;
  const trimmed = value.trim().split(/\s+/)[0];
  if (trimmed.endsWith("%")) {
    const pct = parseFloat(trimmed);
    return Number.isFinite(pct) && sizeRef > 0 ? (pct / 100) * sizeRef : 0;
  }
  const num = parseFloat(trimmed);
  return Number.isFinite(num) ? num : 0;
}

function clampToBox(px: number, w: number, h: number): number {
  if (px <= 0) return 0;
  if (w > 0 && h > 0) {
    return Math.min(px, Math.min(w, h) / 2);
  }
  return px;
}

export interface RoundedEdgePreviewWrapperProps {
  roundedEdge: number;
  styleOverrides?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

export function RoundedEdgePreviewWrapper({
  roundedEdge = ROUNDED_EDGE_DEFAULT,
  styleOverrides,
  className = "",
  children,
}: RoundedEdgePreviewWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elStatesRef = useRef(new WeakMap<HTMLElement, ElementRadiusState>());
  const svgStatesRef = useRef(new WeakMap<SVGPathElement, SvgPathState>());
  const isApplyingRef = useRef(false);
  const hasAppliedRef = useRef(false);
  const scale = Math.min(1, Math.max(0, roundedEdge / 100));

  useIsomorphicLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Fast no-op path at 100% default when no overrides have been applied yet
    if (scale >= 1 && !hasAppliedRef.current) {
      return;
    }

    const elStates = elStatesRef.current;
    const svgStates = svgStatesRef.current;

    let observer: MutationObserver | null = null;
    let scheduledRaf = 0;

    const applyToTree = () => {
      if (isApplyingRef.current) return;
      isApplyingRef.current = true;
      if (scale < 1) {
        hasAppliedRef.current = true;
      }

      try {
        // 1. Scale HTML element CSS border-radius & squircle clip-paths
        const htmlNodes = root.querySelectorAll<HTMLElement>("*");
        htmlNodes.forEach((el) => {
          if (el instanceof SVGElement) return;

          const w = el.offsetWidth;
          const h = el.offsetHeight;
          const refDim = w > 0 && h > 0 ? Math.min(w, h) : 0;
          let state = elStates.get(el);

          if (!state) {
            const cs = window.getComputedStyle(el);
            const rawTL = parseRadiusPx(cs.borderTopLeftRadius, refDim);
            const rawTR = parseRadiusPx(cs.borderTopRightRadius, refDim);
            const rawBR = parseRadiusPx(cs.borderBottomRightRadius, refDim);
            const rawBL = parseRadiusPx(cs.borderBottomLeftRadius, refDim);

            const clipStr = el.style.clipPath || "";
            let clipMeta: ElementRadiusState["clipMeta"] = null;
            const pathMatch = clipStr.match(/^path\(['"](.+)['"]\)$/);
            if (pathMatch) {
              const sig = pathMatch[1].match(SQUIRCLE_SIGNATURE_RE);
              if (sig) {
                const inset = parseFloat(sig[2]) || 0;
                const arcR = parseFloat(sig[3]) || 0;
                clipMeta = { cornerRadius: arcR + inset, inset };
              }
            }

            state = {
              origTL: el.style.borderTopLeftRadius,
              origTR: el.style.borderTopRightRadius,
              origBR: el.style.borderBottomRightRadius,
              origBL: el.style.borderBottomLeftRadius,
              origClipPath: clipStr,
              baseTL: rawTL,
              baseTR: rawTR,
              baseBR: rawBR,
              baseBL: rawBL,
              clipMeta,
            };
            elStates.set(el, state);
          } else {
            // Detect external updates (e.g. Framer Motion animate={{ borderRadius }} or dynamic clipPath)
            const curInlineTL = el.style.borderTopLeftRadius;
            if (curInlineTL && curInlineTL !== state.lastAppliedTL) {
              state.origTL = curInlineTL;
              state.baseTL = parseRadiusPx(curInlineTL, refDim);
            }
            const curInlineTR = el.style.borderTopRightRadius;
            if (curInlineTR && curInlineTR !== state.lastAppliedTR) {
              state.origTR = curInlineTR;
              state.baseTR = parseRadiusPx(curInlineTR, refDim);
            }
            const curInlineBR = el.style.borderBottomRightRadius;
            if (curInlineBR && curInlineBR !== state.lastAppliedBR) {
              state.origBR = curInlineBR;
              state.baseBR = parseRadiusPx(curInlineBR, refDim);
            }
            const curInlineBL = el.style.borderBottomLeftRadius;
            if (curInlineBL && curInlineBL !== state.lastAppliedBL) {
              state.origBL = curInlineBL;
              state.baseBL = parseRadiusPx(curInlineBL, refDim);
            }

            const curClip = el.style.clipPath || "";
            if (curClip && curClip !== state.lastAppliedClip) {
              state.origClipPath = curClip;
              const pathMatch = curClip.match(/^path\(['"](.+)['"]\)$/);
              if (pathMatch) {
                const sig = pathMatch[1].match(SQUIRCLE_SIGNATURE_RE);
                if (sig) {
                  const inset = parseFloat(sig[2]) || 0;
                  const arcR = parseFloat(sig[3]) || 0;
                  state.clipMeta = { cornerRadius: arcR + inset, inset };
                }
              }
            }
          }

          if (scale >= 1) {
            if (state.lastAppliedTL !== undefined) {
              el.style.borderTopLeftRadius = state.origTL;
              el.style.borderTopRightRadius = state.origTR;
              el.style.borderBottomRightRadius = state.origBR;
              el.style.borderBottomLeftRadius = state.origBL;
              state.lastAppliedTL = undefined;
              state.lastAppliedTR = undefined;
              state.lastAppliedBR = undefined;
              state.lastAppliedBL = undefined;
            }
            if (state.lastAppliedClip !== undefined) {
              el.style.clipPath = state.origClipPath;
              state.lastAppliedClip = undefined;
            }
          } else {
            const tl = clampToBox(state.baseTL, w, h);
            const tr = clampToBox(state.baseTR, w, h);
            const br = clampToBox(state.baseBR, w, h);
            const bl = clampToBox(state.baseBL, w, h);

            if (tl > 0 || tr > 0 || br > 0 || bl > 0) {
              const sTL = `${Number((tl * scale).toFixed(2))}px`;
              const sTR = `${Number((tr * scale).toFixed(2))}px`;
              const sBR = `${Number((br * scale).toFixed(2))}px`;
              const sBL = `${Number((bl * scale).toFixed(2))}px`;
              if (el.style.borderTopLeftRadius !== sTL) el.style.borderTopLeftRadius = sTL;
              if (el.style.borderTopRightRadius !== sTR) el.style.borderTopRightRadius = sTR;
              if (el.style.borderBottomRightRadius !== sBR) el.style.borderBottomRightRadius = sBR;
              if (el.style.borderBottomLeftRadius !== sBL) el.style.borderBottomLeftRadius = sBL;
              state.lastAppliedTL = el.style.borderTopLeftRadius;
              state.lastAppliedTR = el.style.borderTopRightRadius;
              state.lastAppliedBR = el.style.borderBottomRightRadius;
              state.lastAppliedBL = el.style.borderBottomLeftRadius;
            }

            if (state.clipMeta && w > 0 && h > 0) {
              const scaledClip = `path("${buildSquirclePath(
                w,
                h,
                state.clipMeta.cornerRadius * scale,
                1.0,
                state.clipMeta.inset
              )}")`;
              if (el.style.clipPath !== scaledClip) {
                el.style.clipPath = scaledClip;
              }
              state.lastAppliedClip = el.style.clipPath;
            }
          }
        });

        // 2. Scale SVG squircle stroke paths (only those matching getSquirclePath signature)
        const svgPaths = root.querySelectorAll<SVGPathElement>("svg path");
        svgPaths.forEach((pathEl) => {
          const d = pathEl.getAttribute("d") || "";
          let pState = svgStates.get(pathEl);

          if (!pState) {
            const sig = d.match(SQUIRCLE_SIGNATURE_RE);
            if (!sig) return;
            const inset = parseFloat(sig[2]) || 0;
            const arcR = parseFloat(sig[3]) || 0;
            pState = {
              origD: d,
              cornerRadius: arcR + inset,
              inset,
            };
            svgStates.set(pathEl, pState);
          } else if (d && d !== pState.lastAppliedD) {
            const sig = d.match(SQUIRCLE_SIGNATURE_RE);
            if (sig) {
              const inset = parseFloat(sig[2]) || 0;
              const arcR = parseFloat(sig[3]) || 0;
              pState.origD = d;
              pState.cornerRadius = arcR + inset;
              pState.inset = inset;
            }
          }

          if (scale >= 1) {
            if (pState.lastAppliedD !== undefined) {
              if (d !== pState.origD) {
                pathEl.setAttribute("d", pState.origD);
              }
              pState.lastAppliedD = undefined;
            }
          } else {
            const svg = pathEl.ownerSVGElement;
            const vb = svg?.viewBox?.baseVal;
            const w = vb && vb.width > 0 ? vb.width : svg?.clientWidth || 0;
            const h = vb && vb.height > 0 ? vb.height : svg?.clientHeight || 0;
            if (w > 0 && h > 0) {
              const nextD = buildSquirclePath(
                w,
                h,
                pState.cornerRadius * scale,
                1.0,
                pState.inset
              );
              if (d !== nextD) {
                pathEl.setAttribute("d", nextD);
              }
              pState.lastAppliedD = nextD;
            }
          }
        });
      } finally {
        observer?.takeRecords();
        isApplyingRef.current = false;
      }
    };

    const scheduleApply = () => {
      if (scheduledRaf) return;
      scheduledRaf = requestAnimationFrame(() => {
        scheduledRaf = 0;
        if (!isApplyingRef.current) {
          applyToTree();
        }
      });
    };

    observer = new MutationObserver(() => {
      if (!isApplyingRef.current && scale < 1) {
        scheduleApply();
      }
    });

    applyToTree();

    if (scale < 1) {
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "d"],
      });
    } else {
      hasAppliedRef.current = false;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!isApplyingRef.current && scale < 1) {
        scheduleApply();
      }
    });
    if (scale < 1) {
      resizeObserver.observe(root);
    }

    return () => {
      if (scheduledRaf) cancelAnimationFrame(scheduledRaf);
      observer?.disconnect();
      resizeObserver.disconnect();
    };
  }, [scale]);

  return (
    <div
      ref={containerRef}
      style={
        {
          ...styleOverrides,
          "--uxm-radius-scale": String(scale),
        } as React.CSSProperties
      }
      className={className}
    >
      {children}
    </div>
  );
}
