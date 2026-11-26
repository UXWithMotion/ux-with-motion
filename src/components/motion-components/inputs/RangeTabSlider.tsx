"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";

export interface RangeTabSliderProps {
  /** Minimum slider value (default: 0) */
  min?: number;
  /** Maximum slider value (default: 7) */
  max?: number;
  /** Initial uncontrolled value (default: 4.7, matching the reference state) */
  defaultValue?: number;
  /** Controlled value */
  value?: number;
  /** Callback fired when value changes */
  onChange?: (value: number) => void;
  /** Optional extra CSS classes */
  className?: string;
}

const TRACK_WIDTH = 328;
const TRACK_HEIGHT = 44;
const TRACK_RADIUS = TRACK_HEIGHT / 2;
const TRACK_PAD = 2;
const THUMB_WIDTH = 44;
const THUMB_HEIGHT = TRACK_HEIGHT - TRACK_PAD * 2;
const MIN_CENTER_X = TRACK_PAD + THUMB_WIDTH / 2;
const MAX_CENTER_X = TRACK_WIDTH - TRACK_PAD - THUMB_WIDTH / 2;
const TRAVEL_SPAN = MAX_CENTER_X - MIN_CENTER_X;

const TAB_SVG_HEIGHT = 29;
const TAB_FILL = "#F5F5F5";
const TRACK_BG = "#F5F5F5";
const TRACK_BLUE = "#0072FB";

const TICKS = [0, 1 / 3, 2 / 3, 1];

type IntensityTier = {
  label: string;
  tabWidth: number;
};

function getTierInfo(ratio: number): IntensityTier {
  if (ratio < 0.25) return { label: "Low", tabWidth: 78 };
  if (ratio < 0.52) return { label: "Medium", tabWidth: 104 };
  if (ratio < 0.82) return { label: "High", tabWidth: 84 };
  return { label: "Extra High", tabWidth: 122 };
}

/**
 * Builds a crisp vector SVG path for the attached top value tab
 * with smooth concave feet resting flush along the pill track top edge.
 */
function buildAttachedTabPath(
  cx: number,
  bodyWidth: number,
  height: number,
  radiusScale: number
): string {
  const halfW = bodyWidth / 2;
  const rTop = Math.min(12.5, halfW) * radiusScale;
  const flare = (radiusScale > 0.04 ? 11 : 0) * radiusScale;
  const left = cx - halfW;
  const right = cx + halfW;
  const footLeft = left - flare;
  const footRight = right + flare;
  const topY = 0.5;
  const botY = height;
  const midY = botY - 10.5;

  if (radiusScale <= 0.04) {
    return `M ${left} ${botY} L ${left} ${topY} L ${right} ${topY} L ${right} ${botY} Z`;
  }

  return [
    `M ${footLeft} ${botY}`,
    `C ${footLeft + flare * 0.58} ${botY}, ${left} ${botY - 2.5}, ${left} ${midY}`,
    `L ${left} ${topY + rTop}`,
    `Q ${left} ${topY}, ${left + rTop} ${topY}`,
    `L ${right - rTop} ${topY}`,
    `Q ${right} ${topY}, ${right} ${topY + rTop}`,
    `L ${right} ${midY}`,
    `C ${right} ${botY - 2.5}, ${footRight - flare * 0.58} ${botY}, ${footRight} ${botY}`,
    "Z",
  ].join(" ");
}

function clamp(v: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, v));
}

export function RangeTabSlider({
  min = 0,
  max = 7,
  defaultValue = 4.7,
  value: controlledValue,
  onChange,
  className = "",
}: RangeTabSliderProps) {
  const [internalValue, setInternalValue] = useState<number>(() =>
    clamp(defaultValue, min, max)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [radiusScale, setRadiusScale] = useState(1);

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const blueFillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const tabPathRef = useRef<SVGPathElement>(null);
  const tabTextRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const currentValue =
    controlledValue !== undefined
      ? clamp(controlledValue, min, max)
      : internalValue;
  const span = Math.max(0.0001, max - min);
  const ratio = clamp((currentValue - min) / span, 0, 1);
  const tier = getTierInfo(ratio);

  const rawCenterX = MIN_CENTER_X + ratio * TRAVEL_SPAN;
  const flarePad = (radiusScale > 0.04 ? 11 : 0) * radiusScale;
  const minTabCx = TRACK_RADIUS + tier.tabWidth / 2 + flarePad;
  const maxTabCx = TRACK_WIDTH - TRACK_RADIUS - tier.tabWidth / 2 - flarePad;
  const clampedTabCx = clamp(
    rawCenterX,
    Math.min(minTabCx, TRACK_WIDTH / 2),
    Math.max(maxTabCx, TRACK_WIDTH / 2)
  );

  const targetThumbX = useMotionValue(rawCenterX);
  const targetTabCx = useMotionValue(clampedTabCx);
  const targetTabW = useMotionValue(tier.tabWidth);

  const springConfig = isDragging
    ? { stiffness: 480, damping: 38, mass: 0.4 }
    : { stiffness: 260, damping: 28, mass: 0.75 };

  const animThumbX = useSpring(targetThumbX, springConfig);
  const animTabCx = useSpring(targetTabCx, { stiffness: 240, damping: 28, mass: 0.75 });
  const animTabW = useSpring(targetTabW, { stiffness: 260, damping: 27, mass: 0.7 });

  useEffect(() => {
    targetThumbX.set(rawCenterX);
    targetTabCx.set(clampedTabCx);
    targetTabW.set(tier.tabWidth);
  }, [rawCenterX, clampedTabCx, tier.tabWidth, targetThumbX, targetTabCx, targetTabW]);

  // Sync rounded edge scale with RoundedEdgePreviewWrapper (--uxm-radius-scale)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const readScale = () => {
      const raw = window
        .getComputedStyle(el)
        .getPropertyValue("--uxm-radius-scale")
        .trim();
      if (!raw) {
        setRadiusScale(1);
        return;
      }
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        setRadiusScale(clamp(parsed, 0, 1));
      }
    };

    readScale();

    const parent = el.parentElement;
    if (!parent || typeof MutationObserver === "undefined") return;

    const observer = new MutationObserver(readScale);
    observer.observe(parent, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  const syncVisuals = useCallback(
    (thumbCx: number, tabCx: number, tabW: number, rScale: number) => {
      const thumbLeft = thumbCx - THUMB_WIDTH / 2;
      const blueWidth = clamp(
        thumbLeft + THUMB_WIDTH + TRACK_PAD,
        THUMB_WIDTH + TRACK_PAD * 2,
        TRACK_WIDTH
      );

      if (thumbRef.current) {
        thumbRef.current.style.transform = `translate3d(${thumbLeft.toFixed(2)}px, 0, 0)`;
      }
      if (blueFillRef.current) {
        blueFillRef.current.style.width = `${blueWidth.toFixed(2)}px`;
      }
      if (tabPathRef.current) {
        tabPathRef.current.setAttribute(
          "d",
          buildAttachedTabPath(tabCx, tabW, TAB_SVG_HEIGHT, rScale)
        );
      }
      if (tabTextRef.current) {
        tabTextRef.current.style.transform = `translate3d(${tabCx.toFixed(2)}px, 0, 0) translateX(-50%)`;
        tabTextRef.current.style.width = `${tabW.toFixed(1)}px`;
      }

      TICKS.forEach((t, idx) => {
        const tickEl = tickRefs.current[idx];
        if (!tickEl) return;
        const tickX = MIN_CENTER_X + t * TRAVEL_SPAN;
        const underThumb = Math.abs(tickX - thumbCx) < THUMB_WIDTH * 0.42;
        const insideBlue = tickX <= blueWidth - 4;
        if (underThumb) {
          tickEl.style.opacity = "0";
        } else {
          tickEl.style.opacity = "1";
          tickEl.style.backgroundColor = insideBlue ? "rgba(0, 40, 118, 0.26)" : "#BDBDBD";
        }
      });
    },
    []
  );

  useMotionValueEvent(animThumbX, "change", (hx) => {
    syncVisuals(hx, animTabCx.get(), animTabW.get(), radiusScale);
  });
  useMotionValueEvent(animTabCx, "change", (cx) => {
    syncVisuals(animThumbX.get(), cx, animTabW.get(), radiusScale);
  });
  useMotionValueEvent(animTabW, "change", (w) => {
    syncVisuals(animThumbX.get(), animTabCx.get(), w, radiusScale);
  });

  useEffect(() => {
    syncVisuals(animThumbX.get(), animTabCx.get(), animTabW.get(), radiusScale);
  }, [radiusScale, animThumbX, animTabCx, animTabW, syncVisuals]);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      const localX = clientX - rect.left;
      const clampedX = clamp(localX, MIN_CENTER_X, MAX_CENTER_X);
      const nextRatio = (clampedX - MIN_CENTER_X) / TRAVEL_SPAN;
      const nextVal = Number((min + nextRatio * span).toFixed(1));
      if (controlledValue === undefined) {
        setInternalValue(nextVal);
      }
      onChange?.(nextVal);
    },
    [min, span, controlledValue, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    updateFromClientX(e.clientX);

    const onMove = (ev: PointerEvent) => {
      updateFromClientX(ev.clientX);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = span / 50;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = clamp(currentValue + step, min, max);
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = clamp(currentValue - step, min, max);
    if (e.key === "Home") next = min;
    if (e.key === "End") next = max;
    if (next === null) return;
    e.preventDefault();
    const rounded = Number(next.toFixed(1));
    if (controlledValue === undefined) {
      setInternalValue(rounded);
    }
    onChange?.(rounded);
  };

  const initialBlueWidth = clamp(
    rawCenterX + THUMB_WIDTH / 2 + TRACK_PAD,
    THUMB_WIDTH + TRACK_PAD * 2,
    TRACK_WIDTH
  );

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex flex-col items-center pt-[29px] select-none ${className}`}
    >
      <div
        className="relative"
        style={{ width: `${TRACK_WIDTH}px`, height: `${TRACK_HEIGHT}px` }}
      >
        {/* Crisp Attached Top Label Tab */}
        <svg
          width={TRACK_WIDTH}
          height={TAB_SVG_HEIGHT}
          viewBox={`0 0 ${TRACK_WIDTH} ${TAB_SVG_HEIGHT}`}
          fill="none"
          shapeRendering="geometricPrecision"
          aria-hidden="true"
          className="absolute left-0 pointer-events-none overflow-visible"
          style={{ top: `${-(TAB_SVG_HEIGHT - 1)}px` }}
        >
          <path
            ref={tabPathRef}
            d={buildAttachedTabPath(clampedTabCx, tier.tabWidth, TAB_SVG_HEIGHT, radiusScale)}
            fill={TAB_FILL}
          />
        </svg>

        {/* Top Tab Label Readout */}
        <div
          ref={tabTextRef}
          aria-hidden="true"
          style={{
            top: `${-(TAB_SVG_HEIGHT - 2)}px`,
            width: `${tier.tabWidth}px`,
            height: `${TAB_SVG_HEIGHT - 2}px`,
            transform: `translate3d(${clampedTabCx.toFixed(2)}px, 0, 0) translateX(-50%)`,
          }}
          className="absolute left-0 flex items-center justify-center gap-[5px] pointer-events-none"
        >
          <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14.5px] leading-none text-[#161616] tabular-nums">
            {currentValue.toFixed(1)}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={tier.label}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14.5px] leading-none text-[#A4A4A4] whitespace-nowrap"
            >
              {tier.label}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Main Interactive Pill Track */}
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Intensity level"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentValue}
          aria-valuetext={`${currentValue.toFixed(1)} ${tier.label}`}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          style={{
            width: `${TRACK_WIDTH}px`,
            height: `${TRACK_HEIGHT}px`,
            backgroundColor: TRACK_BG,
          }}
          className={`relative rounded-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#0072FB]/40 touch-none ${
            isDragging ? "cursor-grabbing" : "cursor-pointer"
          }`}
        >
          {/* Active Blue Progress Pill */}
          <div
            ref={blueFillRef}
            style={{
              width: `${initialBlueWidth}px`,
              backgroundColor: TRACK_BLUE,
            }}
            className="absolute left-0 top-0 bottom-0 rounded-full pointer-events-none"
          />

          {/* Four Equidistant Track Step Ticks */}
          {TICKS.map((t, idx) => {
            const leftPx = MIN_CENTER_X + t * TRAVEL_SPAN;
            const underThumb = Math.abs(leftPx - rawCenterX) < THUMB_WIDTH * 0.42;
            const insideBlue = leftPx <= initialBlueWidth - 4;
            return (
              <span
                key={t}
                ref={(el) => {
                  tickRefs.current[idx] = el;
                }}
                aria-hidden="true"
                style={{
                  left: `${leftPx}px`,
                  opacity: underThumb ? 0 : 1,
                  backgroundColor: insideBlue ? "rgba(0, 40, 118, 0.26)" : "#BDBDBD",
                }}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1.5px] h-[10px] rounded-full pointer-events-none transition-opacity duration-150"
              />
            );
          })}

          {/* Crisp White Pill Handle with Center Grip Line */}
          <div
            ref={thumbRef}
            style={{
              width: `${THUMB_WIDTH}px`,
              height: `${THUMB_HEIGHT}px`,
              top: `${TRACK_PAD}px`,
              transform: `translate3d(${(rawCenterX - THUMB_WIDTH / 2).toFixed(2)}px, 0, 0)`,
            }}
            className="absolute left-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center pointer-events-none"
          >
            <span
              aria-hidden="true"
              className="w-[1.5px] h-[11px] rounded-full bg-[#7C7C7A]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RangeTabSlider;
