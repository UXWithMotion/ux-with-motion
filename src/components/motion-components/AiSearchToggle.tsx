"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Wand2,
  Plus,
  Mic,
  ArrowUp,
  Image as ImageIcon,
  Globe,
  Wrench,
  Check,
} from "lucide-react";

export interface AiSearchToggleProps {
  initialMode?: "search" | "ai";
  onSearch?: (query: string, mode: "search" | "ai") => void;
  className?: string;
}

export function AiSearchToggle({
  initialMode = "search",
  onSearch,
  className = "",
}: AiSearchToggleProps) {
  const [mode, setMode] = useState<"search" | "ai">(initialMode);
  const [query, setQuery] = useState("");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAi = mode === "ai";

  const tools = [
    { id: "generate-image", label: "Generate image", icon: ImageIcon },
    { id: "web-search", label: "Web Search", icon: Globe },
    { id: "tools", label: "Tools", icon: Wrench },
  ];

  // Auto focus input when switching mode
  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const toggleTool = (id: string) => {
    setActiveTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
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
      {/* SVG Gooey Filter for Liquid Detachment and Attachment */}
      <svg
        className="absolute w-0 h-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="liquid-detachment-attachment-filter"
            x="-20%"
            y="-20%"
            width="140%"
            height="160%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main Component Card Wrapper */}
      <div className="relative flex flex-col items-center w-full max-w-[560px]">
        {/* Outer Animated Gradient Border Container */}
        <motion.div
          layout
          initial={false}
          animate={{
            borderRadius: isAi ? 28 : 9999,
          }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 24,
            mass: 0.8,
          }}
          className="relative w-full p-[1.5px] overflow-hidden"
          style={{
            boxShadow: isAi
              ? "0 10px 30px -4px rgba(56, 189, 248, 0.15), 0 4px 16px -2px rgba(192, 132, 252, 0.1)"
              : "0 2px 10px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Moving Gradient Stroke (Ask AI Variant) */}
          <motion.div
            className="absolute -inset-[150%] pointer-events-none"
            initial={false}
            animate={{
              opacity: isAi ? 1 : 0,
            }}
            transition={{ duration: 0.45 }}
          >
            <div
              className="w-full h-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #38BDF8 0%, #FB7185 25%, #C084FC 50%, #FBBF24 75%, #38BDF8 100%)",
                animation: "spinGradient 4s linear infinite",
              }}
            />
          </motion.div>

          {/* Fallback Static Subtle Border for Search Mode */}
          <motion.div
            className="absolute inset-0 border border-[#E5E7EB] pointer-events-none"
            initial={false}
            animate={{
              opacity: isAi ? 0 : 1,
              borderRadius: isAi ? 28 : 9999,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Inner Content Card */}
          <motion.div
            layout
            initial={false}
            animate={{
              borderRadius: isAi ? 26.5 : 9999,
            }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 24,
              mass: 0.8,
            }}
            className="relative w-full bg-white z-10 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Row: Search Icon, Text Input, and Mode Segmented Toggle */}
            <div className="flex items-center h-[58px] px-5 gap-3">
              {/* Magnifying Glass Search Icon */}
              <div className="shrink-0 flex items-center justify-center text-[#525252]">
                <Search className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* Text Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAi
                    ? "Search sustainable products..."
                    : "Search components"
                }
                className="flex-1 bg-transparent border-none outline-none font-sans text-[15px] font-medium text-[#1F2123] placeholder:text-[#8E9196]"
              />

              {/* Mode Segmented Toggle: Search | Ask AI */}
              <div className="shrink-0 relative flex items-center h-[42px] p-[3px] bg-[#F3F4F6] rounded-full">
                {/* Sliding Background Indicator with Left-to-Right Color Transition (#FDFDFD -> #1F2123) */}
                <motion.div
                  className="absolute top-[3px] bottom-[3px] rounded-full pointer-events-none"
                  initial={false}
                  animate={{
                    left: isAi ? "calc(50% + 1px)" : "3px",
                    right: isAi ? "3px" : "calc(50% + 1px)",
                    backgroundColor: isAi ? "#1F2123" : "#FDFDFD",
                    boxShadow: isAi
                      ? "0 2px 6px rgba(0, 0, 0, 0.2)"
                      : "0 1px 3px rgba(0, 0, 0, 0.08)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 26,
                    mass: 0.8,
                  }}
                />

                {/* "Search" Option Button */}
                <button
                  type="button"
                  onClick={() => setMode("search")}
                  className={`relative z-10 flex items-center justify-center px-4 h-full rounded-full text-[13px] font-medium transition-colors duration-250 cursor-pointer ${
                    !isAi ? "text-[#1F2123]" : "text-[#4B5563] hover:text-[#1F2123]"
                  }`}
                >
                  Search
                </button>

                {/* "Ask AI" Option Button */}
                <button
                  type="button"
                  onClick={() => setMode("ai")}
                  className={`relative z-10 flex items-center justify-center gap-1.5 px-4 h-full rounded-full text-[13px] font-medium transition-colors duration-250 cursor-pointer ${
                    isAi ? "text-white" : "text-[#4B5563] hover:text-[#1F2123]"
                  }`}
                >
                  <AnimatePresence>
                    {isAi && (
                      <motion.span
                        initial={{ scale: 0, rotate: -45, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: 45, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 22 }}
                        className="flex items-center justify-center"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-white" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span>Ask AI</span>
                </button>
              </div>
            </div>

            {/* Bottom Row (Visible only in Ask AI Variant) */}
            <AnimatePresence>
              {isAi && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 24,
                    mass: 0.8,
                  }}
                  className="flex items-center justify-between px-5 pb-3.5 pt-1 border-t border-transparent overflow-hidden"
                >
                  {/* "+ More" Button with Liquid Detachment Trigger */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, backgroundColor: "#E5E7EB" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsMoreOpen((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                      isMoreOpen
                        ? "bg-[#E5E7EB] text-[#1F2123]"
                        : "bg-[#F3F4F6] text-[#4B5563]"
                    }`}
                  >
                    <motion.span
                      animate={{ rotate: isMoreOpen ? 45 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 stroke-[2.2]" />
                    </motion.span>
                    <span>More</span>
                  </motion.button>

                  {/* Right Actions: Voice Mic + Up Arrow Send Button */}
                  <div className="flex items-center gap-3">
                    {/* Voice Microphone Icon */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1, color: "#1F2123" }}
                      whileTap={{ scale: 0.92 }}
                      className="flex items-center justify-center w-8 h-8 rounded-full text-[#6B7280] hover:bg-black/5 transition-colors cursor-pointer"
                      title="Voice search"
                    >
                      <Mic className="w-4 h-4" />
                    </motion.button>

                    {/* Up-Arrow Circular Action Button */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => query.trim() && onSearch?.(query, mode)}
                      className="flex items-center justify-center w-[36px] h-[36px] rounded-full bg-[#1F2123] text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                      title="Submit"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Liquid Detachment & Attachment Droplet Container (Gooey SVG Filter Layer) */}
        <div
          className="relative w-full flex justify-start pl-8 pointer-events-none"
          style={{
            filter: "url(#liquid-detachment-attachment-filter)",
          }}
        >
          {/* Liquid Anchor Droplet at More Button Base */}
          <div className="w-10 h-3 -mt-1.5 rounded-b-full bg-white transition-opacity duration-300" />

          {/* Liquid Detaching / Attaching Menu Background Droplet */}
          <AnimatePresence>
            {isAi && isMoreOpen && (
              <motion.div
                initial={{
                  y: -8,
                  scaleY: 1.4,
                  scaleX: 0.6,
                  opacity: 0.9,
                }}
                animate={{
                  y: 12,
                  scaleY: 1,
                  scaleX: 1,
                  opacity: 1,
                }}
                exit={{
                  y: -10,
                  scaleY: 1.3,
                  scaleX: 0.7,
                  opacity: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                  mass: 0.75,
                }}
                className="absolute top-0 w-[420px] h-[48px] rounded-2xl bg-white shadow-md pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Crisp Detached Tool Menu Layer (Rendered Above Gooey Filter for Razor-Sharp Typography) */}
        <AnimatePresence>
          {isAi && isMoreOpen && (
            <motion.div
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 12, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
                mass: 0.75,
              }}
              className="absolute top-[138px] z-20 flex items-center gap-6 px-4 py-2.5 rounded-2xl bg-white/95 border border-[#E5E7EB] backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            >
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTools.includes(tool.id);
                return (
                  <motion.button
                    key={tool.id}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTool(tool.id)}
                    className={`flex items-center gap-2 text-[13px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "text-[#1F2123]"
                        : "text-[#525252] hover:text-[#1F2123]"
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.8] text-[#525252]" />
                    <span>{tool.label}</span>
                    {isActive && (
                      <Check className="w-3 h-3 text-[#1F2123] stroke-[2.5]" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes spinGradient {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default AiSearchToggle;
