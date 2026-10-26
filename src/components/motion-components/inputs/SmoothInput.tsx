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

export interface SmoothInputProps {
  className?: string;
  property1?: "Field anatomy" | "Input container";
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  type?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
}

export function SmoothInput({
  className = "",
  property1 = "Field anatomy",
  label = "Full name",
  defaultValue,
  value,
  onChange,
  onValueChange,
  disabled = false,
  type = "text",
  name,
  id,
  autoComplete = "off",
}: SmoothInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const isSimulatingRef = useRef(false);

  // Initialize value based on Figma property1 variant or defaultValue
  const initialValue =
    value !== undefined
      ? value
      : defaultValue !== undefined
      ? defaultValue
      : property1 === "Input container"
      ? "Rakesh Pandu"
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

  // Sync when property1 or controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
      setCaretIndex(value.length);
    } else if (property1 === "Input container" && internalValue === "") {
      setInternalValue("Rakesh Pandu");
      setCaretIndex("Rakesh Pandu".length);
    } else if (property1 === "Field anatomy" && internalValue === "Rakesh Pandu") {
      setInternalValue("");
      setCaretIndex(0);
    }
  }, [property1, value]);

  const currentValue = value !== undefined ? value : internalValue;
  const isFloating = isFocused || currentValue.length > 0;

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
      // charEl.offsetLeft + charEl.offsetWidth gives the exact physical right edge of the character
      setCaretX(charEl.offsetLeft + charEl.offsetWidth - scrollLeft);
    }
  };

  useIsomorphicLayoutEffect(() => {
    syncCaretX();
    const rafId = requestAnimationFrame(syncCaretX);
    return () => cancelAnimationFrame(rafId);
  }, [currentValue, caretIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
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
  const handleAutoType = (demoText = "Rakesh Pandu") => {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;
    setInternalValue("");
    setCaretIndex(0);
    setIsFocused(true);
    setIsTyping(true);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < demoText.length) {
        const nextChunk = demoText.slice(0, idx + 1);
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
    }, 65);
  };

  return (
    <div className={`relative flex items-center justify-center w-full p-4 select-none ${className}`}>
      {/* 
        Container matching Figma Node 2126:2118:
        w-[404px], h-[60px], rounded-[12px], bg-white
      */}
      <motion.div
        initial={false}
        animate={{
          borderColor: isFocused
            ? "#626467"
            : isHovered
            ? "#b0b7c3"
            : "#d8dee9",
          boxShadow: "none",
        }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => inputRef.current?.focus()}
        className="relative w-full max-w-[404px] h-[60px] bg-white rounded-[12px] border border-solid overflow-hidden cursor-text transition-colors duration-200"
      >
        {/* Floating Animated Label */}
        <motion.label
          htmlFor={inputId}
          initial={false}
          animate={{
            y: isFloating ? -11 : 0,
            scale: isFloating ? 0.857 : 1, // 14px * 0.857 ≈ 12px
            color: isFocused ? "#626467" : "#98a2b3",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          style={{ transformOrigin: "left top" }}
          className="absolute left-[16px] top-[21px] pointer-events-none select-none font-sans font-medium text-[14px] leading-[1.2] whitespace-nowrap z-20"
        >
          {label}
        </motion.label>


        {/* 
          Smooth Typing Display Layer:
          Renders each character with individual spring physics, scale, and blur-morph entrance/exit.
        */}
        <div
          ref={displayRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none font-sans font-medium text-[16px] leading-[1.2] text-[#1f2123] pt-[22px] pb-[8px] pl-[16px] pr-[40px] z-0 overflow-hidden whitespace-nowrap flex items-start"
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
                  y: 4,
                  scale: 0.88,
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
                  scale: 0.88,
                  filter: "blur(2px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 550,
                  damping: 30,
                  mass: 0.4,
                }}
                style={{ display: "inline-block", whiteSpace: "pre", flexShrink: 0 }}
              >
                {item.char}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* 
          Smooth Animated Caret Cursor { | }:
          Glides smoothly to the right when typing with spring physics and momentum,
          stays solid while typing, and gently blinks when idle.
        */}
        <motion.div
          aria-hidden="true"
          className="absolute top-[24px] left-0 w-[1.5px] h-[19px] bg-[#1f2123] rounded-full pointer-events-none z-20"
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
          Real Native HTML Input:
          Caret and text are transparent so the smooth animated characters and caret are visible,
          while preserving native selection, mobile keyboards, paste, undo/redo, and accessibility.
        */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type={type}
          value={currentValue}
          disabled={disabled}
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
          className="w-full h-full bg-transparent outline-none font-sans font-medium text-[16px] leading-[1.2] text-transparent caret-transparent pt-[22px] pb-[8px] pl-[16px] pr-[40px] z-10 selection:bg-[#1f2123]/15 selection:text-transparent"
          style={{
            caretColor: "transparent",
            color: "transparent",
            fontFeatureSettings: '"ordn" 1, "salt" 1, "lnum" 1, "pnum" 1',
          }}
        />

        {/* Action Controls on the Right: Auto-type demo button when empty, Clear button when filled */}
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
                  handleAutoType("Rakesh Pandu");
                }}
                className="size-[24px] rounded-full hover:bg-[#f1f3f7] flex items-center justify-center text-[#b0b7c3] hover:text-[#626467] transition-colors cursor-pointer group"
                title="Try smooth typing demo"
              >
                {/* Wand / Sparkle Icon */}
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
                  title="Clear text"
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
      </motion.div>
    </div>
  );
}

export default SmoothInput;
