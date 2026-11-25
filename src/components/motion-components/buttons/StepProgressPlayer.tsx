"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface StepProgressPlayerProps {
  /** Total number of steps in the indicator (default: 5, matching Figma design) */
  totalSteps?: number;
  /** Duration of each step in seconds (default: 3) */
  stepDuration?: number;
  /** Whether auto-play is enabled initially (default: true) */
  autoPlay?: boolean;
  /** Callback fired whenever the active step changes */
  onStepChange?: (step: number) => void;
  /** Optional extra CSS classes */
  className?: string;
}

/**
 * Play icon extracted directly from Figma node 2552:11571 (Vectors 2552:11572 & 2552:11573)
 */
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4.00293 2.46289L8.15918 4.92585V9.85178L4.00293 12.3147V2.46289Z"
        fill="#17181A"
        stroke="#17181A"
        strokeWidth="1.23148"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.15918 4.92578L12.3154 7.38874L8.15918 9.85171V4.92578Z"
        fill="#17181A"
        stroke="#17181A"
        strokeWidth="1.23148"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Pause icon extracted directly from Figma node 2552:11591 (Vectors 2552:11592 & 2552:11593)
 */
function PauseIcon({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M1.83301 2.38867H5.98926V12.8147H1.83301V2.38867Z"
        fill="#17181A"
        stroke="#17181A"
        strokeWidth="1.23148"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.81543 2.49805H12.9893V12.998H8.81543V2.49805Z"
        fill="#17181A"
        stroke="#17181A"
        strokeWidth="1.23148"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepProgressPlayer({
  totalSteps = 5,
  stepDuration = 3,
  autoPlay = true,
  onStepChange,
  className = "",
}: StepProgressPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0.4); // Start with initial filled preview matching Figma Variant 1

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const durationMs = Math.max(500, stepDuration * 1000);

  // Notify parent on step change
  const handleStepChange = useCallback(
    (newStep: number) => {
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    },
    [onStepChange]
  );

  // Smooth progress loop via requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const stepLoop = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setProgress((prevProgress) => {
        const nextProgress = prevProgress + delta / durationMs;
        if (nextProgress >= 1) {
          handleStepChange((currentStep + 1) % totalSteps);
          return 0;
        }
        return nextProgress;
      });

      animationFrameRef.current = requestAnimationFrame(stepLoop);
    };

    animationFrameRef.current = requestAnimationFrame(stepLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentStep, durationMs, totalSteps, handleStepChange]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleStepClick = (index: number) => {
    handleStepChange(index);
    setProgress(0);
    lastTimeRef.current = null;
  };

  return (
    <div
      role="region"
      aria-label="Step progress player"
      className={`inline-flex items-center gap-[8.44px] select-none ${className}`}
    >
      {/* Step Indicators Capsule Container: 135.11px × 38px, padding 14.78px, rounded 19px, white */}
      <div
        className="relative flex items-center justify-center p-[14.78px] bg-white rounded-[19px] shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]"
        style={{
          width: "135.11px",
          height: "38px",
        }}
      >
        <div
          className="relative flex items-center gap-[8.44px] h-[8.44px] shrink-0"
          style={{ width: "105.56px" }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <motion.button
                key={index}
                type="button"
                onClick={() => handleStepClick(index)}
                aria-label={`Go to step ${index + 1}`}
                aria-current={isActive ? "step" : undefined}
                animate={{
                  width: isActive ? 38 : 8.44,
                }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 32,
                  mass: 0.8,
                }}
                className="relative h-[8.44px] rounded-full bg-[#DADADA] overflow-hidden cursor-pointer shrink-0 border-none p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#17181A]/30"
              >
                {/* Dark charcoal/black (#17181A) progress fill */}
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-[#17181A] transition-all duration-75"
                  style={{
                    width: isActive
                      ? `${Math.min(100, Math.max(0, progress * 100))}%`
                      : isCompleted
                      ? "100%"
                      : "0%",
                  }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Play/Pause Button: 38px × 38px circle, white, rounded 19px */}
      <motion.button
        type="button"
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause progress" : "Play progress"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative size-[38px] rounded-[19px] bg-white flex items-center justify-center shrink-0 cursor-pointer border-none outline-none shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#17181A]/30"
      >
        <div className="size-[14.78px] flex items-center justify-center shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            {isPlaying ? (
              <motion.div
                key="pause-icon"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.14 }}
                className="size-[14.78px] flex items-center justify-center"
              >
                <PauseIcon />
              </motion.div>
            ) : (
              <motion.div
                key="play-icon"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.14 }}
                className="size-[14.78px] flex items-center justify-center"
              >
                <PlayIcon />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
}

export default StepProgressPlayer;
