"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Exact Vector Icons from Figma (Node 2056:1407) ──────────────────────────

function SearchIcon({ className = "size-[16px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 14L11.1068 11.1068M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"
        stroke="#8C847E"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AiSparkleIcon({
  fill = "currentColor",
  className = "size-[18px]",
}: {
  fill?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.4164 5.57944C10.5796 5.58166 10.7999 5.60975 10.9381 5.72734C11.3859 6.10845 11.8809 6.60577 12.2655 7.05145C12.3415 7.15086 12.3771 7.25492 12.3992 7.37401C12.4906 7.86868 12.1896 8.12011 11.8794 8.43109L11.217 9.09417L8.86525 11.4477L5.01184 15.3038L3.80442 16.5141C3.57908 16.74 3.35002 16.9771 3.11407 17.1914C2.96691 17.3251 2.80176 17.361 2.6138 17.3923C2.42982 17.3959 2.18217 17.333 2.04228 17.2082C1.62513 16.8357 1.23461 16.4234 0.844552 16.0222C0.70895 15.8827 0.657081 15.7475 0.628114 15.5579C0.545736 15.0189 0.983677 14.6923 1.32251 14.3535L2.21926 13.457L5.14559 10.5292L8.35288 7.31976L9.3562 6.31463C9.68711 5.9833 9.92521 5.63102 10.4164 5.57944ZM2.5907 16.2321C3.17123 15.6204 3.82301 14.9913 4.42218 14.3917L7.8036 11.0076C8.26471 10.5461 8.76607 10.0635 9.21345 9.5942C9.10612 9.48331 8.47076 8.80916 8.38067 8.79814L4.01293 13.1669C3.27698 13.9035 2.49567 14.72 1.75006 15.4326C1.87648 15.5606 2.47249 16.1896 2.5907 16.2321ZM9.153 8.0411C9.32249 8.18837 9.85296 8.75876 9.98103 8.8257C10.2677 8.55039 10.5447 8.2575 10.8284 7.97886C10.9632 7.84647 11.1364 7.65837 11.2798 7.54406C11.1628 7.41992 10.5517 6.77681 10.4414 6.72947C10.1638 7.02419 9.8618 7.30646 9.57834 7.59602C9.45267 7.72439 9.25996 7.90281 9.153 8.0411Z"
        fill={fill}
      />
      <path
        d="M13.5719 9.1083C14.163 9.07538 14.1381 9.61367 14.3349 10.01C14.477 10.2959 14.6798 10.5474 14.929 10.747C15.3376 11.0735 15.8162 11.2371 16.3416 11.2357C16.6329 11.2349 16.9779 11.1051 17.2423 11.265C17.3489 11.3296 17.4272 11.445 17.449 11.5651C17.5675 12.2169 16.935 12.2084 16.5772 12.3862C16.2933 12.5285 16.0418 12.7278 15.8385 12.9717C15.501 13.3863 15.3233 13.9081 15.3376 14.4425C15.3508 14.8744 15.5757 15.3945 14.9354 15.5338C14.3424 15.5591 14.3757 15.012 14.1857 14.63C14.0407 14.3408 13.8344 14.0866 13.5814 13.885C13.1213 13.5168 12.6247 13.38 12.0425 13.4233C11.7871 13.4424 11.5085 13.5119 11.2841 13.3786C11.1808 13.3172 11.0872 13.2159 11.065 13.0939C10.937 12.3893 11.6032 12.4413 12.0304 12.1967C12.2938 12.0458 12.4994 11.865 12.6824 11.6464C13.0186 11.243 13.1934 10.7293 13.1731 10.2046C13.1581 9.75487 12.9458 9.2556 13.5719 9.1083ZM13.3295 12.5432C13.6985 12.6761 14.0084 12.864 14.311 13.1125C14.3459 13.1411 14.436 13.2204 14.4704 13.2397C14.6318 12.8762 14.8792 12.3807 15.1819 12.1156C14.9737 12.01 14.7713 11.9165 14.5736 11.7911C14.3826 11.6701 14.2195 11.5316 14.0369 11.4017C13.852 11.8855 13.6486 12.1533 13.3295 12.5432Z"
        fill={fill}
      />
      <path
        d="M13.5747 0.531623C14.159 0.496711 14.1442 1.0467 14.3256 1.4161C14.4704 1.71325 14.6802 1.97399 14.9395 2.17897C15.3305 2.49056 15.8159 2.65996 16.3159 2.65934C16.6817 2.65558 17.3297 2.436 17.4486 2.98733C17.5846 3.6182 16.9586 3.62364 16.569 3.8146C16.288 3.95548 16.0392 4.15317 15.8385 4.39515C15.5016 4.8091 15.3238 5.32988 15.3372 5.86347C15.3497 6.29445 15.5765 6.81752 14.9373 6.95686C14.3404 6.97903 14.3762 6.44281 14.1927 6.06704C14.047 5.77185 13.8377 5.51257 13.5799 5.3078C12.5613 4.49343 11.7467 5.07119 11.2802 4.80038C11.1729 4.7381 11.0969 4.64391 11.0661 4.52294C10.9001 3.87011 11.628 3.8324 12.0306 3.61969C12.2828 3.48643 12.5065 3.2815 12.6879 3.06325C13.0217 2.65948 13.1945 2.14659 13.173 1.62317C13.1563 1.17218 12.948 0.677038 13.5747 0.531623ZM13.3287 3.96756C13.6574 4.08365 13.8998 4.2252 14.18 4.4337C14.2319 4.47237 14.4344 4.643 14.4717 4.66575C14.6271 4.29975 14.8806 3.80479 15.1807 3.54004C14.9529 3.41392 14.7581 3.33742 14.5317 3.19335C14.4047 3.11258 14.1352 2.87974 14.0416 2.82948C13.8145 3.34224 13.681 3.54082 13.3287 3.96756Z"
        fill={fill}
      />
      <path
        d="M4.88841 0.532364C5.47472 0.467623 5.48568 1.13826 5.68805 1.50588C6.08609 2.22889 6.86609 2.68693 7.69419 2.65776C8.06859 2.64458 8.5963 2.45275 8.756 2.95629C8.79464 3.07815 8.79805 3.21661 8.74373 3.33545C8.57748 3.67097 8.14275 3.67714 7.83833 3.83854C7.07887 4.24117 6.62576 5.03043 6.65759 5.88892C6.66717 6.14757 6.78145 6.45295 6.64624 6.69602C6.56411 6.84366 6.42674 6.91067 6.26948 6.95467C5.79081 6.98497 5.71938 6.66966 5.60878 6.31535C5.3595 5.51679 4.54667 4.87667 3.70738 4.84232C3.43322 4.83109 3.1676 4.86874 2.89494 4.88461C2.68671 4.89391 2.44007 4.74188 2.38934 4.52388C2.23479 3.85972 2.88271 3.85554 3.28089 3.65488C3.54758 3.51783 3.78462 3.3295 3.97842 3.1007C4.32327 2.69566 4.50589 2.17727 4.49105 1.64551C4.47655 1.18745 4.26048 0.681899 4.88841 0.532364ZM4.64518 3.96835C4.97141 4.0833 5.19922 4.21403 5.47873 4.42082C5.53983 4.46601 5.75042 4.6369 5.79874 4.66508C5.96482 4.2171 6.17356 3.87807 6.50408 3.53293C6.21696 3.40012 5.99683 3.29954 5.73356 3.11453C5.6604 3.06312 5.41106 2.84139 5.3675 2.81864C5.11845 3.35101 5.02673 3.51046 4.64518 3.96835Z"
        fill={fill}
      />
    </svg>
  );
}

function PlusIcon({ className = "size-[18px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.02269 3.75L9.00896 14.25"
        stroke="#626467"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 9H14.25"
        stroke="#626467"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon({ className = "size-[16px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.33333 6.66667V8C3.33333 9.23768 3.825 10.4247 4.70017 11.2998C5.57534 12.175 6.76232 12.6667 8 12.6667C9.23768 12.6667 10.4247 12.175 11.2998 11.2998C12.175 10.4247 12.6667 9.23768 12.6667 8V6.66667M8 12.6667V14.6667M8 1.33333C7.46957 1.33333 6.96086 1.54405 6.58579 1.91912C6.21071 2.29419 6 2.8029 6 3.33333V8C6 8.53043 6.21071 9.03914 6.58579 9.41421C6.96086 9.78929 7.46957 10 8 10C8.53043 10 9.03914 9.78929 9.41421 9.41421C9.78929 9.03914 10 8.53043 10 8V3.33333C10 2.8029 9.78929 2.29419 9.41421 1.91912C9.03914 1.54405 8.53043 1.33333 8 1.33333Z"
        stroke="#838B8E"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpShortIcon({ className = "size-[20px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 15C10.3452 15 10.625 14.7202 10.625 14.375V7.13388L13.3081 9.81694C13.5521 10.061 13.9479 10.061 14.1919 9.81694C14.436 9.57286 14.436 9.17714 14.1919 8.93306L10.4419 5.18306C10.1979 4.93898 9.80214 4.93898 9.55806 5.18306L5.80806 8.93306C5.56398 9.17714 5.56398 9.57286 5.80806 9.81694C6.05214 10.061 6.44787 10.061 6.69194 9.81694L9.375 7.13388V14.375C9.375 14.7202 9.65482 15 10 15Z"
        fill="#FDFCFB"
      />
    </svg>
  );
}

function ImageIcon({
  className = "size-[16px]",
  stroke = "#626467",
}: {
  className?: string;
  stroke?: string;
}) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 9.99996L11.9427 7.94263C11.6926 7.69267 11.3536 7.55225 11 7.55225C10.6464 7.55225 10.3074 7.69267 10.0573 7.94263L4 14M3.33333 2H12.6667C13.403 2 14 2.59695 14 3.33333V12.6667C14 13.403 13.403 14 12.6667 14H3.33333C2.59695 14 2 13.403 2 12.6667V3.33333C2 2.59695 2.59695 2 3.33333 2ZM7.33333 6C7.33333 6.73638 6.73638 7.33333 6 7.33333C5.26362 7.33333 4.66667 6.73638 4.66667 6C4.66667 5.26362 5.26362 4.66667 6 4.66667C6.73638 4.66667 7.33333 5.26362 7.33333 6Z"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon({
  className = "size-[16px]",
  stroke = "#61686B",
}: {
  className?: string;
  stroke?: string;
}) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667M14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333M14.6667 8H1.33333M8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8M8 14.6667C6.28816 12.8692 5.33333 10.4822 5.33333 8C5.33333 5.51783 6.28816 3.13077 8 1.33333M8 14.6667C9.71184 12.8692 10.6667 10.4822 10.6667 8C10.6667 5.51783 9.71184 3.13077 8 1.33333M1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PencilRulerIcon({
  className = "size-[16px]",
  stroke = "#61686B",
}: {
  className?: string;
  stroke?: string;
}) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.66653 4.6667L5.79987 1.80003C5.49879 1.5004 5.0913 1.33219 4.66653 1.33219C4.24177 1.33219 3.83428 1.5004 3.5332 1.80003L1.79987 3.53336C1.50024 3.83445 1.33203 4.24193 1.33203 4.6667C1.33203 5.09147 1.50024 5.49895 1.79987 5.80003L4.66653 8.6667M5.33317 4L6.6665 2.66667M11.9998 10.6667L13.3332 9.33333M11.3332 7.33333L14.1998 10.2C14.8265 10.8267 14.8265 11.84 14.1998 12.4667L12.4665 14.2C11.8398 14.8267 10.8265 14.8267 10.1998 14.2L7.33317 11.3333M9.99984 3.33333L12.6665 6M14.1158 4.54126C14.4683 4.18888 14.6663 3.71091 14.6664 3.2125C14.6664 2.71409 14.4685 2.23607 14.1161 1.8836C13.7637 1.53112 13.2858 1.33307 12.7874 1.33301C12.289 1.33295 11.8109 1.53088 11.4585 1.88326L2.56113 10.7826C2.40634 10.9369 2.29187 11.1269 2.22779 11.3359L1.34713 14.2373C1.3299 14.2949 1.3286 14.3562 1.34336 14.4145C1.35813 14.4728 1.38841 14.5261 1.43099 14.5686C1.47358 14.6111 1.52687 14.6413 1.58523 14.656C1.64359 14.6707 1.70483 14.6693 1.76246 14.6519L4.66446 13.7719C4.87324 13.7084 5.06324 13.5947 5.21779 13.4406L14.1158 4.54126Z"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface AiSearchToggleProps {
  className?: string;
  property1?: "Default" | "ask ai" | "more";
  onSearch?: (query: string, mode: "search" | "ai") => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AiSearchToggle({
  className = "",
  property1 = "Default",
  onSearch,
}: AiSearchToggleProps) {
  const [mode, setMode] = useState<"search" | "ai">(
    property1 === "Default" ? "search" : "ai"
  );
  const [isMoreOpen, setIsMoreOpen] = useState(property1 === "more");
  const [query, setQuery] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state if property1 changes externally (e.g. Figma variant selector in admin)
  useEffect(() => {
    if (property1 === "Default") {
      setMode("search");
      setIsMoreOpen(false);
    } else if (property1 === "ask ai") {
      setMode("ai");
      setIsMoreOpen(false);
    } else if (property1 === "more") {
      setMode("ai");
      setIsMoreOpen(true);
    }
  }, [property1]);

  const isAi = mode === "ai";

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      onSearch?.(query, mode);
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-4 w-full select-none ${className}`}
    >
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 32,
          mass: 0.8,
        }}
        className="flex flex-col gap-[14px] w-full max-w-[420px]"
      >
        {/* Main Search Card Frame: Perfectly animated without CSS transition conflicts */}
        <motion.div
          layout
          initial={false}
          animate={{
            borderRadius: isAi ? 24 : 33,
            paddingTop: isAi ? 8 : 4,
            paddingBottom: isAi ? 8 : 4,
            paddingLeft: 16,
            paddingRight: isAi ? 8 : 4,
            gap: isAi ? 12 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 32,
            mass: 0.8,
          }}
          className="w-full bg-[#fbfcfd] border border-[#d7dadc] border-solid flex flex-col relative overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
          }}
        >
          {/* Top Row: Search Icon + Animated Blur-Morph Placeholder / Input + Segmented Toggle */}
          <div className="flex items-center gap-[12px] w-full min-h-[41px]">
            {/* Search Icon */}
            <div className="shrink-0 size-[16px] flex items-center justify-center">
              <SearchIcon />
            </div>

            {/* Input Field with Cinematic Blur-Morph Placeholder */}
            <div className="relative flex-1 min-w-0 flex items-center h-[33px]">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="relative z-10 w-full bg-transparent text-[14px] leading-[1.2] text-[#1f2123] outline-none font-sans font-normal"
                style={{
                  fontFeatureSettings: '"ordn" 1, "salt" 1, "lnum" 1, "pnum" 1',
                }}
              />
              {!query && (
                <div className="absolute inset-0 flex items-center pointer-events-none select-none">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isAi ? "ai-placeholder" : "search-placeholder"}
                      initial={{
                        opacity: 0,
                        y: isAi ? 4 : -4,
                        filter: "blur(4px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        y: isAi ? -4 : 4,
                        filter: "blur(4px)",
                      }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[14px] leading-[1.2] text-[#8c847e] font-sans font-normal"
                      style={{
                        fontFeatureSettings:
                          '"ordn" 1, "salt" 1, "lnum" 1, "pnum" 1',
                      }}
                    >
                      {isAi ? "ask uxwithmotion" : "Search components"}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Segmented Mode Toggle: Search | Ask AI */}
            <div className="bg-[#eef1f4] flex items-center gap-[4px] h-[41px] px-[4px] py-[4px] rounded-[44px] relative shrink-0">
              {/* "Search" Tab */}
              <button
                type="button"
                onClick={() => {
                  setMode("search");
                  setIsMoreOpen(false);
                }}
                className="relative z-10 h-[33px] px-[12px] py-[2px] rounded-[45px] flex items-center justify-center cursor-pointer select-none"
              >
                {!isAi && (
                  <motion.div
                    layoutId="active-mode-pill"
                    initial={false}
                    animate={{
                      backgroundColor: "#fdfdfd",
                      borderRadius: 45,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                      mass: 0.7,
                    }}
                    className="absolute inset-0"
                  />
                )}
                <motion.span
                  animate={{
                    color: !isAi ? "#030202" : "rgba(31,33,35,0.75)",
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 font-sans font-medium text-[12px] leading-[24px] whitespace-nowrap"
                >
                  Search
                </motion.span>
              </button>

              {/* "Ask AI" Tab */}
              <button
                type="button"
                onClick={() => setMode("ai")}
                className="relative z-10 h-[33px] pl-[10px] pr-[10px] py-[2px] rounded-[69px] flex items-center justify-center gap-[4px] cursor-pointer select-none"
              >
                {isAi && (
                  <motion.div
                    layoutId="active-mode-pill"
                    initial={false}
                    animate={{
                      backgroundColor: "#1f2123",
                      borderRadius: 69,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                      mass: 0.7,
                    }}
                    className="absolute inset-0"
                  />
                )}
                {/* AI Sparkle Icon: Color and scale gently morph */}
                <motion.div
                  animate={{
                    scale: isAi ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex items-center justify-center shrink-0 size-[18px]"
                >
                  <AiSparkleIcon fill={isAi ? "#FFFFFF" : "#1F2123"} />
                </motion.div>
                <motion.span
                  animate={{
                    color: isAi ? "#FFFFFF" : "rgba(31,33,35,0.75)",
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 font-sans font-medium text-[12px] leading-[24px] whitespace-nowrap"
                >
                  Ask AI
                </motion.span>
              </button>
            </div>
          </div>

          {/* Bottom Row (Visible in Ask AI mode) with Blur-Morph Collapse/Expand */}
          <AnimatePresence initial={false}>
            {isAi && (
              <motion.div
                key="ai-bottom-row"
                initial={{
                  opacity: 0,
                  height: 0,
                  filter: "blur(6px)",
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  height: 34,
                  filter: "blur(0px)",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  filter: "blur(6px)",
                  y: -6,
                }}
                transition={{
                  opacity: { duration: 0.2 },
                  filter: { duration: 0.2 },
                  height: {
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                    mass: 0.8,
                  },
                  y: {
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                  },
                }}
                className="w-full flex items-center justify-between overflow-hidden shrink-0"
              >
                {/* "More" Button */}
                <div className="flex items-center self-stretch">
                  <motion.button
                    type="button"
                    onClick={() => setIsMoreOpen((v) => !v)}
                    animate={{
                      backgroundColor: isMoreOpen ? "#e2e6eb" : "#eef1f4",
                    }}
                    transition={{ duration: 0.2 }}
                    className="backdrop-blur-[42px] cursor-pointer flex gap-[4px] h-[34px] items-center justify-center min-w-[64px] px-[10px] py-[8px] rounded-[12px] shrink-0"
                  >
                    <motion.div
                      animate={{ rotate: isMoreOpen ? 45 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 24,
                      }}
                      className="shrink-0 size-[18px] flex items-center justify-center"
                    >
                      <PlusIcon />
                    </motion.div>
                    <span className="font-sans font-medium text-[12px] leading-[1.35] text-[#626467] whitespace-nowrap">
                      More
                    </span>
                  </motion.button>
                </div>

                {/* Right Action Icons: Mic + Send */}
                <div className="flex items-center gap-[12px] h-[34px] shrink-0">
                  {/* Mic Icon Button */}
                  <button
                    type="button"
                    className="size-[34px] p-[6px] rounded-[6px] flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-[#838B8E]"
                    title="Voice input"
                  >
                    <MicIcon />
                  </button>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (query.trim()) onSearch?.(query, mode);
                    }}
                    className="size-[34px] bg-[#1f2123] rounded-[25px] p-[4px] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="Send"
                  >
                    <ArrowUpShortIcon />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* More Options Row: All 3 Features with Smooth Blur-Morph Transition */}
        <AnimatePresence initial={false}>
          {isAi && isMoreOpen && (
            <motion.div
              layout
              initial={{
                opacity: 0,
                y: -8,
                filter: "blur(6px)",
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -8,
                filter: "blur(6px)",
                height: 0,
              }}
              transition={{
                opacity: { duration: 0.2 },
                filter: { duration: 0.2 },
                height: {
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                  mass: 0.8,
                },
                y: {
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                },
              }}
              className="flex flex-row items-center gap-[8px] w-full overflow-hidden"
            >
              {/* Feature 1: Generate image */}
              <button
                type="button"
                onClick={() => toggleTool("generate-image")}
                className={`backdrop-blur-[42px] flex gap-[4px] items-center justify-center px-[12px] py-[10px] rounded-[23px] shrink-0 cursor-pointer transition-colors duration-200 ${
                  selectedTools.includes("generate-image")
                    ? "bg-[#1f2123] text-white shadow-sm"
                    : "bg-[#eef1f4] hover:bg-[#e4e8ec] text-[#626467]"
                }`}
              >
                <ImageIcon
                  className="size-[16px] shrink-0"
                  stroke={
                    selectedTools.includes("generate-image")
                      ? "#FFFFFF"
                      : "#626467"
                  }
                />
                <span className="font-sans text-[12px] leading-[1.35] whitespace-nowrap">
                  Generate image
                </span>
              </button>

              {/* Feature 2: Web Search */}
              <button
                type="button"
                onClick={() => toggleTool("web-search")}
                className={`flex gap-[4px] items-center justify-center px-[12px] py-[10px] rounded-[31px] shrink-0 cursor-pointer transition-colors duration-200 ${
                  selectedTools.includes("web-search")
                    ? "bg-[#1f2123] text-white shadow-sm"
                    : "bg-[#eef1f4] hover:bg-[#e4e8ec] text-[#61686b]"
                }`}
              >
                <GlobeIcon
                  className="size-[16px] shrink-0"
                  stroke={
                    selectedTools.includes("web-search")
                      ? "#FFFFFF"
                      : "#61686B"
                  }
                />
                <span className="font-sans text-[12px] leading-normal whitespace-nowrap">
                  Web Search
                </span>
              </button>

              {/* Feature 3: Tools */}
              <button
                type="button"
                onClick={() => toggleTool("tools")}
                className={`flex gap-[4px] items-center justify-center px-[12px] py-[10px] rounded-[31px] shrink-0 cursor-pointer transition-colors duration-200 ${
                  selectedTools.includes("tools")
                    ? "bg-[#1f2123] text-white shadow-sm"
                    : "bg-[#eef1f4] hover:bg-[#e4e8ec] text-[#61686b]"
                }`}
              >
                <PencilRulerIcon
                  className="size-[16px] shrink-0"
                  stroke={
                    selectedTools.includes("tools") ? "#FFFFFF" : "#61686B"
                  }
                />
                <span className="font-sans text-[12px] leading-normal whitespace-nowrap">
                  Tools
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default AiSearchToggle;
