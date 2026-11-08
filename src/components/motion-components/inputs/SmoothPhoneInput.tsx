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

// ─── Country Data Processing ────────────────────────────────────────────────

export interface CountryItem {
  region: string;
  country: string;
  dialCode: string;
}

// Built-in comprehensive worldwide country calling codes
export const ALL_COUNTRIES: CountryItem[] = [
  { region: "IN", country: "India", dialCode: "+91" },
  { region: "US", country: "United States", dialCode: "+1" },
  { region: "GB", country: "United Kingdom", dialCode: "+44" },
  { region: "AE", country: "United Arab Emirates", dialCode: "+971" },
  { region: "AU", country: "Australia", dialCode: "+61" },
  { region: "CA", country: "Canada", dialCode: "+1" },
  { region: "DE", country: "Germany", dialCode: "+49" },
  { region: "FR", country: "France", dialCode: "+33" },
  { region: "JP", country: "Japan", dialCode: "+81" },
  { region: "SG", country: "Singapore", dialCode: "+65" },
  { region: "AF", country: "Afghanistan", dialCode: "+93" },
  { region: "AL", country: "Albania", dialCode: "+355" },
  { region: "DZ", country: "Algeria", dialCode: "+213" },
  { region: "AD", country: "Andorra", dialCode: "+376" },
  { region: "AO", country: "Angola", dialCode: "+244" },
  { region: "AR", country: "Argentina", dialCode: "+54" },
  { region: "AM", country: "Armenia", dialCode: "+374" },
  { region: "AT", country: "Austria", dialCode: "+43" },
  { region: "AZ", country: "Azerbaijan", dialCode: "+994" },
  { region: "BH", country: "Bahrain", dialCode: "+973" },
  { region: "BD", country: "Bangladesh", dialCode: "+880" },
  { region: "BY", country: "Belarus", dialCode: "+375" },
  { region: "BE", country: "Belgium", dialCode: "+32" },
  { region: "BZ", country: "Belize", dialCode: "+501" },
  { region: "BJ", country: "Benin", dialCode: "+229" },
  { region: "BT", country: "Bhutan", dialCode: "+975" },
  { region: "BO", country: "Bolivia", dialCode: "+591" },
  { region: "BA", country: "Bosnia and Herzegovina", dialCode: "+387" },
  { region: "BW", country: "Botswana", dialCode: "+267" },
  { region: "BR", country: "Brazil", dialCode: "+55" },
  { region: "BN", country: "Brunei", dialCode: "+673" },
  { region: "BG", country: "Bulgaria", dialCode: "+359" },
  { region: "KH", country: "Cambodia", dialCode: "+855" },
  { region: "CL", country: "Chile", dialCode: "+56" },
  { region: "CN", country: "China", dialCode: "+86" },
  { region: "CO", country: "Colombia", dialCode: "+57" },
  { region: "CR", country: "Costa Rica", dialCode: "+506" },
  { region: "HR", country: "Croatia", dialCode: "+385" },
  { region: "CY", country: "Cyprus", dialCode: "+357" },
  { region: "CZ", country: "Czech Republic", dialCode: "+420" },
  { region: "DK", country: "Denmark", dialCode: "+45" },
  { region: "DO", country: "Dominican Republic", dialCode: "+1" },
  { region: "EC", country: "Ecuador", dialCode: "+593" },
  { region: "EG", country: "Egypt", dialCode: "+20" },
  { region: "EE", country: "Estonia", dialCode: "+372" },
  { region: "ET", country: "Ethiopia", dialCode: "+251" },
  { region: "FI", country: "Finland", dialCode: "+358" },
  { region: "GE", country: "Georgia", dialCode: "+995" },
  { region: "GH", country: "Ghana", dialCode: "+233" },
  { region: "GR", country: "Greece", dialCode: "+30" },
  { region: "HK", country: "Hong Kong", dialCode: "+852" },
  { region: "HU", country: "Hungary", dialCode: "+36" },
  { region: "IS", country: "Iceland", dialCode: "+354" },
  { region: "ID", country: "Indonesia", dialCode: "+62" },
  { region: "IE", country: "Ireland", dialCode: "+353" },
  { region: "IL", country: "Israel", dialCode: "+972" },
  { region: "IT", country: "Italy", dialCode: "+39" },
  { region: "JM", country: "Jamaica", dialCode: "+1" },
  { region: "JO", country: "Jordan", dialCode: "+962" },
  { region: "KZ", country: "Kazakhstan", dialCode: "+7" },
  { region: "KE", country: "Kenya", dialCode: "+254" },
  { region: "KR", country: "South Korea", dialCode: "+82" },
  { region: "KW", country: "Kuwait", dialCode: "+965" },
  { region: "LV", country: "Latvia", dialCode: "+371" },
  { region: "LB", country: "Lebanon", dialCode: "+961" },
  { region: "LT", country: "Lithuania", dialCode: "+370" },
  { region: "LU", country: "Luxembourg", dialCode: "+352" },
  { region: "MY", country: "Malaysia", dialCode: "+60" },
  { region: "MV", country: "Maldives", dialCode: "+960" },
  { region: "MT", country: "Malta", dialCode: "+356" },
  { region: "MU", country: "Mauritius", dialCode: "+230" },
  { region: "MX", country: "Mexico", dialCode: "+52" },
  { region: "MA", country: "Morocco", dialCode: "+212" },
  { region: "NP", country: "Nepal", dialCode: "+977" },
  { region: "NL", country: "Netherlands", dialCode: "+31" },
  { region: "NZ", country: "New Zealand", dialCode: "+64" },
  { region: "NG", country: "Nigeria", dialCode: "+234" },
  { region: "NO", country: "Norway", dialCode: "+47" },
  { region: "OM", country: "Oman", dialCode: "+968" },
  { region: "PK", country: "Pakistan", dialCode: "+92" },
  { region: "PA", country: "Panama", dialCode: "+507" },
  { region: "PE", country: "Peru", dialCode: "+51" },
  { region: "PH", country: "Philippines", dialCode: "+63" },
  { region: "PL", country: "Poland", dialCode: "+48" },
  { region: "PT", country: "Portugal", dialCode: "+351" },
  { region: "QA", country: "Qatar", dialCode: "+974" },
  { region: "RO", country: "Romania", dialCode: "+40" },
  { region: "RU", country: "Russia", dialCode: "+7" },
  { region: "SA", country: "Saudi Arabia", dialCode: "+966" },
  { region: "RS", country: "Serbia", dialCode: "+381" },
  { region: "SK", country: "Slovakia", dialCode: "+421" },
  { region: "SI", country: "Slovenia", dialCode: "+386" },
  { region: "ZA", country: "South Africa", dialCode: "+27" },
  { region: "ES", country: "Spain", dialCode: "+34" },
  { region: "LK", country: "Sri Lanka", dialCode: "+94" },
  { region: "SE", country: "Sweden", dialCode: "+46" },
  { region: "CH", country: "Switzerland", dialCode: "+41" },
  { region: "TW", country: "Taiwan", dialCode: "+886" },
  { region: "TH", country: "Thailand", dialCode: "+66" },
  { region: "TR", country: "Turkey", dialCode: "+90" },
  { region: "UA", country: "Ukraine", dialCode: "+380" },
  { region: "UY", country: "Uruguay", dialCode: "+598" },
  { region: "UZ", country: "Uzbekistan", dialCode: "+998" },
  { region: "VN", country: "Vietnam", dialCode: "+84" },
];

function buildCountryList(): CountryItem[] {
  return ALL_COUNTRIES;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface SmoothPhoneInputProps {
  className?: string;
  property1?: "Frame 9" | "Frame 10" | "Variant3";
  label?: string;
  defaultValue?: string;
  value?: string;
  defaultCountry?: string; // 2-letter ISO code e.g. "IN", "US"
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onCountryChange?: (country: CountryItem) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  required?: boolean;
}

export function SmoothPhoneInput({
  className = "",
  property1 = "Frame 9",
  label = "Phone number",
  defaultValue,
  value,
  defaultCountry = "IN",
  onChange,
  onValueChange,
  onCountryChange,
  disabled = false,
  name = "phone",
  id,
  autoComplete = "tel-national",
  required = false,
}: SmoothPhoneInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isSimulatingRef = useRef(false);

  const [triggerWidth, setTriggerWidth] = useState(76);
  const [inputWidth, setInputWidth] = useState(304);

  // Built-in country calling code data
  const countryList = useMemo(() => buildCountryList(), []);

  // Selected Country state (defaults to India / +91 matching Figma)
  const initialCountry = useMemo(() => {
    const found = countryList.find(
      (c) => c.region.toUpperCase() === defaultCountry.toUpperCase()
    );
    return found || countryList[0] || ALL_COUNTRIES[0];
  }, [countryList, defaultCountry]);

  const [selectedCountry, setSelectedCountry] =
    useState<CountryItem>(initialCountry);
  const [isDropdownOpen, setIsDropdownOpen] = useState(
    property1 === "Variant3"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize value based on Figma property1 variant or defaultValue
  const initialValue =
    value !== undefined
      ? value
      : defaultValue !== undefined
      ? defaultValue
      : property1 === "Frame 10" || property1 === "Variant3"
      ? "76009 83428"
      : "";

  const [internalValue, setInternalValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(
    property1 === "Frame 10" && !value
  );
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [caretIndex, setCaretIndex] = useState(initialValue.length);
  const [caretX, setCaretX] = useState(16);
  const [hasSelection, setHasSelection] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ResizeObserver for dynamic squircle paths on trigger and input
  useIsomorphicLayoutEffect(() => {
    if (!triggerRef.current || !inputContainerRef.current) return;
    const updateSizes = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth || 76);
      }
      if (inputContainerRef.current) {
        setInputWidth(inputContainerRef.current.offsetWidth || 304);
      }
    };
    updateSizes();
    const ro = new ResizeObserver(updateSizes);
    ro.observe(triggerRef.current);
    ro.observe(inputContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute iOS 100% Corner Smoothing Squircle Paths
  const triggerPaths = useMemo(() => {
    return {
      strokePath: getSquirclePath(triggerWidth, 60, 12, 1.0, 0.5),
      clipPath: getSquirclePath(triggerWidth, 60, 12, 1.0, 0),
    };
  }, [triggerWidth]);

  const inputPaths = useMemo(() => {
    return {
      strokePath: getSquirclePath(inputWidth, 60, 12, 1.0, 0.5),
      clipPath: getSquirclePath(inputWidth, 60, 12, 1.0, 0),
    };
  }, [inputWidth]);

  // Sync when property1 or controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
      setCaretIndex(value.length);
    } else if (
      (property1 === "Frame 10" || property1 === "Variant3") &&
      internalValue === ""
    ) {
      setInternalValue("76009 83428");
      setCaretIndex("76009 83428".length);
    } else if (
      property1 === "Frame 9" &&
      internalValue === "76009 83428"
    ) {
      setInternalValue("");
      setCaretIndex(0);
    }

    if (property1 === "Variant3") {
      setIsDropdownOpen(true);
    } else if (property1 === "Frame 9" || property1 === "Frame 10") {
      setIsDropdownOpen(false);
    }
  }, [property1, value]);

  const currentValue = value !== undefined ? value : internalValue;
  const isFloating = isFocused || currentValue.length > 0;

  // Split string using Array.from to correctly support fluid character animation
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
      setCaretX(16 + charEl.offsetLeft + charEl.offsetWidth - scrollLeft);
    }
  };

  useIsomorphicLayoutEffect(() => {
    syncCaretX();
    const rafId = requestAnimationFrame(syncCaretX);
    return () => cancelAnimationFrame(rafId);
  }, [currentValue, caretIndex]);

  // Handle number input change with phone constraint (digits and spaces only)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow only digits and spaces
    const cleanVal = rawVal.replace(/[^\d\s]/g, "");

    if (value === undefined) {
      setInternalValue(cleanVal);
    }
    onChange?.(e);
    onValueChange?.(cleanVal);

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
  const handleAutoType = (demoNumber = "76009 83428") => {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;
    setInternalValue("");
    setCaretIndex(0);
    setIsFocused(true);
    setIsTyping(true);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < demoNumber.length) {
        const nextChunk = demoNumber.slice(0, idx + 1);
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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsDropdownOpen(false);
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isDropdownOpen]);

  // Filter country list by name, region, or dialCode
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countryList;
    const q = searchQuery.trim().toLowerCase();
    const cleanQ = q.replace(/^\+/, "");
    return countryList.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q) ||
        c.dialCode.replace(/^\+/, "").startsWith(cleanQ)
    );
  }, [searchQuery, countryList]);

  const handleSelectCountry = (country: CountryItem) => {
    setSelectedCountry(country);
    onCountryChange?.(country);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  // Border colors matching Figma specifications
  const triggerBorderColor = useMemo(() => {
    if (isDropdownOpen || isFocused) return "#626467"; // Active / focused
    if (isTriggerHovered) return "#B0B7C3";
    return "#D7DADC"; // Figma platinum 07
  }, [isDropdownOpen, isFocused, isTriggerHovered]);

  const inputBorderColor = useMemo(() => {
    if (isFocused) return "#626467"; // Active / focused
    if (isInputHovered) return "#B0B7C3";
    return "#D8DEE9"; // Figma idle input border
  }, [isFocused, isInputHovered]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full p-4 select-none ${className}`}
    >
      <div className="relative w-full max-w-[390px] flex flex-col gap-[8px]">
        {/* ── Top Row: Calling Code Selector + Number Input Container ── */}
        <div className="flex items-center gap-[5px] w-full h-[60px]">
          {/* Left: Country Calling Code Selector Button */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            onMouseEnter={() => setIsTriggerHovered(true)}
            onMouseLeave={() => setIsTriggerHovered(false)}
            disabled={disabled}
            className="relative h-[60px] pl-[16px] pr-[8px] py-[14px] flex items-center gap-[8px] bg-white cursor-pointer select-none shrink-0 transition-opacity hover:opacity-95"
            style={{
              clipPath: `path('${triggerPaths.clipPath}')`,
            }}
            title="Select country code"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            {/* iOS 100% Corner Smoothing Squircle Background & 1px Stroke */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              viewBox={`0 0 ${triggerWidth} 60`}
              fill="none"
            >
              <path
                d={triggerPaths.strokePath}
                fill="#FFFFFF"
                stroke={triggerBorderColor}
                strokeWidth="1"
                className="transition-colors duration-200"
              />
            </svg>

            {/* Dial Code Text */}
            <span className="relative z-10 font-sans font-normal text-[14px] leading-normal text-[#1F2123] whitespace-nowrap">
              {selectedCountry.dialCode}
            </span>

            {/* Caret Down Icon with 180deg Rotation on Open */}
            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 size-[24px] flex items-center justify-center text-[#050505]"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 10L12 14L8 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </button>

          {/* Right: Phone Number Input Container */}
          <div
            ref={inputContainerRef}
            onMouseEnter={() => setIsInputHovered(true)}
            onMouseLeave={() => setIsInputHovered(false)}
            onClick={() => inputRef.current?.focus()}
            className="relative flex-1 h-[60px] cursor-text select-none min-w-0"
            style={{
              clipPath: `path('${inputPaths.clipPath}')`,
            }}
          >
            {/* iOS 100% Corner Smoothing Squircle Background & 1px Stroke */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              viewBox={`0 0 ${inputWidth} 60`}
              fill="none"
            >
              <path
                d={inputPaths.strokePath}
                fill="#FFFFFF"
                stroke={inputBorderColor}
                strokeWidth="1"
                className="transition-colors duration-200"
              />
            </svg>

            {/* Floating Animated Label matching Figma Node 2204:1141 */}
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

            {/* Smooth Typing Display Layer */}
            <div
              ref={displayRef}
              aria-hidden="true"
              className="absolute left-[16px] top-[29.5px] right-[36px] h-[19px] pointer-events-none font-sans font-medium text-[16px] leading-[1.2] text-[#1F2123] z-0 overflow-hidden whitespace-nowrap flex items-center"
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
                    style={{
                      display: "inline-block",
                      whiteSpace: "pre",
                      flexShrink: 0,
                      height: "19px",
                      lineHeight: "19px",
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
              className="absolute top-[29.5px] left-0 w-[1.5px] h-[19px] bg-[#1F2123] rounded-full pointer-events-none z-20"
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

            {/* Native HTML Phone Number Input */}
            <input
              ref={inputRef}
              id={inputId}
              name={name}
              type="tel"
              inputMode="numeric"
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
              className="absolute left-[16px] top-[29.5px] right-[36px] h-[19px] p-0 bg-transparent outline-none font-sans font-medium text-[16px] leading-[1.2] text-transparent caret-transparent z-10 selection:bg-[#1f2123]/15 selection:text-transparent"
              style={{
                caretColor: "transparent",
                color: "transparent",
                fontFeatureSettings: '"ordn" 1, "salt" 1, "lnum" 1, "pnum" 1',
                lineHeight: "19px",
              }}
            />

            {/* Right Action: Sparkle auto-type demo or Clear button */}
            <div className="absolute right-[12px] top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
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
                      handleAutoType("76009 83428");
                    }}
                    className="size-[24px] rounded-full hover:bg-[#F1F3F7] flex items-center justify-center text-[#B0B7C3] hover:text-[#626467] transition-colors cursor-pointer group"
                    title="Try smooth number demo"
                  >
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
                      className="size-[20px] rounded-full bg-[#F1F3F7] hover:bg-[#E4E7EC] flex items-center justify-center text-[#98A2B3] hover:text-[#626467] transition-colors cursor-pointer"
                      title="Clear number"
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
        </div>

        {/* ── Dropdown: Search Country Code Card (Figma Variant3) ── */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full bg-white border border-[#626467] rounded-[12px] shadow-lg overflow-hidden z-30 flex flex-col"
            >
              {/* Search Header matching Figma Node 2233:1154 */}
              <div className="flex items-center gap-[8px] px-[12px] py-[14px] border-b border-[#B7BABD] bg-white shrink-0">
                <div className="size-[20px] shrink-0 text-[#62646A] flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.6667 9C14.6667 12.1296 12.1296 14.6667 9 14.6667C5.87039 14.6667 3.33333 12.1296 3.33333 9C3.33333 5.87039 5.87039 3.33333 9 3.33333C12.1296 3.33333 14.6667 5.87039 14.6667 9Z"
                      stroke="currentColor"
                      strokeWidth="1.41667"
                    />
                    <path
                      d="M13.3333 13.3333L17.0833 17.0833"
                      stroke="currentColor"
                      strokeWidth="1.41667"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or code"
                  className="flex-1 bg-transparent outline-none font-sans font-normal text-[14px] leading-[20px] text-[#1F2123] placeholder-[#62646A]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="size-[18px] rounded-full bg-[#E4E7EC] hover:bg-[#D0D5DD] flex items-center justify-center text-[#62646A] transition-colors"
                  >
                    <svg
                      width="8"
                      height="8"
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
                  </button>
                )}
              </div>

              {/* Country Options List matching Figma Node 2236:1195 */}
              <div
                role="listbox"
                className="max-h-[220px] overflow-y-auto px-[8px] py-[6px] flex flex-col gap-[2px] divide-y-0"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#D0D5DD transparent",
                }}
              >
                {filteredCountries.length === 0 ? (
                  <div className="py-6 text-center text-[13px] text-[#62646A] font-sans">
                    No country found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  filteredCountries.map((c) => {
                    const isSelected = selectedCountry.region === c.region;
                    return (
                      <button
                        key={`${c.region}-${c.dialCode}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectCountry(c)}
                        className={`w-full h-[44px] px-[12px] rounded-[8px] flex items-center gap-[12px] text-left transition-colors cursor-pointer shrink-0 ${
                          isSelected
                            ? "bg-[#F5F6F7]"
                            : "bg-white hover:bg-[#F5F6F7]"
                        }`}
                      >
                        {/* Region Badge (e.g. IN, US, GB) */}
                        <div className="w-[28px] h-[22px] rounded-[6px] bg-white border border-[#D7DADD] flex items-center justify-center shrink-0">
                          <span className="font-sans font-semibold text-[10px] leading-[14px] text-[#62646A] tracking-wider uppercase">
                            {c.region}
                          </span>
                        </div>

                        {/* Country Name */}
                        <span className="flex-1 font-sans font-normal text-[14px] leading-[20px] text-[#1F2123] truncate">
                          {c.country}
                        </span>

                        {/* Calling Dial Code */}
                        <span className="font-sans font-normal text-[14px] leading-[20px] text-[#62646A] text-right shrink-0">
                          {c.dialCode}
                        </span>

                        {/* Selection Check Indicator matching Figma Check asset */}
                        <div className="size-[20px] shrink-0 flex items-center justify-center text-[#1F2123]">
                          {isSelected && (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4.16667 10L7.5 13.3333L15.8333 5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const SmoothNumberInput = SmoothPhoneInput;
export default SmoothPhoneInput;
