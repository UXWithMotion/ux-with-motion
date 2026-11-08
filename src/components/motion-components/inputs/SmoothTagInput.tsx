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

// ─── Default Sample Tags from Figma (Node 2205:1221) ─────────────────────────
const FIGMA_SAMPLE_TAGS = [
  "Drawing",
  "Reading",
  "Dancing",
  "Singing",
  "Painting",
  "Cooking",
];

// ─── Component Props ─────────────────────────────────────────────────────────

export interface SmoothTagInputProps {
  className?: string;
  property1?: "Default" | "tag collapse" | "tag expand";
  label?: string;
  placeholder?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  maxVisibleTags?: number;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export function SmoothTagInput({
  className = "",
  property1,
  label = "Hobbies",
  placeholder,
  value,
  defaultValue,
  onChange,
  maxVisibleTags = 3,
  disabled = false,
  name = "tags",
  id,
}: SmoothTagInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Determine initial tags from props or Figma variant
  const getInitialTags = useCallback(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    if (property1 === "tag collapse" || property1 === "tag expand") {
      return [...FIGMA_SAMPLE_TAGS];
    }
    if (property1 === "Default") {
      return [];
    }
    return [...FIGMA_SAMPLE_TAGS];
  }, [value, defaultValue, property1]);

  const [tags, setTags] = useState<string[]>(getInitialTags);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [caretIndex, setCaretIndex] = useState(0);
  const [caretX, setCaretX] = useState(0);
  const [isExpanded, setIsExpanded] = useState(property1 === "tag expand");

  // Keep internal tags synced with controlled prop if provided
  useEffect(() => {
    if (value !== undefined) {
      setTags(value);
    }
  }, [value]);

  // Keep variant state synced when property1 prop changes (e.g. from Admin Controls)
  useEffect(() => {
    if (property1 === "Default") {
      setTags([]);
      setIsExpanded(false);
    } else if (property1 === "tag collapse") {
      if (tags.length === 0) setTags([...FIGMA_SAMPLE_TAGS]);
      setIsExpanded(false);
    } else if (property1 === "tag expand") {
      if (tags.length === 0) setTags([...FIGMA_SAMPLE_TAGS]);
      setIsExpanded(true);
    }
  }, [property1]);

  // Close / collapse tags when clicking outside of the component
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasTags = tags.length > 0;
  const isFloating = isFocused || hasTags || inputValue.length > 0;
  const shouldCollapse = tags.length > maxVisibleTags && !isExpanded;

  const visibleTags = useMemo(() => {
    if (shouldCollapse) {
      return tags.slice(0, maxVisibleTags);
    }
    return tags;
  }, [tags, shouldCollapse, maxVisibleTags]);

  const hiddenCount = Math.max(0, tags.length - maxVisibleTags);

  // ─── Smooth Typing: Characters array with unique keys ───────────────────────
  const characters = useMemo(() => {
    return Array.from(inputValue).map((char, index) => ({
      id: `${index}-${char}`,
      char,
    }));
  }, [inputValue]);

  // Synchronize caret position & typing state from native input
  const syncFromInput = useCallback((isKeystroke = false) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    setCaretIndex(start);

    if (isKeystroke) {
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 380);
    }
  }, []);

  // Synchronize horizontal scrolling between real input and display layer
  const syncScroll = useCallback(() => {
    if (displayRef.current && inputRef.current) {
      displayRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  }, []);

  // Measure exact right-edge position of current character in the typing row
  const syncCaretX = useCallback(() => {
    if (!inputRef.current) return;
    const scrollLeft = inputRef.current.scrollLeft || 0;

    if (caretIndex === 0 || inputValue.length === 0) {
      setCaretX(-scrollLeft);
      return;
    }

    if (!displayRef.current) return;
    const targetIdx = Math.min(caretIndex - 1, inputValue.length - 1);
    const charEl = displayRef.current.querySelector(
      `[data-char-index="${targetIdx}"]`
    ) as HTMLElement | null;

    if (charEl) {
      setCaretX(charEl.offsetLeft + charEl.offsetWidth - scrollLeft);
    }
  }, [caretIndex, inputValue]);

  useIsomorphicLayoutEffect(() => {
    syncCaretX();
    syncScroll();
    const rafId = requestAnimationFrame(() => {
      syncCaretX();
      syncScroll();
    });
    return () => cancelAnimationFrame(rafId);
  }, [inputValue, caretIndex, syncCaretX, syncScroll]);

  const updateTags = (newTags: string[]) => {
    setTags(newTags);
    onChange?.(newTags);
  };

  const handleAddTag = (rawText: string) => {
    const trimmed = rawText.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      updateTags([...tags, trimmed]);
    }
    setInputValue("");
    setCaretIndex(0);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, idx) => idx !== indexToRemove);
    updateTags(newTags);
    if (newTags.length <= maxVisibleTags) {
      setIsExpanded(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    syncFromInput(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      handleRemoveTag(tags.length - 1);
    } else if (e.key === "Escape") {
      setIsExpanded(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
    inputRef.current?.focus();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if ((e.target as HTMLElement).closest("button")) return;
    setIsFocused(true);
    if (tags.length > maxVisibleTags) {
      setIsExpanded(true);
    }
    inputRef.current?.focus();
  };

  const displayLabel = label || placeholder || "Hobbies";

  return (
    <motion.div
      ref={containerRef}
      layout
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleContainerClick}
      className={`relative w-full max-w-[404px] bg-white rounded-[12px] border transition-colors duration-200 cursor-text select-none min-h-[60px] px-[16px] pt-[8px] pb-[8px] flex flex-col justify-start ${
        isFocused || isFloating
          ? "border-[#626467]"
          : "border-[#D8DEE9] hover:border-[#B7BABD]"
      } ${className}`}
      style={{
        fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
      }}
    >
      {/* ─── Floating Label (Figma Node 1466:5592 & 1471:6610) ─────────── */}
      <motion.label
        htmlFor={inputId}
        initial={false}
        animate={{
          top: isFloating ? 8 : 21,
          fontSize: isFloating ? "12px" : "14px",
          lineHeight: isFloating ? "14px" : "18px",
          fontWeight: isFloating ? 500 : 400,
          color: "#98A2B3",
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-[16px] pointer-events-none origin-top-left select-none z-10"
      >
        {displayLabel}
      </motion.label>

      {/* ─── Tags & Inline Input Row ──────────────────────────────────── */}
      {isFloating && (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="mt-[18px] flex flex-wrap items-center gap-[10px] w-full"
        >
          {/* Animated Tags */}
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleTags.map((tag, idx) => (
              <motion.span
                key={`${tag}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-[26px] max-w-[200px] bg-[#1F2123] rounded-[8px] pl-[8px] pr-[4px] flex items-center gap-[4px] shrink-0 select-none shadow-sm"
                title={tag}
              >
                <span className="text-[14px] leading-[18px] text-white font-normal truncate">
                  {tag}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(idx);
                    }}
                    aria-label={`Remove tag ${tag}`}
                    className="w-[18px] h-[18px] flex items-center justify-center text-white/80 hover:text-white rounded-[4px] hover:bg-white/10 active:scale-90 transition-all cursor-pointer outline-none shrink-0"
                  >
                    {/* Exact Figma MCP Vector: Menu / Close_SM (Node 1471:6628) */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[18px] h-[18px] shrink-0"
                    >
                      <path
                        d="M12 6L6 12M6 6L12 12"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* ─── Expand Counter Pill (Figma Node 1471:6631) ─────────── */}
          {hiddenCount > 0 && !isExpanded && (
            <motion.button
              layout
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={toggleExpand}
              title={`Show ${hiddenCount} more tags`}
              className="h-[26px] min-w-[30px] px-[6px] bg-[#1F2123] rounded-[8px] flex items-center justify-center text-[14px] leading-[18px] text-white font-normal cursor-pointer select-none hover:bg-[#33373B] transition-colors shadow-sm outline-none shrink-0"
            >
              +{hiddenCount}
            </motion.button>
          )}

          {/* ─── Smooth Typing Inline Input Area ──────────────────────── */}
          {!disabled && (
            <div
              className={`relative inline-flex items-center h-[26px] transition-all duration-200 ${
                isFocused || inputValue.length > 0 || tags.length === 0
                  ? "min-w-[60px] flex-1 opacity-100"
                  : "w-0 min-w-0 opacity-0 pointer-events-none"
              }`}
            >
              {/* 
                Smooth Character Display Layer:
                Renders each typed character with individual spring physics, scale, and subtle blur morph.
              */}
              <div
                ref={displayRef}
                aria-hidden="true"
                className="absolute inset-0 w-full h-full pointer-events-none font-sans font-normal text-[14px] leading-[18px] text-[#1F2123] flex items-center overflow-hidden whitespace-pre z-0"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {characters.map((item, index) => (
                    <motion.span
                      key={item.id}
                      data-char-index={index}
                      initial={{
                        opacity: 0,
                        y: 3,
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
                Smooth Gliding Animated Caret Cursor:
                Smoothly glides with spring physics and stays solid while typing.
              */}
              {isFocused && (
                <motion.div
                  aria-hidden="true"
                  className="absolute top-[4px] left-0 w-[1.5px] h-[18px] bg-[#1F2123] rounded-full pointer-events-none z-20"
                  animate={{
                    x: caretX,
                    opacity: isTyping ? 1 : [1, 1, 0, 0, 1],
                  }}
                  transition={{
                    x: {
                      type: "spring",
                      stiffness: 480,
                      damping: 30,
                      mass: 0.45,
                    },
                    opacity: isTyping
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

              {/* Real Native Input with transparent text & caret */}
              <input
                ref={inputRef}
                id={inputId}
                name={name}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onScroll={syncScroll}
                onSelect={() => syncFromInput(false)}
                onFocus={() => {
                  setIsFocused(true);
                  syncFromInput(false);
                }}
                onBlur={() => {
                  setIsFocused(false);
                  if (inputValue.trim()) {
                    handleAddTag(inputValue);
                  }
                }}
                placeholder={
                  tags.length === 0 && !inputValue
                    ? "Type and press Enter..."
                    : ""
                }
                className="w-full h-full bg-transparent text-[14px] leading-[18px] text-transparent caret-transparent outline-none placeholder:text-[#98A2B3] z-10"
                disabled={disabled}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* When empty and not floating, native input to capture initial clicks and focus */}
      {!isFloating && (
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsFocused(true);
            syncFromInput(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            syncFromInput(false);
          }}
          className="sr-only"
          disabled={disabled}
        />
      )}
    </motion.div>
  );
}

export default SmoothTagInput;
