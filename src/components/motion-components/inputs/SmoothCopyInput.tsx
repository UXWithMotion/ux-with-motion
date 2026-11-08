"use client";

import React, { useState, useRef, useEffect, useId, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Inline SVG Icons (exact Figma geometry & self-contained) ─────────────────

function InstagramIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
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
      <path
        d="M7.0301 0.0841458C5.7533 0.144386 4.88138 0.348146 4.11914 0.647666C3.33026 0.955106 2.66162 1.36767 1.99634 2.03535C1.33106 2.70303 0.921379 3.37215 0.616099 4.16223C0.320659 4.92615 0.120499 5.79879 0.0640995 7.07631C0.00769946 8.35383 -0.00478054 8.76447 0.00145946 12.0232C0.00769946 15.2819 0.0220995 15.6904 0.0840195 16.9705C0.144979 18.2471 0.348019 19.1188 0.647539 19.8813C0.955459 20.6701 1.36754 21.3385 2.03546 22.0041C2.70338 22.6696 3.37202 23.0783 4.16402 23.3841C4.92722 23.679 5.8001 23.8801 7.07738 23.9361C8.35466 23.992 8.76578 24.0049 12.0235 23.9987C15.2813 23.9925 15.6915 23.9781 16.9714 23.9173C18.2513 23.8566 19.1184 23.6521 19.8811 23.3541C20.67 23.0454 21.3389 22.6341 22.0039 21.9659C22.669 21.2977 23.0784 20.6281 23.3835 19.8376C23.6791 19.0744 23.88 18.2015 23.9355 16.9252C23.9914 15.6443 24.0046 15.2353 23.9983 11.9771C23.9921 8.71887 23.9775 8.31039 23.9167 7.03071C23.856 5.75103 23.6527 4.88199 23.3535 4.11903C23.0451 3.33015 22.6335 2.66223 21.9658 1.99623C21.2981 1.33023 20.628 0.921026 19.8377 0.616706C19.074 0.321266 18.2016 0.119906 16.9243 0.0647058C15.6471 0.00950584 15.2359 -0.00465416 11.977 0.00158584C8.71802 0.00782584 8.31002 0.0217458 7.0301 0.0841458ZM7.17026 21.7773C6.00026 21.7264 5.36498 21.532 4.94162 21.3693C4.38098 21.1533 3.98162 20.8921 3.5597 20.4743C3.13778 20.0565 2.87858 19.6557 2.6597 19.0962C2.4953 18.6729 2.2973 18.0383 2.24258 16.8683C2.18306 15.6037 2.17058 15.2241 2.16362 12.0203C2.15666 8.81655 2.1689 8.43735 2.22434 7.17231C2.27426 6.00327 2.46986 5.36727 2.63234 4.94415C2.84834 4.38279 3.1085 3.98415 3.5273 3.56247C3.9461 3.14079 4.3457 2.88111 4.90562 2.66223C5.3285 2.49711 5.96306 2.30079 7.13258 2.24511C8.3981 2.18511 8.7773 2.17311 11.9806 2.16615C15.1839 2.15919 15.564 2.17119 16.83 2.22687C17.9991 2.27775 18.6353 2.47143 19.0579 2.63487C19.6188 2.85087 20.0179 3.11031 20.4396 3.52983C20.8613 3.94935 21.1212 4.34751 21.3401 4.90863C21.5055 5.33031 21.7018 5.96463 21.757 7.13487C21.8172 8.40039 21.8309 8.77983 21.8367 11.9829C21.8424 15.1859 21.8311 15.5663 21.7757 16.8309C21.7246 18.0009 21.5307 18.6364 21.3677 19.0602C21.1517 19.6206 20.8913 20.0202 20.4723 20.4417C20.0532 20.8631 19.6541 21.1228 19.0939 21.3417C18.6715 21.5065 18.0363 21.7033 16.8677 21.759C15.6022 21.8185 15.223 21.831 12.0185 21.838C8.81402 21.8449 8.43602 21.832 7.1705 21.7773M16.9529 5.58663C16.9534 5.87145 17.0383 6.14974 17.1969 6.38629C17.3556 6.62284 17.5808 6.80704 17.8442 6.91557C18.1075 7.02411 18.3971 7.05212 18.6764 6.99605C18.9556 6.93998 19.212 6.80236 19.413 6.60059C19.614 6.39882 19.7507 6.14196 19.8058 5.8625C19.8608 5.58305 19.8317 5.29355 19.7222 5.03061C19.6127 4.76768 19.4277 4.54312 19.1906 4.38534C18.9534 4.22757 18.6748 4.14366 18.39 4.14423C18.0082 4.14499 17.6423 4.29737 17.3728 4.56786C17.1033 4.83835 16.9523 5.2048 16.9529 5.58663ZM5.8385 12.0121C5.84522 15.4153 8.60906 18.1679 12.0115 18.1614C15.414 18.1549 18.1685 15.3913 18.162 11.9881C18.1555 8.58495 15.391 5.83167 11.988 5.83839C8.58506 5.84511 5.83202 8.60943 5.8385 12.0121ZM7.99994 12.0078C7.99837 11.2167 8.23144 10.4429 8.66968 9.78417C9.10791 9.1255 9.73162 8.61156 10.4619 8.30736C11.1923 8.00316 11.9964 7.92235 12.7726 8.07516C13.5489 8.22796 14.2624 8.60752 14.8229 9.16584C15.3834 9.72415 15.7658 10.4361 15.9217 11.2118C16.0776 11.9874 15.9999 12.7918 15.6986 13.5234C15.3973 14.2549 14.8859 14.8806 14.2289 15.3214C13.572 15.7623 12.7991 15.9984 12.0079 16C11.4826 16.0011 10.9622 15.8987 10.4765 15.6987C9.99076 15.4986 9.54918 15.2049 9.17699 14.8341C8.8048 14.4634 8.50929 14.023 8.30733 13.5381C8.10537 13.0531 8.00091 12.5331 7.99994 12.0078Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CopyIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect width="13" height="13" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M5 12.5L9.5 17L19 7.5" />
    </svg>
  );
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface SmoothCopyInputProps {
  className?: string;
  property1?: "copy" | "copied";
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onCopy?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
}

export function SmoothCopyInput({
  className = "",
  property1,
  value,
  defaultValue = "https://www.instagram.com/gfxwithsahil/",
  onChange,
  onCopy,
  disabled = false,
  readOnly = false,
  name = "copy-input",
  id,
}: SmoothCopyInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [textValue, setTextValue] = useState<string>(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    return "https://www.instagram.com/gfxwithsahil/";
  });

  const [copied, setCopied] = useState<boolean>(property1 === "copied");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external controlled value
  useEffect(() => {
    if (value !== undefined) {
      setTextValue(value);
    }
  }, [value]);

  // Sync property1 variant from Admin controls
  useEffect(() => {
    if (property1 === "copied") {
      setCopied(true);
    } else if (property1 === "copy") {
      setCopied(false);
    }
  }, [property1]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (disabled) return;

    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textValue);
      }
    } catch (err) {
      console.warn("Clipboard write failed, using fallback:", err);
    }

    setCopied(true);
    onCopy?.(textValue);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [disabled, textValue, onCopy]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
    onChange?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCopy();
    }
  };

  return (
    <div
      className={`relative w-full max-w-[457px] h-[60px] bg-white rounded-[12px] border border-[#D8DEE9] hover:border-[#B7BABD] focus-within:border-[#626467] flex items-center justify-between transition-colors duration-200 overflow-hidden ${className}`}
      style={{
        fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
      }}
    >
      {/* ─── Left Side: Icon & URL Input (Figma Node 1469:6596) ─────────── */}
      <div className="flex items-center gap-[8px] pl-[16px] pr-[12px] flex-1 min-w-0 h-full">
        <span
          className="w-[24px] h-[24px] flex items-center justify-center text-[#454545] shrink-0 select-none"
          title="Social Profile"
        >
          <InstagramIcon className="w-[24px] h-[24px]" />
        </span>

        <input
          id={inputId}
          name={name}
          type="text"
          value={textValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          disabled={disabled}
          placeholder="https://..."
          className="w-full bg-transparent text-[14px] leading-[18px] text-[#1F2123] font-normal font-sans outline-none placeholder:text-[#98A2B3] truncate select-all"
        />
      </div>

      {/* ─── Right Side: Morphing Copy Button (Figma Node 1466:5537) ────── */}
      <motion.button
        type="button"
        layout
        animate={{ width: copied ? 117 : 104 }}
        transition={{
          type: "spring",
          stiffness: 480,
          damping: 32,
          mass: 0.8,
        }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        onClick={handleCopy}
        disabled={disabled}
        aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
        className="h-[60px] bg-[#EEF1F4] hover:bg-[#E5E9EE] active:bg-[#DCE1E7] border-l border-[#D7DADC] rounded-r-[11px] flex items-center justify-center text-[#626467] font-semibold text-[14px] leading-[18px] cursor-pointer transition-colors duration-150 select-none shrink-0 outline-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.div
              key="copied"
              initial={{ opacity: 0, scale: 0.88, y: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -1 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-[8px] whitespace-nowrap"
            >
              <span>Copied</span>
              <CheckIcon className="w-[20px] h-[20px] text-[#626467]" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ opacity: 0, scale: 0.88, y: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -1 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-[8px] whitespace-nowrap"
            >
              <span>Copy</span>
              <CopyIcon className="w-[18px] h-[18px] text-[#626467]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

export default SmoothCopyInput;
