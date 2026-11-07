"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useId,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Figma iOS 100% Corner Smoothing (Squircle) Math ─────────────────────────

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

interface CornerParams {
  cornerRadius: number;
  cornerSmoothing: number;
  roundingAndSmoothingBudget: number;
}

function getPathParamsForCorner({
  cornerRadius,
  cornerSmoothing,
  roundingAndSmoothingBudget,
}: CornerParams) {
  let p = (1 + cornerSmoothing) * cornerRadius;
  const maxCornerSmoothing = roundingAndSmoothingBudget / cornerRadius - 1;
  cornerSmoothing = Math.min(cornerSmoothing, maxCornerSmoothing);
  p = Math.min(p, roundingAndSmoothingBudget);

  const arcMeasure = 90 * (1 - cornerSmoothing);
  const arcSectionLength =
    Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2));
  const angleBeta = 45 * cornerSmoothing;
  const c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));
  const b = (p - arcSectionLength - c - d) / 3;
  const a = 2 * b;

  return { a, b, c, d, p, arcSectionLength, cornerRadius };
}

export function getSquirclePath(
  width: number,
  height: number,
  cornerRadius = 12,
  cornerSmoothing = 1.0,
  inset = 0.5
) {
  const w = width - inset * 2;
  const h = height - inset * 2;
  const budget = Math.min(w, h) / 2;
  const r = Math.min(Math.max(cornerRadius - inset, 0), budget);
  const p = getPathParamsForCorner({
    cornerRadius: r,
    cornerSmoothing,
    roundingAndSmoothingBudget: budget,
  });

  const a = p.a.toFixed(3);
  const b = p.b.toFixed(3);
  const c = p.c.toFixed(3);
  const d = p.d.toFixed(3);
  const arc = p.arcSectionLength.toFixed(3);
  const apb = (p.a + p.b).toFixed(3);
  const apbpc = (p.a + p.b + p.c).toFixed(3);
  const bpc = (p.b + p.c).toFixed(3);

  const startX = (w - p.p + inset).toFixed(3);
  const startY = inset.toFixed(3);
  const rightX = (w + inset).toFixed(3);
  const bottomY = (h + inset).toFixed(3);
  const leftX = inset.toFixed(3);
  const bottomStartX = (h - p.p + inset).toFixed(3);
  const leftBottomX = (p.p + inset).toFixed(3);
  const leftTopY = (p.p + inset).toFixed(3);

  return (
    `M ${startX} ${startY} ` +
    `c ${a} 0 ${apb} 0 ${apbpc} ${d} ` +
    `a ${r} ${r} 0 0 1 ${arc} ${arc} ` +
    `c ${d} ${c} ${d} ${bpc} ${d} ${apbpc} ` +
    `L ${rightX} ${bottomStartX} ` +
    `c 0 ${a} 0 ${apb} -${d} ${apbpc} ` +
    `a ${r} ${r} 0 0 1 -${arc} ${arc} ` +
    `c -${c} ${d} -${bpc} ${d} -${apbpc} ${d} ` +
    `L ${leftBottomX} ${bottomY} ` +
    `c -${a} 0 -${apb} 0 -${apbpc} -${d} ` +
    `a ${r} ${r} 0 0 1 -${arc} -${arc} ` +
    `c -${d} -${c} -${d} -${bpc} -${d} -${apbpc} ` +
    `L ${leftX} ${leftTopY} ` +
    `c 0 -${a} 0 -${apb} ${d} -${apbpc} ` +
    `a ${r} ${r} 0 0 1 ${arc} -${arc} ` +
    `c ${c} -${d} ${bpc} -${d} ${apbpc} -${d} ` +
    `Z`
  );
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface SmoothOtpInputProps {
  className?: string;
  property1?: "Field anatomy" | "Active" | "Filled";
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  id?: string;
  autoFocus?: boolean;
}

export function SmoothOtpInput({
  className = "",
  property1 = "Field anatomy",
  length = 4,
  value,
  defaultValue,
  onChange,
  onComplete,
  disabled = false,
  label = "Enter OTP",
  required = true,
  id,
  autoFocus = false,
}: SmoothOtpInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const isSimulatingRef = useRef(false);

  // Initialize value based on Figma property1 variant or defaultValue
  const initialValue = useMemo(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    if (property1 === "Filled") return "1469";
    if (property1 === "Active") return "12";
    return "";
  }, [value, defaultValue, property1]);

  const [internalValue, setInternalValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(autoFocus || property1 === "Active");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when property1 or controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value.slice(0, length));
    } else if (property1 === "Filled" && internalValue === "") {
      setInternalValue("1469".slice(0, length));
    } else if (property1 === "Active" && internalValue === "") {
      setInternalValue("12".slice(0, length));
      setIsFocused(true);
    } else if (property1 === "Field anatomy" && (internalValue === "1469" || internalValue === "12")) {
      setInternalValue("");
    }
  }, [property1, value, length]);

  const currentValue = (value !== undefined ? value : internalValue).slice(0, length);

  // Focused slot index (clamps to next empty slot or last slot)
  const [activeSlot, setActiveSlot] = useState(() => {
    if (property1 === "Active") return Math.min(2, length - 1);
    if (property1 === "Filled") return length - 1;
    return 0;
  });

  // Keep active slot in sync with value length when typing
  useEffect(() => {
    if (!isFocused) return;
    const nextSlot = Math.min(currentValue.length, length - 1);
    setActiveSlot(nextSlot);
  }, [currentValue, length, isFocused]);

  // Compute Figma 52px Squircle Path for each box
  const { strokePath, clipPath } = useMemo(() => {
    return {
      strokePath: getSquirclePath(52, 52, 12, 1.0, 0.5),
      clipPath: getSquirclePath(52, 52, 12, 1.0, 0),
    };
  }, []);

  // Native input change handler (handles typing & paste)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Keep only numerical digits
    const cleaned = rawVal.replace(/\D/g, "").slice(0, length);

    if (value === undefined) {
      setInternalValue(cleaned);
    }
    onChange?.(cleaned);

    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setIsTyping(false), 380);

    const nextIndex = Math.min(cleaned.length, length - 1);
    setActiveSlot(nextIndex);

    if (cleaned.length === length) {
      onComplete?.(cleaned);
    }
  };

  // Keyboard navigation & backspace jumping
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (currentValue.length > 0) {
        const nextVal = currentValue.slice(0, -1);
        if (value === undefined) {
          setInternalValue(nextVal);
        }
        onChange?.(nextVal);
        setActiveSlot(Math.max(0, nextVal.length));
        setIsTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 380);
      }
    } else if (e.key === "ArrowLeft") {
      setActiveSlot((prev) => Math.max(0, prev - 1));
    } else if (e.key === "ArrowRight") {
      setActiveSlot((prev) => Math.min(length - 1, prev + 1));
    }
  };

  // Click on a specific box
  const handleBoxClick = (index: number) => {
    if (disabled) return;
    setActiveSlot(index);
    inputRef.current?.focus();
  };

  // Smooth auto-typing simulation demo helper
  const handleAutoType = useCallback((demoCode = "1469") => {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;
    setInternalValue("");
    setActiveSlot(0);
    setIsFocused(true);
    setIsTyping(true);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < demoCode.length) {
        const nextChunk = demoCode.slice(0, idx + 1);
        setInternalValue(nextChunk);
        setActiveSlot(Math.min(nextChunk.length, length - 1));
        setIsTyping(true);
        onChange?.(nextChunk);
        idx++;
      } else {
        clearInterval(interval);
        isSimulatingRef.current = false;
        setTimeout(() => setIsTyping(false), 380);
        onComplete?.(demoCode);
      }
    }, 180);
  }, [length, onChange, onComplete]);

  // Caret X position inside the 232px container:
  // Each box is 52px wide, gap is 8px. Pitch = 60px.
  // Center of box index i = i * 60 + 26px - 0.75px (1.5px caret width) = i * 60 + 25.25px
  const cursorX = activeSlot * 60 + 25.25;

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full p-4 select-none ${className}`}
    >
      <div className="relative w-full max-w-[232px] flex flex-col gap-[8px]">
        {/* ── Label Row (Figma Node 1466:5609) ── */}
        <div className="flex items-center gap-[4px] w-full select-none">
          <label
            htmlFor={inputId}
            className="font-sans font-medium text-[14px] leading-[1.2] text-[#172033]"
          >
            {label}
          </label>
          {required && (
            <span
              aria-hidden="true"
              className="font-sans font-bold text-[13px] leading-none text-[#D92D4A] select-none"
            >
              *
            </span>
          )}
        </div>

        {/* ── OTP Boxes Container (Figma Node 1466:5612) ── */}
        <div className="relative w-[232px] h-[52px] flex items-center gap-[8px]">
          {/* Hidden Native Input spanning the container for accessibility, mobile numeric keypad & paste */}
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={length}
            autoComplete="one-time-code"
            value={currentValue}
            disabled={disabled}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute inset-0 w-full h-full opacity-0 pointer-events-auto z-30 cursor-pointer"
            aria-label={label}
          />

          {/* 
            Smooth Morphing Active Squircle Border Ring:
            Glides smoothly between boxes with spring momentum, framing the currently active slot.
          */}
          {isFocused && (
            <motion.div
              layoutId="otp-active-box-ring"
              aria-hidden="true"
              className="absolute pointer-events-none z-20"
              style={{
                width: 52,
                height: 52,
                top: 0,
                left: 0,
              }}
              animate={{
                x: activeSlot * 60,
              }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 28,
                mass: 0.55,
              }}
            >
              <svg
                aria-hidden="true"
                className="w-full h-full pointer-events-none overflow-visible"
                viewBox="0 0 52 52"
                fill="none"
              >
                <path
                  d={strokePath}
                  fill="none"
                  stroke="#1F2123"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>
          )}

          {/* 
            Smooth Animated Caret Cursor { | }:
            Morphs and jumps smoothly from one box to the next box across the gap,
            blinking gently in the center when idle.
          */}
          {isFocused && (
            <motion.div
              aria-hidden="true"
              className="absolute top-[16px] left-0 w-[1.5px] h-[20px] bg-[#1F2123] rounded-full pointer-events-none z-20"
              animate={{
                x: cursorX,
                opacity:
                  !isFocused
                    ? 0
                    : isTyping
                    ? 1
                    : [1, 1, 0, 0, 1],
              }}
              transition={{
                x: {
                  type: "spring",
                  stiffness: 450,
                  damping: 28,
                  mass: 0.5,
                },
                opacity:
                  isTyping || !isFocused
                    ? { duration: 0.15 }
                    : {
                        duration: 1.0,
                        repeat: Infinity,
                        times: [0, 0.45, 0.5, 0.95, 1],
                        ease: "linear",
                      },
              }}
            />
          )}

          {/* Render 4 Individual Squircle Boxes (Figma Nodes 1466:5613 - 1466:5619) */}
          {Array.from({ length }).map((_, index) => {
            const char = currentValue[index] || "";
            const isFilled = char !== "";
            const isActive = isFocused && activeSlot === index;

            return (
              <div
                key={index}
                onClick={() => handleBoxClick(index)}
                className="relative size-[52px] bg-white cursor-pointer select-none shrink-0 flex items-center justify-center group"
                style={{
                  clipPath: `path('${clipPath}')`,
                }}
              >
                {/* Idle / Inactive Squircle Border Overlay */}
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                  viewBox="0 0 52 52"
                  fill="none"
                >
                  <path
                    d={strokePath}
                    fill="none"
                    stroke={isActive ? "#1F2123" : "#D8DEE9"}
                    strokeWidth="1"
                    className="transition-colors duration-200"
                  />
                </svg>

                {/* Box Value Display Layer */}
                <div className="relative z-10 size-full flex items-center justify-center font-sans font-medium text-[16px] text-[#1F2123]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isFilled ? (
                      <motion.span
                        key={`char-${index}-${char}`}
                        initial={{
                          scale: 0.5,
                          y: 4,
                          opacity: 0,
                          filter: "blur(2px)",
                        }}
                        animate={{
                          scale: 1,
                          y: 0,
                          opacity: 1,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          scale: 0.5,
                          y: -3,
                          opacity: 0,
                          filter: "blur(2px)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 550,
                          damping: 28,
                          mass: 0.45,
                        }}
                        style={{
                          fontFeatureSettings: '"lnum" 1, "pnum" 1',
                        }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ) : (
                      /* Placeholder underscore '_' matching Figma Node 1466:5614 */
                      <motion.span
                        key={`placeholder-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 0 : 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-normal text-[14px] leading-normal text-[#98A2B3] select-none"
                      >
                        _
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SmoothOtpInput;
