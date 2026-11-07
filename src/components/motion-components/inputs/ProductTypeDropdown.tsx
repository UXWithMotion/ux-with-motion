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

// ─── Default Product Options ────────────────────────────────────────────────

export const DEFAULT_PRODUCT_OPTIONS = [
  "Physical product",
  "Digital product",
  "Subscription",
  "Service",
  "Other",
];

// ─── Component Props ─────────────────────────────────────────────────────────

export interface ProductTypeDropdownProps {
  className?: string;
  property1?: "Default" | "Input" | "Selected";
  property2?: "Product type dropdown";
  placeholder?: string;
  options?: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export function ProductTypeDropdown({
  className = "",
  property1 = "Default",
  placeholder = "Select product type",
  options = DEFAULT_PRODUCT_OPTIONS,
  value,
  defaultValue,
  onChange,
  disabled = false,
  id,
}: ProductTypeDropdownProps) {
  const generatedId = useId();
  const dropdownId = id || generatedId;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState(404);

  // Initialize selected value based on property1 variant or defaultValue
  const initialValue =
    value !== undefined
      ? value
      : defaultValue !== undefined
      ? defaultValue
      : property1 === "Selected"
      ? "Physical product"
      : "";

  const [selectedValue, setSelectedValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(property1 === "Input");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);

  // Sync state when property1 or controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    } else if (property1 === "Selected") {
      setSelectedValue("Physical product");
    } else if (property1 === "Default") {
      setSelectedValue("");
    }

    if (property1 === "Input") {
      setIsOpen(true);
    } else if (property1 === "Default" || property1 === "Selected") {
      setIsOpen(false);
    }
  }, [property1, value]);

  // ResizeObserver for dynamic iOS continuous squircle curvature
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
      strokePath: getSquirclePath(containerWidth, 60, 12, 1.0, 0.75),
      clipPath: getSquirclePath(containerWidth, 60, 12, 1.0, 0),
    };
  }, [containerWidth]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (option: string) => {
    if (value === undefined) {
      setSelectedValue(option);
    }
    onChange?.(option);
    setIsOpen(false);
  };

  const currentText = selectedValue || placeholder;
  const isSelectedState = Boolean(selectedValue);

  // Border color calculation matching Figma specifications
  const borderColor = useMemo(() => {
    if (isOpen) return "#1F2123"; // Dark / black border for entire div when open (Figma node 2246:5350)
    if (isTriggerHovered) return "#B0B7C3";
    return "#D8DEE9"; // Figma idle input border
  }, [isOpen, isTriggerHovered]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full p-4 select-none ${className}`}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-[404px] flex flex-col"
      >
        {/* ── Trigger Button (Figma Node 2246:5350) ── */}
        <button
          ref={triggerRef}
          type="button"
          id={dropdownId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={handleToggle}
          onMouseEnter={() => setIsTriggerHovered(true)}
          onMouseLeave={() => setIsTriggerHovered(false)}
          disabled={disabled}
          className="relative w-full h-[60px] flex items-center justify-between pl-[16px] pr-0 py-0 bg-white cursor-pointer select-none text-left overflow-hidden group outline-none"
          style={{
            clipPath: `path('${clipPath}')`,
          }}
        >
          {/* Left Text with Gentle Morph Transition */}
          <div className="relative z-10 flex-1 min-w-0 pr-[12px] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={currentText}
                initial={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`block font-sans font-normal text-[14px] leading-[20px] truncate ${
                  isSelectedState ? "text-[#1F2123]" : "text-[#98A2B3]"
                }`}
              >
                {currentText}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Right Arrow Area Block matching Figma Node 2246:5352 */}
          <div className="relative z-10 bg-[#E6E9EC] h-full flex items-center justify-center px-[16px] py-[14px] shrink-0">
            {/* Smooth 180° Spring Rotation Chevron matching Figma Asset */}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 26,
                mass: 0.8,
              }}
              className="size-[24px] flex items-center justify-center text-[#050505]"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 9L12 16L5 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>

          {/* iOS 100% Corner Smoothing Squircle Border Overlay (z-20 on top of entire div) */}
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
              strokeWidth="1.5"
              className="transition-colors duration-200"
            />
          </svg>
        </button>

        {/* ── Dropdown Menu (Figma Node 2246:5354) with Gentle Morph Animation ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="product-dropdown-menu-wrapper"
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                marginTop: 8,
                transition: {
                  height: {
                    duration: 0.36,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  marginTop: {
                    duration: 0.36,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: {
                    duration: 0.22,
                    ease: "easeOut",
                  },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                marginTop: 0,
                transition: {
                  height: {
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  marginTop: {
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: {
                    duration: 0.16,
                    ease: "easeIn",
                  },
                },
              }}
              style={{
                transformOrigin: "top center",
              }}
              className="w-full overflow-hidden z-30"
            >
              <div
                ref={menuRef}
                role="listbox"
                className="w-full bg-white border border-[#D7DADD] rounded-[12px] p-[8px] flex flex-col gap-[2px] shadow-[0px_4px_16px_0px_rgba(31,33,36,0.08)] mb-[2px]"
              >
                {options.map((option, index) => {
                  const isSelected = selectedValue === option;
                  const isHovered = hoveredIndex === index;

                  return (
                    <motion.button
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.04 + index * 0.025,
                        duration: 0.26,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="relative w-full h-[44px] px-[12px] rounded-[8px] flex items-center justify-between text-left cursor-pointer select-none transition-colors duration-150 overflow-hidden group outline-none"
                    >
                      {/* Floating Smooth Background Pill */}
                      {isSelected && !isHovered && (
                        <div className="absolute inset-0 bg-[#F5F6F7] rounded-[8px] z-0" />
                      )}

                      {isHovered && (
                        <motion.div
                          layoutId="product-dropdown-active-pill"
                          className="absolute inset-0 bg-[#F5F6F7] rounded-[8px] z-0"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}

                      {/* Option Label */}
                      <span
                        className={`relative z-10 font-sans font-normal text-[14px] leading-[20px] transition-colors ${
                          isSelected || isHovered
                            ? "text-[#1F2123] font-medium"
                            : "text-[#1F2123]"
                        }`}
                      >
                        {option}
                      </span>

                      {/* Subtle selection dot indicator */}
                      {isSelected && (
                        <motion.div
                          layoutId="product-dropdown-indicator"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative z-10 size-[6px] rounded-full bg-[#1F2123] shrink-0 mr-1"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ProductTypeDropdown;
