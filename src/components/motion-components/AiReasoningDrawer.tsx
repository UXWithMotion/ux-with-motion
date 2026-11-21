"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface AiReasoningDrawerProps {
  className?: string;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  label?: string;
  doneLabel?: string;
  autoPlay?: boolean;
  thoughts?: string[];
}

const DEFAULT_THOUGHTS = [
  "Static UI libraries miss the subtle micro-interactions that make modern software feel alive.",
  "Designers need editable Figma layers; engineers need clean, performant Next.js code.",
  "UX With Motion bridges both worlds with 1-click copy for Figma and production React.",
  "Handcrafted with Framer Motion, fluid spring physics, and obsessively tuned details.",
];

function ChevronArrow({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.div
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="size-[14px] flex items-center justify-center shrink-0 text-[#8a8a97] group-hover:text-[#1F2123] transition-colors"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-[14px]"
      >
        <path
          d="M3.5 5.25L7 8.75L10.5 5.25"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
        />
      </svg>
    </motion.div>
  );
}

function ReplayIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.6667 6.70833C11.6685 7.78986 11.2946 8.83843 10.6089 9.67481C9.9232 10.5112 8.9683 11.0834 7.90741 11.2937C6.84653 11.504 5.74554 11.3393 4.79265 10.8278C3.83976 10.3162 3.09414 9.48953 2.68325 8.4891C2.27236 7.48866 2.2217 6.37657 2.53995 5.34293C2.8582 4.30929 3.52559 3.41828 4.42803 2.82221C5.33048 2.22614 6.41194 1.96202 7.48754 2.07501C8.56315 2.188 9.56612 2.67108 10.325 3.44167M11.6667 1.75V4.375H9.04167"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}

export function AiReasoningDrawer({
  className = "",
  defaultOpen = false,
  isOpen: controlledOpen,
  onToggle,
  label = "Thinking…",
  doneLabel = "Thought for 8s",
  autoPlay = true,
  thoughts = DEFAULT_THOUGHTS,
}: AiReasoningDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const activeThoughts = thoughts && thoughts.length > 0 ? thoughts : DEFAULT_THOUGHTS;

  const [isThinking, setIsThinking] = useState(false);
  const [streamIndex, setStreamIndex] = useState<number>(activeThoughts.length);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(8);
  const [isReplaying, setIsReplaying] = useState(false);

  // Sync internalOpen if defaultOpen changes
  useEffect(() => {
    if (controlledOpen === undefined) {
      setInternalOpen(defaultOpen);
    }
  }, [defaultOpen, controlledOpen]);

  // Thinking streaming & timer cycle (triggered by Replay)
  useEffect(() => {
    if (!isThinking) return;

    setElapsedSeconds(1);
    setStreamIndex(1);

    const timer = setInterval(() => {
      setElapsedSeconds((s) => {
        if (s >= 7 && autoPlay) {
          setIsThinking(false);
          return 8;
        }
        return s + 1;
      });
    }, 1000);

    const stream1 = setTimeout(() => setStreamIndex(2), 900);
    const stream2 = setTimeout(() => setStreamIndex(3), 1900);
    const stream3 = setTimeout(() => setStreamIndex(4), 2900);

    return () => {
      clearInterval(timer);
      clearTimeout(stream1);
      clearTimeout(stream2);
      clearTimeout(stream3);
    };
  }, [isThinking, autoPlay]);

  const toggleOpen = () => {
    const next = !isOpen;
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    onToggle?.(next);
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReplaying(true);
    setTimeout(() => setIsReplaying(false), 600);
    setIsThinking(true);
    if (!isOpen) {
      if (controlledOpen === undefined) {
        setInternalOpen(true);
      }
      onToggle?.(true);
    }
  };

  return (
    <div className={`w-full max-w-full sm:max-w-[480px] flex flex-col items-start font-sans select-none px-1 ${className}`}>
      {/* Header Row: Always clickable to collapse / open via Up / Down arrow */}
      <div className="w-full flex items-center justify-between gap-2 mb-2">
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          className="group flex items-center gap-1.5 py-1 text-left cursor-pointer focus:outline-none min-w-0"
        >
          {/* Label: Fixed Crisp Light-Theme Shimmer during thinking, Solid when completed */}
          {isThinking ? (
            <span
              className="font-sans font-normal text-[14px] leading-normal text-transparent bg-clip-text animate-shimmer-sweep select-none whitespace-nowrap"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #8a8a97 0%, #8a8a97 30%, #111827 50%, #8a8a97 70%, #8a8a97 100%)",
                backgroundSize: "200% 100%",
              }}
            >
              {label}
            </span>
          ) : (
            <span className="font-sans font-normal text-[14px] leading-normal text-[#8a8a97] group-hover:text-[#1F2123] transition-colors whitespace-nowrap">
              {doneLabel || `Thought for ${elapsedSeconds}s`}
            </span>
          )}

          {/* Up and Down Arrow (Rotates 180deg to point UP when open, points DOWN when collapsed) */}
          <ChevronArrow isOpen={isOpen} />

          {/* Elapsed Timer Counter */}
          <span className="text-[12px] font-normal text-[#8a8a97] font-mono tabular-nums ml-0.5">
            {elapsedSeconds}s
          </span>
        </button>

        {/* Replay Button to Re-trigger Thinking Animation on Demand */}
        <button
          type="button"
          onClick={handleReplay}
          className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[#8a8a97] hover:text-[#1F2123] hover:bg-black/[0.04] active:scale-95 transition-all cursor-pointer text-[12px] shrink-0"
          title="Replay reasoning animation"
        >
          <div
            className={`size-[13px] flex items-center justify-center transition-transform duration-500 ${
              isReplaying ? "rotate-[360deg]" : ""
            }`}
          >
            <ReplayIcon />
          </div>
          <span className="font-medium">Replay</span>
        </button>
      </div>

      {/* Collapsible Thoughts Card: Expands and Collapses smoothly with Up/Down Arrow */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="reasoning-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-full overflow-hidden"
          >
            <div className="w-full relative rounded-[12px] bg-[#f7f7f8] border border-[#e5e5e8] px-3.5 py-3">
              {/* Streaming Thought Lines */}
              <div className="flex flex-col w-full gap-2">
                {activeThoughts.map((thought, idx) => {
                  const isVisible = idx < streamIndex;
                  const isLatest = idx === streamIndex - 1;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{
                        opacity: isVisible ? (idx === 0 ? 0.5 : 1) : 0,
                        y: isVisible ? 0 : 3,
                      }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={`w-full flex items-start ${
                        !isVisible ? "hidden" : ""
                      }`}
                    >
                      <p
                        className={`flex-1 font-sans font-normal text-[13px] sm:text-[13.5px] leading-[1.55] [word-break:break-word] [overflow-wrap:anywhere] ${
                          idx === 0 ? "text-[#8a8a97]" : "text-[#374151]"
                        }`}
                      >
                        {thought}
                        {isLatest && isThinking && (
                          <span className="inline-block size-1.5 ml-2 rounded-full bg-[#2563EB] animate-pulse align-middle" />
                        )}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AiReasoningDrawer;
