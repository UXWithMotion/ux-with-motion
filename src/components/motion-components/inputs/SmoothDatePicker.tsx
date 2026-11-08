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

// ─── Figma MCP Icons ─────────────────────────────────────────────────────────

/**
 * Calendar Icon from Figma Node 1466:5563 / 1087:4179 (fi-rr-calendar)
 * Exact vector geometry matching Figma design context
 */
export function CalendarIcon({
  className = "size-[24px] text-[#1F2123]",
}: {
  className?: string;
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.04 2H18V0.96Q18 0.56 17.72 0.28Q17.44 0 17 0Q16.56 0 16.28 0.28Q16 0.56 16 0.96V2H8V0.96Q8 0.56 7.72 0.28Q7.44 0 7 0Q6.56 0 6.28 0.28Q6 0.56 6 0.96V2H5.04Q3.68 2 2.52 2.68Q1.36 3.36 0.68 4.52Q0 5.68 0 6.96V18.96Q0 20.32 0.68 21.48Q1.36 22.64 2.52 23.32Q3.68 24 4.96 24H19.04Q20.32 24 21.48 23.32Q22.64 22.64 23.32 21.48Q24 20.32 24 19.04V6.96Q24 5.68 23.32 4.52Q22.64 3.36 21.48 2.68Q20.32 2 19.04 2ZM2 6.96Q2 5.76 2.88 4.88Q3.76 4 4.96 4H19.04Q20.24 4 21.12 4.88Q22 5.76 22 7.04V8H2ZM19.04 22H5.04Q3.76 22 2.88 21.12Q2 20.24 2 19.04V10H22V18.96Q22 20.24 21.12 21.12Q20.24 22 18.96 22ZM10.48 14.96Q10.48 15.6 10.92 16.04Q11.36 16.48 12 16.48Q12.64 16.48 13.08 16.04Q13.52 15.6 13.52 15Q13.52 14.4 13.08 13.96Q12.64 13.52 12 13.52Q11.36 13.52 10.92 13.96Q10.48 14.4 10.48 15.04ZM5.52 14.96Q5.52 15.6 5.96 16.04Q6.4 16.48 7 16.48Q7.6 16.48 8.04 16.04Q8.48 15.6 8.48 15Q8.48 14.4 8.04 13.96Q7.6 13.52 7 13.52Q6.4 13.52 5.96 13.96Q5.52 14.4 5.52 15.04ZM15.52 14.96Q15.52 15.6 15.96 16.04Q16.4 16.48 17 16.48Q17.6 16.48 18.04 16.04Q18.48 15.6 18.48 15Q18.48 14.4 18.04 13.96Q17.6 13.52 17 13.52Q16.4 13.52 15.96 13.96Q15.52 14.4 15.52 15.04Z" />
    </svg>
  );
}

/**
 * Chevron Left Icon from Figma Node 2249:1260
 */
export function ChevronLeftIcon({
  className = "size-[16px] text-[#62646A]",
}: {
  className?: string;
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Chevron Right Icon from Figma Node 2249:1263
 */
export function ChevronRightIcon({
  className = "size-[16px] text-[#62646A]",
}: {
  className?: string;
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 12L10 8L6 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Constants & Date Helpers ────────────────────────────────────────────────

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

function parseDDMMYYYY(str: string): Date | null {
  if (!str) return null;
  const parts = str.split("-");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface SmoothDatePickerProps {
  className?: string;
  property1?: "Default" | "Open" | "Choose month" | "Choose year";
  value?: string;
  defaultValue?: string;
  onChange?: (dateString: string, date: Date | null) => void;
  disabled?: boolean;
}

export function SmoothDatePicker({
  className = "",
  property1,
  value,
  defaultValue,
  onChange,
  disabled = false,
}: SmoothDatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date (defaulting to Figma's reference date: 8 Nov 2026 or defaultValue)
  const initialSelected = useMemo(() => {
    if (value) return parseDDMMYYYY(value);
    if (defaultValue) return parseDDMMYYYY(defaultValue);
    // When in open variant from Figma preview, default to Nov 8, 2026
    if (property1 && property1 !== "Default") {
      return new Date(2026, 10, 8);
    }
    return null;
  }, [value, defaultValue, property1]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialSelected);
  const [tentativeDate, setTentativeDate] = useState<Date | null>(initialSelected);

  // Active view: "calendar" | "month" | "year"
  const [view, setView] = useState<"calendar" | "month" | "year">(() => {
    if (property1 === "Choose month") return "month";
    if (property1 === "Choose year") return "year";
    return "calendar";
  });

  // Open / Closed popover state
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (property1 && property1 !== "Default") return true;
    return false;
  });

  // Current calendar viewing month and year
  const [viewYear, setViewYear] = useState<number>(() => {
    return initialSelected ? initialSelected.getFullYear() : 2026;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return initialSelected ? initialSelected.getMonth() : 10; // November
  });

  // Year range start for the 12-year window (e.g. 2020)
  const [yearRangeStart, setYearRangeStart] = useState<number>(() => {
    const y = initialSelected ? initialSelected.getFullYear() : 2026;
    return Math.floor(y / 12) * 12 + (y % 12 < 4 ? -4 : 0) || 2020;
  });

  // Sync external property1 variant changes (for Admin / Builder state switching)
  useEffect(() => {
    if (!property1) return;
    if (property1 === "Default") {
      setIsOpen(false);
      setView("calendar");
    } else if (property1 === "Open") {
      setIsOpen(true);
      setView("calendar");
      if (!selectedDate) {
        setSelectedDate(new Date(2026, 10, 8));
        setTentativeDate(new Date(2026, 10, 8));
      }
    } else if (property1 === "Choose month") {
      setIsOpen(true);
      setView("month");
    } else if (property1 === "Choose year") {
      setIsOpen(true);
      setView("year");
    }
  }, [property1]);

  // Sync external value prop
  useEffect(() => {
    if (value !== undefined) {
      const parsed = parseDDMMYYYY(value);
      setSelectedDate(parsed);
      setTentativeDate(parsed);
      if (parsed) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }, [value]);

  // Close popover when clicking outside (unless in forced open mode from property1)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (property1 && property1 !== "Default") return;
      if (
        rootRef.current &&
        !rootRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [property1]);

  // Squircles for input trigger (197 x 60, corner radius 12)
  const triggerSquircle = useMemo(() => {
    return getSquirclePath(197, 60, 12, 1.0, 0.5);
  }, []);

  // Compute days for calendar view
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    // Previous month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNumber = daysInPrevMonth - i;
      const d = new Date(viewYear, viewMonth - 1, dayNumber);
      const isSelected =
        !!tentativeDate &&
        d.getDate() === tentativeDate.getDate() &&
        d.getMonth() === tentativeDate.getMonth() &&
        d.getFullYear() === tentativeDate.getFullYear();
      days.push({
        date: d,
        dayNumber,
        isCurrentMonth: false,
        isSelected,
        isToday: false,
      });
    }

    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(viewYear, viewMonth, i);
      const isSelected =
        !!tentativeDate &&
        d.getDate() === tentativeDate.getDate() &&
        d.getMonth() === tentativeDate.getMonth() &&
        d.getFullYear() === tentativeDate.getFullYear();
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isSelected,
        isToday,
      });
    }

    // Next month overflow days (fill up grid to 35 or 42 slots)
    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(viewYear, viewMonth + 1, i);
      const isSelected =
        !!tentativeDate &&
        d.getDate() === tentativeDate.getDate() &&
        d.getMonth() === tentativeDate.getMonth() &&
        d.getFullYear() === tentativeDate.getFullYear();
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isSelected,
        isToday: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, tentativeDate]);

  // Navigate Previous
  const handlePrev = useCallback(() => {
    if (view === "calendar" || view === "month") {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else if (view === "year") {
      setYearRangeStart((y) => y - 12);
    }
  }, [view, viewMonth]);

  // Navigate Next
  const handleNext = useCallback(() => {
    if (view === "calendar" || view === "month") {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    } else if (view === "year") {
      setYearRangeStart((y) => y + 12);
    }
  }, [view, viewMonth]);

  // Click on a date cell
  const handleSelectDay = (date: Date) => {
    setTentativeDate(date);
    if (date.getMonth() !== viewMonth) {
      setViewMonth(date.getMonth());
      setViewYear(date.getFullYear());
    }
  };

  // Click on Month Option
  const handleSelectMonth = (monthIndex: number) => {
    setViewMonth(monthIndex);
    setView("calendar");
  };

  // Click on Year Option
  const handleSelectYear = (year: number) => {
    setViewYear(year);
    setView("calendar");
  };

  // Actions
  const handleToday = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const today = new Date();
    setTentativeDate(today);
    setSelectedDate(today);
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  const handleApply = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetDate = tentativeDate || selectedDate || new Date(viewYear, viewMonth, 1);
    setSelectedDate(targetDate);
    const formatted = formatDDMMYYYY(targetDate);
    onChange?.(formatted, targetDate);
    setIsOpen(false);
  };

  const handleDone = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setView("calendar");
  };

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  // Display value in input trigger
  const displayValue = selectedDate ? formatDDMMYYYY(selectedDate) : "DD-MM-YYYY";
  const isPlaceholder = !selectedDate;

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex flex-col items-center select-none font-sans w-[280px] ${className}`}
    >
      {/* ─── Input Trigger (Figma Nodes 2246:5132 & 2249:1248) ──────────────── */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        whileTap={{ scale: disabled ? 1 : 0.985 }}
        className={`relative w-[197px] h-[60px] bg-white rounded-[12px] border transition-colors duration-200 cursor-pointer flex items-center justify-between outline-none select-none group shrink-0 ${
          isOpen ? "border-[#62646A]" : "border-[#D8DEE9] hover:border-[#B9C0CB]"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {/* Text / Value */}
        <div className="pl-[16px] pr-[8px] flex items-center">
          <span
            className={`font-sans text-[14px] leading-[20px] tracking-[0px] select-none transition-colors ${
              isPlaceholder ? "text-[#98A2B3]" : "text-[#1F2123]"
            }`}
          >
            {displayValue}
          </span>
        </div>

        {/* Right Icon Box matching Figma Node 1466:5562 & 2249:1250 */}
        <div
          className="w-[56px] h-full bg-[#E6E9EC] flex items-center justify-center shrink-0 rounded-r-[11px] transition-colors group-hover:bg-[#DFE3E7]"
          aria-hidden="true"
        >
          <CalendarIcon className="size-[24px] text-[#1F2123]" />
        </div>
      </motion.button>

      {/* ─── Calendar Popover (Figma Node 2249:1257 - Compact & Refined) ────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            onClick={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.96,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              transition: {
                duration: 0.28,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.22, ease: "easeOut" },
                filter: { duration: 0.22, ease: "easeOut" },
              },
            }}
            exit={{
              opacity: 0,
              y: -6,
              scale: 0.97,
              filter: "blur(6px)",
              transition: {
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
            style={{
              willChange: "transform, opacity, filter",
            }}
            className="w-[280px] bg-white rounded-[12px] border border-[#D7DADD] p-[12px] flex flex-col shadow-[0px_10px_25px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] mt-[8px]"
          >
            {/* Header: Month Navigation (Figma Node 2249:1258) */}
            <div className="flex items-center w-full h-[28px] gap-[4px]">
              {/* Choose Month Pill Button */}
              <button
                type="button"
                onClick={() => setView((prev) => (prev === "month" ? "calendar" : "month"))}
                className={`h-[28px] px-[10px] rounded-[6px] flex items-center justify-center font-medium text-[13px] leading-[18px] text-[#1F2123] transition-colors cursor-pointer ${
                  view === "month"
                    ? "bg-[#F5F6F7]"
                    : "hover:bg-[#F5F6F7]/70 bg-transparent"
                }`}
                aria-label="Choose month"
              >
                {MONTH_NAMES[viewMonth]}
              </button>

              {/* Choose Year Pill Button */}
              <button
                type="button"
                onClick={() => setView((prev) => (prev === "year" ? "calendar" : "year"))}
                className={`h-[28px] px-[10px] rounded-[6px] flex items-center justify-center font-medium text-[13px] leading-[18px] text-[#1F2123] transition-colors cursor-pointer ${
                  view === "year"
                    ? "bg-[#F5F6F7]"
                    : "hover:bg-[#F5F6F7]/70 bg-transparent"
                }`}
                aria-label="Choose year"
              >
                {viewYear}
              </button>

              {/* Header Spacer */}
              <div className="flex-1" />

              {/* Previous Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="size-[28px] rounded-[6px] border border-[#D7DADD] flex items-center justify-center text-[#62646A] hover:text-[#1F2123] hover:bg-[#F5F6F7] transition-all cursor-pointer outline-none"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="size-[14px]" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="size-[28px] rounded-[6px] border border-[#D7DADD] flex items-center justify-center text-[#62646A] hover:text-[#1F2123] hover:bg-[#F5F6F7] transition-all cursor-pointer outline-none"
                aria-label="Next"
              >
                <ChevronRightIcon className="size-[14px]" />
              </button>
            </div>

            {/* ─── Animated View Body ────────────────────────────────────────── */}
            <div className="mt-[8px] w-full min-h-[195px] relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {/* ── View 1: Calendar Day Grid (Figma Node 2249:1266) ── */}
                {view === "calendar" && (
                  <motion.div
                    key="calendar-view"
                    initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col w-full"
                  >
                    {/* Weekday Labels (Figma Node 2249:1267) */}
                    <div className="grid grid-cols-7 w-full h-[22px] items-center">
                      {WEEKDAY_NAMES.map((day) => (
                        <div
                          key={day}
                          className="flex items-center justify-center font-medium text-[11px] leading-[14px] text-[#62646A] select-none"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Days Grid (Figma Nodes 2249:1282 - 2249:1342) */}
                    <div className="grid grid-cols-7 w-full gap-y-0 select-none">
                      {calendarDays.map((item, idx) => (
                        <button
                          key={`${item.date.toISOString()}-${idx}`}
                          type="button"
                          onClick={() => handleSelectDay(item.date)}
                          className={`size-[34px] rounded-[6px] flex items-center justify-center text-[13px] leading-[18px] font-sans transition-colors cursor-pointer outline-none relative mx-auto ${
                            item.isSelected
                              ? "bg-[#1F2123] text-white font-medium shadow-sm"
                              : item.isCurrentMonth
                              ? "text-[#1F2123] hover:bg-[#F5F6F7]"
                              : "text-[#98A2B3] hover:bg-[#F5F6F7]/60"
                          }`}
                        >
                          {item.dayNumber}
                          {item.isToday && !item.isSelected && (
                            <span
                              aria-hidden="true"
                              className="absolute bottom-[3px] size-[3px] rounded-full bg-[#1F2123]"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── View 2: Month Selection (Figma Node 2253:1674) ── */}
                {view === "month" && (
                  <motion.div
                    key="month-view"
                    initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col w-full"
                  >
                    <p className="font-medium text-[11px] leading-[14px] text-[#62646A] mb-[8px] select-none">
                      Select a month
                    </p>
                    <div className="grid grid-cols-3 gap-[6px] w-full">
                      {MONTH_SHORT_NAMES.map((name, index) => {
                        const isSelected = viewMonth === index;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => handleSelectMonth(index)}
                            className={`h-[36px] rounded-[6px] flex items-center justify-center font-medium text-[13px] leading-[18px] transition-colors cursor-pointer outline-none ${
                              isSelected
                                ? "bg-[#1F2123] text-white shadow-sm"
                                : "text-[#62646A] hover:bg-[#F5F6F7] hover:text-[#1F2123]"
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── View 3: Year Selection (Figma Node 2253:1705) ── */}
                {view === "year" && (
                  <motion.div
                    key="year-view"
                    initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col w-full"
                  >
                    <p className="font-medium text-[11px] leading-[14px] text-[#62646A] mb-[8px] select-none">
                      Select a year
                    </p>
                    <div className="grid grid-cols-3 gap-[6px] w-full">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const year = yearRangeStart + i;
                        const isSelected = viewYear === year;
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => handleSelectYear(year)}
                            className={`h-[36px] rounded-[6px] flex items-center justify-center font-medium text-[13px] leading-[18px] transition-colors cursor-pointer outline-none ${
                              isSelected
                                ? "bg-[#1F2123] text-white shadow-sm"
                                : "text-[#62646A] hover:bg-[#F5F6F7] hover:text-[#1F2123]"
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Divider (Figma Node 2249:1357) ───────────────────────────── */}
            <div className="w-full h-px bg-[#D7DADD] my-[8px] shrink-0" />

            {/* ─── Actions Row (Figma Node 2249:1358 & 2253:1505) ───────────── */}
            <div className="flex items-center w-full h-[34px] gap-[6px] shrink-0">
              {view === "calendar" ? (
                <>
                  {/* Today Button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleToday}
                    className="flex-1 h-[34px] rounded-[6px] flex items-center justify-center font-medium text-[13px] leading-[18px] text-[#62646A] hover:bg-[#F5F6F7] hover:text-[#1F2123] transition-colors cursor-pointer outline-none"
                  >
                    Today
                  </motion.button>

                  {/* Apply Button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleApply}
                    className="flex-1 h-[34px] rounded-[6px] bg-[#1F2123] text-white flex items-center justify-center font-medium text-[13px] leading-[18px] hover:bg-[#33373B] active:bg-[#000000] transition-all cursor-pointer outline-none shadow-sm"
                  >
                    Apply
                  </motion.button>
                </>
              ) : (
                /* Done Button for Month/Year Selection */
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleDone}
                  className="w-full h-[34px] rounded-[6px] bg-[#1F2123] text-white flex items-center justify-center font-medium text-[13px] leading-[18px] hover:bg-[#33373B] active:bg-[#000000] transition-all cursor-pointer outline-none shadow-sm"
                >
                  Done
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SmoothDatePicker;
