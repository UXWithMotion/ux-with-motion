"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useId,
  useMemo,
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

// ─── Email Validation Helper ────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === "") return false;
  // RFC 5322 compliant standard email regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return regex.test(email.trim());
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface SmoothEmailInputProps {
  className?: string;
  property1?: "Field anatomy" | "Input container";
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  required?: boolean;
}

export function SmoothEmailInput({
  className = "",
  property1 = "Field anatomy",
  label = "Email Id",
  defaultValue,
  value,
  onChange,
  onValueChange,
  onValidationChange,
  disabled = false,
  name = "email",
  id,
  autoComplete = "email",
  required = false,
}: SmoothEmailInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const isSimulatingRef = useRef(false);

  const [containerWidth, setContainerWidth] = useState(404);

  // Initialize value based on Figma property1 variant or defaultValue
  const initialValue =
    value !== undefined
      ? value
      : defaultValue !== undefined
      ? defaultValue
      : property1 === "Input container"
      ? "Rakesh@uxwithmotion.com"
      : "";

  const [internalValue, setInternalValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(
    property1 === "Input container" && !value
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [caretIndex, setCaretIndex] = useState(initialValue.length);
  const [caretX, setCaretX] = useState(16);
  const [hasSelection, setHasSelection] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ResizeObserver for dynamic iOS squircle corner smoothing
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth || 404);
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute Figma iOS 100% Corner Smoothing Squircle Paths
  const { strokePath, clipPath } = useMemo(() => {
    return {
      strokePath: getSquirclePath(containerWidth, 60, 12, 1.0, 0.5),
      clipPath: getSquirclePath(containerWidth, 60, 12, 1.0, 0),
    };
  }, [containerWidth]);

  // Sync when property1 or controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
      setCaretIndex(value.length);
    } else if (property1 === "Input container" && internalValue === "") {
      setInternalValue("Rakesh@uxwithmotion.com");
      setCaretIndex("Rakesh@uxwithmotion.com".length);
    } else if (property1 === "Field anatomy" && internalValue === "Rakesh@uxwithmotion.com") {
      setInternalValue("");
      setCaretIndex(0);
    }
  }, [property1, value]);

  const currentValue = value !== undefined ? value : internalValue;
  const isFloating = isFocused || currentValue.length > 0;

  // Email Validation & Constraint Checking
  const valid = useMemo(() => isValidEmail(currentValue), [currentValue]);
  const showError = hasInteracted && !isFocused && currentValue.length > 0 && !valid;

  useEffect(() => {
    onValidationChange?.(valid);
  }, [valid, onValidationChange]);

  // Split string using Array.from to correctly support emojis and multi-byte characters
  const characters = useMemo(() => {
    return Array.from(currentValue).map((char, index) => ({
      id: `${index}-${char}`,
      char,
    }));
  }, [currentValue]);

  // Synchronize horizontal scrolling between real input and display layer
  const syncScroll = () => {
    if (displayRef.current && inputRef.current) {
      displayRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  // Sync caret position and selection from native input
  const syncFromInput = (isKeystroke = false) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart ?? currentValue.length;
    const end = input.selectionEnd ?? start;

    setCaretIndex(start);
    setHasSelection(end > start);
    syncScroll();

    if (isKeystroke) {
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 380);
    }
  };

  // Measure exact right-edge position of current character directly from displayRef with zero gap
  const syncCaretX = () => {
    if (!inputRef.current) return;
    const scrollLeft = inputRef.current.scrollLeft || 0;

    if (caretIndex === 0 || currentValue.length === 0) {
      setCaretX(16 - scrollLeft);
      return;
    }

    if (!displayRef.current) return;
    const targetIdx = Math.min(caretIndex - 1, currentValue.length - 1);
    const charEl = displayRef.current.querySelector(
      `[data-char-index="${targetIdx}"]`
    ) as HTMLElement | null;

    if (charEl) {
      // 16px is the left inset of the displayRef. charEl.offsetLeft + charEl.offsetWidth is the exact character edge.
      setCaretX(16 + charEl.offsetLeft + charEl.offsetWidth - scrollLeft);
    }
  };

  useIsomorphicLayoutEffect(() => {
    syncCaretX();
    const rafId = requestAnimationFrame(syncCaretX);
    return () => cancelAnimationFrame(rafId);
  }, [currentValue, caretIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Constraint: Automatically disallow spaces in email address
    const rawVal = e.target.value;
    const nextVal = rawVal.replace(/\s+/g, "");

    setHasInteracted(true);
    if (value === undefined) {
      setInternalValue(nextVal);
    }
    onChange?.(e);
    onValueChange?.(nextVal);

    syncFromInput(true);
  };

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue("");
    }
    setCaretIndex(0);
    onValueChange?.("");
    inputRef.current?.focus();
    requestAnimationFrame(syncScroll);
  };

  // Smooth auto-typing simulation demo helper
  const handleAutoType = (demoEmail = "Rakesh@uxwithmotion.com") => {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;
    setHasInteracted(true);
    setInternalValue("");
    setCaretIndex(0);
    setIsFocused(true);
    setIsTyping(true);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < demoEmail.length) {
        const nextChunk = demoEmail.slice(0, idx + 1);
        setInternalValue(nextChunk);
        setCaretIndex(nextChunk.length);
        setIsTyping(true);
        onValueChange?.(nextChunk);
        idx++;
        requestAnimationFrame(syncScroll);
      } else {
        clearInterval(interval);
        isSimulatingRef.current = false;
        setTimeout(() => setIsTyping(false), 380);
      }
    }, 60);
  };

  // Border color calculation matching Figma specifications
  const borderColor = useMemo(() => {
    if (showError) return "#F04438"; // Invalid constraint warning
    if (isFocused) return "#626467"; // Active / focused state matching Figma
    if (isHovered) return "#B0B7C3";
    return "#D8DEE9"; // Default unfocused empty border matching Figma
  }, [showError, isFocused, isHovered]);

  return (
    <div className={`relative flex flex-col items-center justify-center w-full p-4 select-none ${className}`}>
      {/* 
        Container matching Figma Node 2204:1139 (Component 6):
        w-[404px], h-[60px], with iOS 100% Corner Smoothing (Squircle)
      */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => inputRef.current?.focus()}
        className="relative w-full max-w-[404px] h-[60px] cursor-text select-none"
        style={{
          clipPath: `path('${clipPath}')`,
        }}
      >
        {/* iOS 100% Corner Smoothing Squircle Background & 1px Stroke */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          viewBox={`0 0 ${containerWidth} 60`}
          fill="none"
        >
          <path
            d={strokePath}
            fill="#FFFFFF"
            stroke={borderColor}
            strokeWidth="1"
            className="transition-colors duration-200"
          />
        </svg>

        {/* Floating Animated Label matching Figma Node 1466:5501 / 2204:1139 */}
        <motion.label
          htmlFor={inputId}
          initial={false}
          animate={{
            y: isFloating ? -9 : 0,
            scale: isFloating ? 0.857 : 1, // 14px * 0.857 ≈ 12px (in Figma: top shifts from 20.5px to 11.5px)
            color: showError
              ? "#F04438"
              : isFocused
              ? "#626467"
              : "#98A2B3",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          style={{ transformOrigin: "left top" }}
          className="absolute left-[16px] top-[20.5px] pointer-events-none select-none font-sans font-medium text-[14px] leading-[1.2] whitespace-nowrap z-20"
        >
          {label}
        </motion.label>

        {/* 
          Smooth Typing Display Layer:
          Positioned exactly at top-[29.5px], left-[16px], height 19px matching Figma Value Text.
        */}
        <div
          ref={displayRef}
          aria-hidden="true"
          className="absolute left-[16px] top-[29.5px] right-[40px] h-[19px] pointer-events-none font-sans font-medium text-[16px] leading-[1.2] text-[#1f2123] z-0 overflow-hidden whitespace-nowrap flex items-center"
          style={{
            fontFeatureSettings: '"ordn" 1, "salt" 1, "lnum" 1, "pnum" 1',
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {characters.map((item, index) => (
              <motion.span
                key={item.id}
                data-char-index={index}
                initial={{
                  opacity: 0,
                  y: 3,
                  scale: 0.9,
                  filter: "blur(2px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: -3,
                  scale: 0.9,
                  filter: "blur(2px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 550,
                  damping: 30,
                  mass: 0.4,
                }}
                style={{ display: "inline-block", whiteSpace: "pre", flexShrink: 0, height: "19px", lineHeight: "19px" }}
              >
                {item.char}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* 
          Smooth Animated Caret Cursor { | }:
          Top at 29.5px, height 19px matching value text baseline and font metrics.
        */}
        <motion.div
          aria-hidden="true"
          className="absolute top-[29.5px] left-0 w-[1.5px] h-[19px] bg-[#1f2123] rounded-full pointer-events-none z-20"
          animate={{
            x: caretX,
            opacity:
              !isFocused || hasSelection
                ? 0
                : isTyping
                ? 1
                : [1, 1, 0, 0, 1],
          }}
          transition={{
            x: {
              type: "spring",
              stiffness: 480,
              damping: 30,
              mass: 0.45,
            },
            opacity:
              isTyping || !isFocused || hasSelection
                ? { duration: 0.15 }
                : {
                    duration: 1.0,
                    repeat: Infinity,
                    times: [0, 0.45, 0.5, 0.95, 1],
                    ease: "linear",
                  },
          }}
        />

        {/* 
          Real Native HTML Email Input:
          Exact matching bounds: left-[16px], top-[29.5px], height 19px, p-0.
        */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={currentValue}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          onChange={handleChange}
          onScroll={() => {
            syncScroll();
            syncCaretX();
          }}
          onClick={() => syncFromInput(false)}
          onKeyDown={() => requestAnimationFrame(() => syncFromInput(true))}
          onKeyUp={() => syncFromInput(false)}
          onSelect={() => syncFromInput(false)}
          onFocus={() => {
            setIsFocused(true);
            syncFromInput(false);
          }}
          onBlur={() => {
            setIsFocused(false);
            setHasInteracted(true);
          }}
          className="absolute left-[16px] top-[29.5px] right-[40px] h-[19px] p-0 bg-transparent outline-none font-sans font-medium text-[16px] leading-[1.2] text-transparent caret-transparent z-10 selection:bg-[#1f2123]/15 selection:text-transparent"
          style={{
            caretColor: "transparent",
            color: "transparent",
            fontFeatureSettings: '"ordn" 1, "salt" 1, "lnum" 1, "pnum" 1',
            lineHeight: "19px",
          }}
        />

        {/* Action Controls on the Right: Auto-type demo button (star/sparkle) or clear button */}
        <div className="absolute right-[14px] top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
          <AnimatePresence mode="wait">
            {currentValue.length === 0 ? (
              <motion.button
                key="auto-type-btn"
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAutoType("Rakesh@uxwithmotion.com");
                }}
                className="size-[24px] rounded-full hover:bg-[#f1f3f7] flex items-center justify-center text-[#b0b7c3] hover:text-[#626467] transition-colors cursor-pointer group"
                title="Try smooth email demo"
              >
                {/* Star / Sparkle Icon matching SmoothInput */}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform group-hover:scale-110"
                >
                  <path
                    d="M10 2L11.5 5.5L15 7L11.5 8.5L10 12L8.5 8.5L5 7L8.5 5.5L10 2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M3.5 10.5L4.5 12.5L6.5 13.5L4.5 14.5L3.5 16.5L2.5 14.5L0.5 13.5L2.5 12.5L3.5 10.5Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.button>
            ) : (
              !disabled && (
                <motion.button
                  key="clear-btn"
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="size-[20px] rounded-full bg-[#f1f3f7] hover:bg-[#e4e7ec] flex items-center justify-center text-[#98a2b3] hover:text-[#626467] transition-colors cursor-pointer"
                  title="Clear email"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Constraint Warning Feedback */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[404px] pt-1.5 px-3 flex items-center gap-1.5 text-[12px] text-[#F04438] font-sans font-medium"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Please enter a valid email address (e.g. name@domain.com)</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SmoothEmailInput;
