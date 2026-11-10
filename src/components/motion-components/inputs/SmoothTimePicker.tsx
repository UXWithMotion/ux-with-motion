"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Clock Icon (Exact Figma Node 1466:5574 / 2249:1367) ──────────────────────

function ClockIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M12 7.5V12L15.5 12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Constants & Math Helpers ────────────────────────────────────────────────

const CLOCK_RADIUS = 86; // radius from center (112, 112) to numbers center
const CENTER = 112; // center x and y in 224x224 dial

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function getHourCoordinates(hour: number) {
  // 12 is at -90 deg (top), each hour is 30 deg
  const angleDeg = hour * 30 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + CLOCK_RADIUS * Math.cos(angleRad),
    y: CENTER + CLOCK_RADIUS * Math.sin(angleRad),
    angleDeg: hour * 30,
  };
}

function getMinuteCoordinates(minute: number) {
  // 0 is at -90 deg (top), each minute is 6 deg
  const angleDeg = minute * 6 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + CLOCK_RADIUS * Math.cos(angleRad),
    y: CENTER + CLOCK_RADIUS * Math.sin(angleRad),
    angleDeg: minute * 6,
  };
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface SmoothTimePickerProps {
  className?: string;
  property1?: "Default" | "Open";
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (time: string, hours: number, minutes: number, period: "AM" | "PM") => void;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export function SmoothTimePicker({
  className = "",
  property1,
  value,
  defaultValue,
  placeholder = "HH-MM",
  onChange,
  disabled = false,
  name = "time-picker",
  id,
}: SmoothTimePickerProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const clockFaceRef = useRef<HTMLDivElement>(null);

  // Time state: hours (1-12), minutes (0-59), period ("AM" | "PM")
  const parseInitialTime = useCallback(() => {
    const raw = value || defaultValue;
    if (raw) {
      const match = raw.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        let m = parseInt(match[2], 10);
        let p = (match[3] ? match[3].toUpperCase() : "AM") as "AM" | "PM";
        if (h > 12) {
          h = h - 12;
          p = "PM";
        }
        if (h === 0) h = 12;
        return { hours: h, minutes: m, period: p, isSet: true };
      }
    }
    // In Figma Node 2249:1363 (State=Open), default reference time is 10:30 AM
    if (property1 === "Open") {
      return { hours: 10, minutes: 30, period: "AM" as const, isSet: true };
    }
    return { hours: 10, minutes: 30, period: "AM" as const, isSet: false };
  }, [value, defaultValue, property1]);

  const initial = useMemo(parseInitialTime, [parseInitialTime]);

  const [selectedHours, setSelectedHours] = useState<number>(initial.hours);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(initial.minutes);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(initial.period);
  const [isTimeSet, setIsTimeSet] = useState<boolean>(initial.isSet);

  // Popover open state
  const [isOpen, setIsOpen] = useState<boolean>(property1 === "Open");

  // Active edit unit: "hours" | "minutes"
  const [activeUnit, setActiveUnit] = useState<"hours" | "minutes">("hours");

  // Dragging state on clock dial
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync external property1 variant changes
  useEffect(() => {
    if (property1 === "Open") {
      setIsOpen(true);
      setIsTimeSet(true);
    } else if (property1 === "Default") {
      setIsOpen(false);
    }
  }, [property1]);

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined) {
      const parsed = parseInitialTime();
      setSelectedHours(parsed.hours);
      setSelectedMinutes(parsed.minutes);
      setSelectedPeriod(parsed.period);
      setIsTimeSet(parsed.isSet);
    }
  }, [value, parseInitialTime]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (property1 === "Open") return; // Keep open if forced by Admin variant
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [property1]);

  // Angle calculations for clock hands
  const hourAngle = useMemo(() => {
    return (selectedHours % 12) * 30;
  }, [selectedHours]);

  const minuteAngle = useMemo(() => {
    return selectedMinutes * 6;
  }, [selectedMinutes]);

  // Pointer angle solver from clock center
  const handlePointerAtPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!clockFaceRef.current) return;
      const rect = clockFaceRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;

      // Angle from top (12 o'clock), 0 to 360 deg
      let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (deg < 0) deg += 360;

      if (activeUnit === "hours") {
        // Snap to closest hour (1 to 12)
        let hour = Math.round(deg / 30);
        if (hour === 0) hour = 12;
        setSelectedHours(hour);
      } else {
        // Snap to closest minute (0 to 59)
        let min = Math.round(deg / 6);
        if (min === 60) min = 0;
        setSelectedMinutes(min);
      }
    },
    [activeUnit]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handlePointerAtPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handlePointerAtPoint(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    // If we just selected hours, smoothly switch to minutes for great UX
    if (activeUnit === "hours") {
      setTimeout(() => setActiveUnit("minutes"), 180);
    }
  };

  // Actions
  const handleApply = () => {
    setIsTimeSet(true);
    const formattedMinutes = String(selectedMinutes).padStart(2, "0");
    const formattedTime = `${selectedHours}:${formattedMinutes} ${selectedPeriod}`;
    onChange?.(formattedTime, selectedHours, selectedMinutes, selectedPeriod);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (!isTimeSet) {
      setSelectedHours(initial.hours);
      setSelectedMinutes(initial.minutes);
      setSelectedPeriod(initial.period);
    }
    setIsOpen(false);
  };

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  // Formatted trigger display string
  const displayValue = isTimeSet
    ? `${selectedHours}:${String(selectedMinutes).padStart(2, "0")} ${selectedPeriod}`
    : placeholder;

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex flex-col items-center select-none font-sans ${className}`}
      style={{
        fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
      }}
    >
      {/* ─── Input Trigger (Figma Nodes 2246:5133 & 2249:1364) ──────────────── */}
      <motion.button
        type="button"
        id={inputId}
        disabled={disabled}
        onClick={toggleOpen}
        whileTap={{ scale: disabled ? 1 : 0.985 }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative w-[151px] h-[60px] bg-white rounded-[12px] border transition-colors duration-200 cursor-pointer flex items-center justify-between outline-none select-none group shrink-0 ${
          isOpen ? "border-[#62646A]" : "border-[#D8DEE9] hover:border-[#B7BABD]"
        }`}
      >
        {/* Left Value / Placeholder */}
        <div className="pl-[16px] pr-[8px] flex items-center">
          <span
            className={`font-sans text-[14px] leading-[20px] tracking-[0px] select-none transition-colors ${
              isTimeSet ? "text-[#1F2123]" : "text-[#98A2B3]"
            }`}
          >
            {displayValue}
          </span>
        </div>

        {/* Right Icon Box matching Figma Node 1466:5573 & 2249:1366 */}
        <div
          className="w-[56px] h-full bg-[#E6E9EC] flex items-center justify-center shrink-0 rounded-r-[11px] transition-colors group-hover:bg-[#DFE3E7]"
          aria-hidden="true"
        >
          <ClockIcon className="w-[24px] h-[24px] text-[#1F2123]" />
        </div>
      </motion.button>

      {/* ─── Clock Popover (Figma Node 2249:1369) ───────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
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
            className="w-[320px] bg-white rounded-[12px] border border-[#D7DADD] p-[16px] flex flex-col shadow-[0px_10px_25px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] mt-[8px] z-50 select-none"
          >
            {/* Header: Title (Figma Node 2249:1370) */}
            <p className="font-sans font-medium text-[14px] leading-[20px] text-[#1F2123]">
              Select time
            </p>

            {/* Time Entry: Hours, Separator, Minutes, AM/PM (Figma Node 2249:1371) */}
            <div className="flex items-center justify-center gap-[6px] w-full mt-[12px] h-[64px]">
              {/* Hours Box (Figma Node 2249:1372) */}
              <button
                type="button"
                onClick={() => setActiveUnit("hours")}
                className={`w-[68px] h-[56px] rounded-[8px] bg-[#F5F6F7] border flex items-center justify-center transition-all cursor-pointer outline-none ${
                  activeUnit === "hours"
                    ? "border-[#62646A] shadow-xs"
                    : "border-[#D7DADD] hover:border-[#B7BABD]"
                }`}
                aria-label="Select hours"
              >
                <span className="font-sans font-medium text-[28px] leading-[36px] text-[#1F2123]">
                  {selectedHours}
                </span>
              </button>

              {/* Separator (Figma Node 2249:1374) */}
              <span className="font-sans font-medium text-[28px] leading-[36px] text-[#62646A] px-[2px]">
                :
              </span>

              {/* Minutes Box (Figma Node 2249:1375) */}
              <button
                type="button"
                onClick={() => setActiveUnit("minutes")}
                className={`w-[68px] h-[56px] rounded-[8px] bg-[#F5F6F7] border flex items-center justify-center transition-all cursor-pointer outline-none ${
                  activeUnit === "minutes"
                    ? "border-[#62646A] shadow-xs"
                    : "border-[#D7DADD] hover:border-[#B7BABD]"
                }`}
                aria-label="Select minutes"
              >
                <span className="font-sans font-medium text-[28px] leading-[36px] text-[#1F2123]">
                  {String(selectedMinutes).padStart(2, "0")}
                </span>
              </button>

              {/* AM / PM Toggle (Figma Node 2249:1377) */}
              <div className="w-[48px] h-[56px] rounded-[8px] bg-[#F5F6F7] border border-[#D7DADD] flex flex-col overflow-hidden shrink-0 ml-[4px]">
                {/* AM */}
                <button
                  type="button"
                  onClick={() => setSelectedPeriod("AM")}
                  className={`w-full h-[27px] flex items-center justify-center transition-colors cursor-pointer outline-none font-medium text-[12px] leading-[16px] ${
                    selectedPeriod === "AM"
                      ? "bg-[#1F2123] text-white"
                      : "text-[#62646A] hover:bg-[#EAECEF]"
                  }`}
                >
                  AM
                </button>

                {/* Divider */}
                <div className="w-full h-px bg-[#D7DADD]" />

                {/* PM */}
                <button
                  type="button"
                  onClick={() => setSelectedPeriod("PM")}
                  className={`w-full h-[27px] flex items-center justify-center transition-colors cursor-pointer outline-none font-medium text-[12px] leading-[16px] ${
                    selectedPeriod === "PM"
                      ? "bg-[#1F2123] text-white"
                      : "text-[#62646A] hover:bg-[#EAECEF]"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* ─── Analog Clock Face (Figma Nodes 2249:1382 & 2249:1383) ──────── */}
            <div className="mt-[12px] flex items-center justify-center w-full">
              <div
                ref={clockFaceRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-[224px] h-[224px] rounded-full bg-[#F5F6F7] cursor-pointer touch-none select-none flex items-center justify-center"
              >
                {/* Dial Numbers */}
                {activeUnit === "hours" ? (
                  /* ── Hours Dial (1 to 12) ── */
                  HOURS.map((h) => {
                    const coords = getHourCoordinates(h);
                    const isSelected = selectedHours === h;
                    return (
                      <div
                        key={`hour-${h}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHours(h);
                          setTimeout(() => setActiveUnit("minutes"), 180);
                        }}
                        style={{
                          left: coords.x,
                          top: coords.y,
                          transform: "translate(-50%, -50%)",
                        }}
                        className={`absolute w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors text-[14px] leading-[20px] font-sans ${
                          isSelected
                            ? "bg-[#1F2123] text-white font-medium shadow-sm z-20"
                            : "text-[#1F2123] font-normal hover:bg-[#E4E7EA] z-10"
                        }`}
                      >
                        {h}
                      </div>
                    );
                  })
                ) : (
                  /* ── Minutes Dial (00 to 55 in 5m steps) ── */
                  MINUTES.map((mStr, idx) => {
                    const mVal = idx * 5;
                    const coords = getMinuteCoordinates(mVal);
                    const isSelected = selectedMinutes === mVal;
                    return (
                      <div
                        key={`min-${mStr}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMinutes(mVal);
                        }}
                        style={{
                          left: coords.x,
                          top: coords.y,
                          transform: "translate(-50%, -50%)",
                        }}
                        className={`absolute w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors text-[13px] leading-[18px] font-sans ${
                          isSelected
                            ? "bg-[#1F2123] text-white font-medium shadow-sm z-20"
                            : "text-[#1F2123] font-normal hover:bg-[#E4E7EA] z-10"
                        }`}
                      >
                        {mStr}
                      </div>
                    );
                  })
                )}

                {/* Clock Center Pin Outer (Figma Node 2249:1387 - 10x10) */}
                <div className="absolute w-[10px] h-[10px] rounded-full bg-[#1F2123] z-30 pointer-events-none" />

                {/* Clock Center Pin Inner (Figma Node 2249:1388 - 3x3) */}
                <div className="absolute w-[3px] h-[3px] rounded-full bg-white z-40 pointer-events-none" />

                {/* ── Active Clock Hand: Show ONLY Hour Hand in Hours mode, ONLY Minute Hand in Minutes mode ── */}
                <AnimatePresence mode="wait" initial={false}>
                  {activeUnit === "hours" ? (
                    <motion.div
                      key="hour-hand"
                      initial={{ opacity: 0, scaleY: 0.8 }}
                      animate={{ opacity: 1, scaleY: 1, rotate: hourAngle }}
                      exit={{ opacity: 0, scaleY: 0.8 }}
                      transition={{
                        rotate: { type: "spring", stiffness: 450, damping: 32 },
                        opacity: { duration: 0.15 },
                        scaleY: { duration: 0.15 },
                      }}
                      className="absolute bottom-1/2 left-1/2 origin-bottom pointer-events-none z-10"
                      style={{
                        width: "3px",
                        height: "54px",
                        marginLeft: "-1.5px",
                      }}
                    >
                      <div className="w-full h-full rounded-t-full bg-[#1F2123]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="minute-hand"
                      initial={{ opacity: 0, scaleY: 0.8 }}
                      animate={{ opacity: 1, scaleY: 1, rotate: minuteAngle }}
                      exit={{ opacity: 0, scaleY: 0.8 }}
                      transition={{
                        rotate: { type: "spring", stiffness: 450, damping: 32 },
                        opacity: { duration: 0.15 },
                        scaleY: { duration: 0.15 },
                      }}
                      className="absolute bottom-1/2 left-1/2 origin-bottom pointer-events-none z-10"
                      style={{
                        width: "2.5px",
                        height: "73px",
                        marginLeft: "-1.25px",
                      }}
                    >
                      <div className="w-full h-full rounded-t-full bg-[#1F2123]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Divider (Figma Node 2249:1401) */}
            <div className="w-full h-px bg-[#D7DADD] my-[14px] shrink-0" />

            {/* Actions: Cancel & Apply (Figma Node 2249:1402) */}
            <div className="flex items-center gap-[8px] w-full h-[40px] shrink-0">
              {/* Cancel Button (Figma Node 2249:1403) */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCancel}
                className="flex-1 h-[40px] rounded-[8px] flex items-center justify-center font-medium text-[14px] leading-[20px] text-[#62646A] hover:bg-[#F5F6F7] hover:text-[#1F2123] transition-colors cursor-pointer outline-none"
              >
                Cancel
              </motion.button>

              {/* Apply Button (Figma Node 2249:1405) */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleApply}
                className="flex-1 h-[40px] rounded-[8px] bg-[#1F2123] text-white flex items-center justify-center font-medium text-[14px] leading-[20px] hover:bg-[#33373B] active:bg-[#000000] transition-all cursor-pointer outline-none shadow-sm"
              >
                Apply
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SmoothTimePicker;
export { smoothTimePickerControls } from "@/lib/registry/definitions/smoothTimePicker";
