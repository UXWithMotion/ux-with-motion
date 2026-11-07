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

// ─── Figma MCP Eye Icons ─────────────────────────────────────────────────────

/**
 * Eye Closed / Slash Icon from Figma Node 2204:1143 & 2204:1145
 * Exact vector paths matching Figma MCP design context
 */
export function EyeClosedIcon({
  className = "size-[24px] text-[#626467]",
}: {
  className?: string;
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3.99989 4L19.9999 20M16.4999 16.7559C15.1473 17.4845 13.6185 17.9999 11.9999 17.9999C8.46924 17.9999 5.36624 15.5478 3.5868 13.7788C3.1171 13.3119 2.88229 13.0784 2.7328 12.6201C2.62619 12.2933 2.62616 11.7066 2.7328 11.3797C2.88233 10.9215 3.11763 10.6875 3.58827 10.2197C4.48515 9.32821 5.71801 8.26359 7.17219 7.42676M19.4999 14.6335C19.8329 14.3405 20.138 14.0523 20.4117 13.7803L20.4146 13.7772C20.8832 13.3114 21.1182 13.0779 21.2674 12.6206C21.374 12.2938 21.3738 11.7068 21.2672 11.38C21.1178 10.9219 20.8827 10.6877 20.4133 10.2211C18.6338 8.45208 15.5305 6 11.9999 6C11.6624 6 11.3288 6.02241 10.9999 6.06448M13.3228 13.5C12.9702 13.8112 12.5071 14 11.9999 14C10.8953 14 9.99989 13.1046 9.99989 12C9.99989 11.4605 10.2135 10.9711 10.5608 10.6113"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Eye Open Icon from Figma Node 2204:1144
 * Exact vector paths matching Figma MCP design context
 */
export function EyeOpenIcon({
  className = "size-[24px] text-[#626467]",
}: {
  className?: string;
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.0002 17.9999C8.46953 17.9999 5.36623 15.5478 3.5868 13.7788C3.11714 13.3119 2.88229 13.0784 2.7328 12.6201C2.62618 12.2933 2.62618 11.7067 2.7328 11.3799C2.88229 10.9216 3.11714 10.688 3.5868 10.2211C5.36623 8.45208 8.46953 6 12.0002 6C15.5308 6 18.6335 8.45208 20.413 10.2211C20.8823 10.6877 21.1177 10.9218 21.2671 11.3799C21.3738 11.7067 21.3738 12.2933 21.2671 12.6201C21.1177 13.0782 20.8823 13.3123 20.413 13.7788C18.6335 15.5478 15.5308 17.9999 12.0002 17.9999ZM12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface SmoothPasswordInputProps {
  className?: string;
  property1?: "Field anatomy" | "Input container";
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  required?: boolean;
  maskCharacter?: string;
}

export function SmoothPasswordInput({
  className = "",
  property1 = "Field anatomy",
  label = "Password",
  defaultValue,
  value,
  onChange,
  onValueChange,
  disabled = false,
  name = "password",
  id,
  autoComplete = "current-password",
  required = false,
  maskCharacter = "*",
}: SmoothPasswordInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState(404);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize value based on Figma property1 variant or defaultValue
  const initialValue =
    value !== undefined
      ? value
      : defaultValue !== undefined
      ? defaultValue
      : property1 === "Input container"
      ? "Rakesh@$%"
      : "";

  const [internalValue, setInternalValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(
    property1 === "Input container" && !value
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
      setInternalValue("Rakesh@$%");
      setCaretIndex("Rakesh@$%".length);
    } else if (
      property1 === "Field anatomy" &&
      internalValue === "Rakesh@$%"
    ) {
      setInternalValue("");
      setCaretIndex(0);
    }
  }, [property1, value]);

  const currentValue = value !== undefined ? value : internalValue;
  const isFloating = isFocused || currentValue.length > 0;

  // Split string using Array.from to correctly support emojis and multi-byte characters
  // Dynamic morph key incorporates showPassword state so characters gracefully pop between masked glyph and text
  const characters = useMemo(() => {
    return Array.from(currentValue).map((char, index) => {
      const displayGlyph = showPassword ? char : maskCharacter;
      return {
        id: `${index}-${displayGlyph}`,
        char: displayGlyph,
        rawChar: char,
      };
    });
  }, [currentValue, showPassword, maskCharacter]);

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

  // Measure exact right-edge position of current character directly from displayRef
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
      setCaretX(16 + charEl.offsetLeft + charEl.offsetWidth - scrollLeft);
    }
  };

  useIsomorphicLayoutEffect(() => {
    syncCaretX();
    const rafId = requestAnimationFrame(syncCaretX);
    return () => cancelAnimationFrame(rafId);
  }, [currentValue, caretIndex, showPassword]);

  // Native input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (value === undefined) {
      setInternalValue(val);
    }
    onChange?.(e);
    onValueChange?.(val);
    syncFromInput(true);
  };

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword((prev) => !prev);
    // Maintain input focus
    inputRef.current?.focus();
  };

  // Border color calculation matching Figma specifications
  const borderColor = useMemo(() => {
    if (isFocused) return "#626467"; // Active / focused
    if (isHovered) return "#B0B7C3";
    return "#D8DEE9"; // Figma idle input border
  }, [isFocused, isHovered]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full p-4 select-none ${className}`}
    >
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => inputRef.current?.focus()}
        className="relative w-full max-w-[404px] h-[60px] bg-white cursor-text select-none group"
        style={{
          clipPath: `path('${clipPath}')`,
        }}
      >
        {/* iOS 100% Corner Smoothing Squircle Border Overlay (fill="none" so it never obscures text) */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
          viewBox={`0 0 ${containerWidth} 60`}
          fill="none"
        >
          <path
            d={strokePath}
            fill="none"
            stroke={borderColor}
            strokeWidth="1"
            className="transition-colors duration-200"
          />
        </svg>

        {/* Floating Animated Label matching Figma Node 2204:1143 & 1469:6411 */}
        <motion.label
          htmlFor={inputId}
          initial={false}
          animate={{
            y: isFloating ? 11.5 : 23,
            scale: isFloating ? 0.857 : 1, // 14px * 0.857 ≈ 12px
            color: isFocused ? "#626467" : "#98A2B3",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          style={{ transformOrigin: "left top" }}
          className="absolute left-[16px] top-0 pointer-events-none select-none font-sans font-medium text-[14px] leading-[1.2] whitespace-nowrap z-20"
        >
          {label}
        </motion.label>

        {/* Smooth Typing Display Layer (z-10 on top of background) */}
        <div
          ref={displayRef}
          aria-hidden="true"
          className="absolute left-[16px] top-[26px] right-[48px] h-[26px] pointer-events-none font-sans font-medium text-[16px] leading-[26px] text-[#1F2123] z-10 overflow-hidden whitespace-nowrap flex items-center"
          style={{
            fontFeatureSettings: '"ordn" 1, "salt" 1, "lnum" 1, "pnum" 1, "frac" 1',
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {characters.map((item, index) => (
              <motion.span
                key={item.id}
                data-char-index={index}
                initial={{
                  opacity: 0,
                  y: 2,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -2,
                  scale: 0.9,
                }}
                transition={{
                  type: "spring",
                  stiffness: 550,
                  damping: 30,
                  mass: 0.4,
                }}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  flexShrink: 0,
                  height: "26px",
                  lineHeight: "26px",
                  letterSpacing: !showPassword ? "2px" : "normal",
                }}
              >
                {item.char}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Smooth Animated Caret Cursor { | } */}
        <motion.div
          aria-hidden="true"
          className="absolute top-[29px] left-0 w-[1.5px] h-[19px] bg-[#1F2123] rounded-full pointer-events-none z-20"
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

        {/* Native HTML Password Input */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type={showPassword ? "text" : "password"}
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
          onBlur={() => setIsFocused(false)}
          className="absolute left-[16px] top-[26px] right-[48px] h-[26px] p-0 bg-transparent outline-none font-sans font-medium text-[16px] leading-[26px] text-transparent caret-transparent z-10 selection:bg-[#1F2123]/15 selection:text-transparent"
          style={{
            caretColor: "transparent",
            color: "transparent",
            fontFeatureSettings: '"ordn" 1, "salt" 1, "lnum" 1, "pnum" 1',
            lineHeight: "26px",
          }}
        />

        {/* 
          Right Action: Password Visibility Toggle Button
          Features smooth spring flip and scale morph animation between Eye Closed and Eye Open icons
          matching Figma Node 2204:1143, 2204:1144, 2204:1145
        */}
        <div className="absolute right-[16px] top-1/2 -translate-y-1/2 flex items-center justify-center z-30">
          <motion.button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            whileTap={{ scale: 0.88 }}
            className="size-[24px] flex items-center justify-center text-[#626467] hover:text-[#1F2123] transition-colors cursor-pointer select-none outline-none group"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {showPassword ? (
                <motion.div
                  key="eye-open-icon"
                  initial={{
                    opacity: 0,
                    scale: 0.75,
                    rotate: -20,
                    filter: "blur(1px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.75,
                    rotate: 20,
                    filter: "blur(1px)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 24,
                    mass: 0.6,
                  }}
                  className="size-[24px] flex items-center justify-center"
                >
                  <EyeOpenIcon className="size-[24px] text-[#626467] group-hover:text-[#1F2123] transition-colors" />
                </motion.div>
              ) : (
                <motion.div
                  key="eye-closed-icon"
                  initial={{
                    opacity: 0,
                    scale: 0.75,
                    rotate: 20,
                    filter: "blur(1px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.75,
                    rotate: -20,
                    filter: "blur(1px)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 24,
                    mass: 0.6,
                  }}
                  className="size-[24px] flex items-center justify-center"
                >
                  <EyeClosedIcon className="size-[24px] text-[#626467] group-hover:text-[#1F2123] transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default SmoothPasswordInput;
