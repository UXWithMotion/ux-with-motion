"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";

export type SlideToConfirmStage = "idle" | "filled" | "confirmed";

export interface SlideToConfirmProps {
  /** The text displayed in the track before sliding */
  label?: string;
  /** The text displayed alongside the checkmark upon confirmation */
  confirmedLabel?: string;
  /** Callback fired when the slider is dragged past the threshold and confirmed */
  onConfirm?: () => void;
  /** Callback fired when the slider is reset back to idle */
  onReset?: () => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Optional extra CSS classes for the container */
  className?: string;
  /** Optional delay in milliseconds to automatically reset after confirmation */
  autoResetMs?: number;
}

/**
 * Arrow icon extracted directly from Figma node 2514:11438 (Vector 2514:11352 & 2514:11353)
 */
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4.16667 10H15.8333"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 4.16667L15.8333 10L10 15.8333"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Checkmark icon extracted directly from Figma node 2514:11436 (Vector I2514:11418;1087:4531)
 */
function TickIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="12"
      viewBox="0 0 17.5 11.8139"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16.75 0.750019L11.3593 7.21883C9.22321 9.78219 8.15514 11.0639 6.75002 11.0639C5.34489 11.0639 4.27683 9.78219 2.14069 7.21883L0.750019 5.55002"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SlideToConfirm({
  label = "Slide to confirm",
  confirmedLabel = "Confirm",
  onConfirm,
  onReset,
  disabled = false,
  className = "",
  autoResetMs,
}: SlideToConfirmProps) {
  // Exact 3-stage interaction modeled after Figma symbol variants:
  // 1. "idle" (Variant 1: 2514:11438) -> 48px thumb with arrow on left, track label visible
  // 2. "filled" (Variant 2: 2514:11437) -> 272px black pill filled, arrow docked at right edge
  // 3. "confirmed" (Variant 3: 2514:11436) -> arrow exits, tick + "Confirm" enters gently from right into center
  const [stage, setStage] = useState<SlideToConfirmStage>("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Total travel distance: 280px container - 8px inset (4px each side) - 48px handle = 224px
  const maxDrag = 224;
  const confirmThreshold = 180; // ~80% drag completion triggers confirmation

  const x = useMotionValue(0);

  // Strictly clamp width between 48px and 272px even during elastic drag
  const backgroundWidth = useTransform(x, (currentX) =>
    Math.max(48, Math.min(272, 48 + currentX))
  );

  // Fade out track label smoothly as slider advances
  const textOpacity = useTransform(x, [0, 110], [1, 0]);

  // Handle stage transition from filled (Variant 2) to confirmed (Variant 3)
  const triggerFilledToConfirmed = useCallback(() => {
    setStage("filled");
    animate(x, maxDrag, {
      type: "spring",
      stiffness: 380,
      damping: 30,
    });

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

    // Timeout between Variant 2 and Variant 3 (matches Figma AFTER_TIMEOUT trigger)
    transitionTimerRef.current = setTimeout(() => {
      setStage("confirmed");
      onConfirm?.();
    }, 320);
  }, [maxDrag, onConfirm, x]);

  const handleReset = useCallback(() => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    setStage("idle");
    animate(x, 0, {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    });
    onReset?.();
  }, [onReset, x]);

  const handleDragEnd = () => {
    if (disabled || stage !== "idle") return;
    const currentX = x.get();
    if (currentX >= confirmThreshold) {
      triggerFilledToConfirmed();
    } else {
      animate(x, 0, {
        type: "spring",
        stiffness: 420,
        damping: 32,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (stage === "confirmed" || stage === "filled") {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        handleReset();
      }
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerFilledToConfirmed();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextX = Math.min(maxDrag, x.get() + 56);
      if (nextX >= confirmThreshold) {
        triggerFilledToConfirmed();
      } else {
        animate(x, nextX, { type: "spring", stiffness: 400, damping: 30 });
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const nextX = Math.max(0, x.get() - 56);
      animate(x, nextX, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Optional automatic reset timer
  useEffect(() => {
    if (stage === "confirmed" && autoResetMs && autoResetMs > 0) {
      const timer = setTimeout(() => {
        handleReset();
      }, autoResetMs);
      return () => clearTimeout(timer);
    }
  }, [stage, autoResetMs, handleReset]);

  const isConfirmed = stage === "confirmed";
  const isFilled = stage === "filled";

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Slide to confirm"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={
        isConfirmed
          ? 100
          : Math.min(100, Math.round((x.get() / maxDrag) * 100))
      }
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      onClick={isConfirmed ? handleReset : undefined}
      className={`relative w-[280px] h-[56px] rounded-[12px] bg-white ring-1 ring-[#DEE1E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] select-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/20 ${
        isConfirmed ? "cursor-pointer" : ""
      } ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}
    >
      {/* Background Track Label (Variant 1: Centered Plus Jakarta Sans Medium 14px) */}
      <motion.div
        style={{ opacity: isConfirmed || isFilled ? 0 : textOpacity }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] leading-[19.5px] tracking-[-0.14px] text-[#868788] whitespace-nowrap">
          {label}
        </span>
      </motion.div>

      {/* Expanding Black Fill Pill: Exactly 4px padding on Top, Bottom, Left, and Right */}
      <motion.div
        className="absolute top-[4px] bottom-[4px] left-[4px] rounded-[8px] bg-[#17181a] overflow-hidden flex items-center justify-center pointer-events-none"
        style={{
          width: isConfirmed || isFilled ? 272 : backgroundWidth,
          right: isConfirmed || isFilled ? 4 : undefined,
        }}
      >
        {/* Confirmed State (Variant 3): Gentle entrance from the right into exact center */}
        <AnimatePresence>
          {isConfirmed && (
            <motion.div
              key="confirmed-content"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 24,
                mass: 0.8,
                delay: 0.05,
              }}
              className="flex items-center gap-[8px] text-white shrink-0"
            >
              <div className="shrink-0 size-[24px] flex items-center justify-center">
                <TickIcon className="text-white" />
              </div>
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] leading-[19.5px] tracking-[-0.14px] text-white whitespace-nowrap">
                {confirmedLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Draggable Thumb / Handle with Arrow Icon: Exactly 4px from Top, Bottom, Left */}
      {!isConfirmed && (
        <motion.div
          drag={stage === "idle" && !disabled ? "x" : false}
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0.05}
          dragMomentum={false}
          style={{ x }}
          onDragEnd={handleDragEnd}
          className="absolute left-[4px] top-[4px] bottom-[4px] w-[48px] rounded-[8px] bg-[#17181a] flex items-center justify-center cursor-grab active:cursor-grabbing z-10 touch-none shadow-xs"
        >
          <motion.div
            animate={{
              opacity: isConfirmed ? 0 : 1,
              x: isConfirmed ? 20 : 0,
            }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="text-white flex items-center justify-center size-[20px]"
          >
            <ArrowRightIcon className="text-white" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default SlideToConfirm;
