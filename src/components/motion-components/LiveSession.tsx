"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  hasRing?: boolean;
}

const PARTICIPANTS: Participant[] = [
  {
    id: "reena",
    name: "Reena",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "gauri",
    name: "Gauri",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "radhe",
    name: "Radhe",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=160&q=80",
    hasRing: true, // Orange ring (#E87D02) in Figma collapsed variant
  },
  {
    id: "brahmi",
    name: "Brahmi",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "pooja",
    name: "Pooja",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "priya",
    name: "Priya",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "shilpa",
    name: "Shilpa",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "kriti",
    name: "Kriti",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80",
  },
];

// Sound Wave Equalizer from Figma node 1960:1002 (bar1, bar2, bar3)
function SoundWaveIcon({ isAnimated = true }: { isAnimated?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-[16px] w-[20px]">
      {/* bar1 */}
      <motion.span
        className="w-[5px] rounded-full bg-white shrink-0"
        animate={
          isAnimated
            ? {
                height: [5, 11, 5],
              }
            : { height: 5 }
        }
        transition={{
          duration: 0.75,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
      {/* bar2 */}
      <motion.span
        className="w-[5px] rounded-full bg-white shrink-0"
        animate={
          isAnimated
            ? {
                height: [11, 5, 12],
              }
            : { height: 11 }
        }
        transition={{
          duration: 0.65,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 0.15,
        }}
      />
      {/* bar3 */}
      <motion.span
        className="w-[5px] rounded-full bg-white shrink-0"
        animate={
          isAnimated
            ? {
                height: [5, 12, 5],
              }
            : { height: 5 }
        }
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 0.3,
        }}
      />
    </div>
  );
}

// Chevron Icon from Figma node 1960:1102
function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.div
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="w-[24px] h-[24px] flex items-center justify-center text-[#050505] shrink-0"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current stroke-[2.5]"
      >
        <path d="M5 9L12 16L19 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

export function LiveSession() {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  // iOS-style liquid spring physics (fluid bounce, high responsiveness, smooth settle)
  const fluidSpring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 26,
    mass: 0.85,
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-[310px] select-none p-4">
      {/* Centered Expanding Card: Origin remains anchored exactly in the center */}
      <motion.div
        ref={containerRef}
        layout
        initial={false}
        animate={{
          height: isExpanded ? 289 : 52,
          borderRadius: isExpanded ? 32 : 26,
        }}
        transition={fluidSpring}
        style={{ transformOrigin: "center center" }}
        whileTap={{ scale: 0.985 }}
        className="relative w-[292px] bg-white/90 backdrop-blur-2xl border border-white/80 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.02),inset_0_1px_0_0_rgba(255,255,255,0.95)] overflow-hidden cursor-pointer flex flex-col justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <AnimatePresence initial={false}>
          {!isExpanded ? (
            /* Variant 1: Collapsed Pill (292px x 52px) */
            <motion.div
              key="collapsed-pill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={fluidSpring}
              className="absolute top-0 left-0 right-0 flex items-center justify-between w-full h-[52px] px-2 z-10"
            >
              {/* Sound wave icon (44px circle) morphs into bottom speaking bar */}
              <motion.div
                layoutId="live-session-sound-wave"
                transition={fluidSpring}
                className="w-[44px] h-[44px] rounded-full bg-[#1F2123] flex items-center justify-center shrink-0 shadow-sm"
              >
                <SoundWaveIcon isAnimated={true} />
              </motion.div>

              {/* Overlapping Avatars (Frame 10: 176px total width) - Morph fluidly into Grid Row 1 */}
              <div className="flex items-center -space-x-[11px] pl-1">
                {/* 1. Reena */}
                <motion.div
                  layoutId="live-session-avatar-reena"
                  transition={fluidSpring}
                  className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-white shrink-0 shadow-sm"
                >
                  <img
                    src={PARTICIPANTS[0].avatar}
                    alt={PARTICIPANTS[0].name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* 2. Gauri */}
                <motion.div
                  layoutId="live-session-avatar-gauri"
                  transition={fluidSpring}
                  className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-white shrink-0 shadow-sm"
                >
                  <img
                    src={PARTICIPANTS[1].avatar}
                    alt={PARTICIPANTS[1].name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* 3. Radhe */}
                <motion.div
                  layoutId="live-session-avatar-radhe"
                  transition={fluidSpring}
                  className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-white shrink-0 shadow-sm"
                >
                  <img
                    src={PARTICIPANTS[2].avatar}
                    alt={PARTICIPANTS[2].name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* 4. Brahmi */}
                <motion.div
                  layoutId="live-session-avatar-brahmi"
                  transition={fluidSpring}
                  className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-white shrink-0 shadow-sm"
                >
                  <img
                    src={PARTICIPANTS[3].avatar}
                    alt={PARTICIPANTS[3].name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* 5. +4 bubble */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.15 } }}
                  transition={fluidSpring}
                  className="w-[44px] h-[44px] rounded-full bg-[#1F2123] text-white flex items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[15px] ring-2 ring-white shrink-0"
                >
                  +4
                </motion.div>
              </div>

              {/* Chevron Down */}
              <motion.div layoutId="live-session-chevron" transition={fluidSpring}>
                <ChevronIcon isExpanded={false} />
              </motion.div>
            </motion.div>
          ) : (
            /* Variant 2: Expanded Card (292px x 289px) expanding symmetrically from center */
            <motion.div
              key="expanded-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={fluidSpring}
              className="relative flex flex-col justify-between w-full h-[289px] p-4"
            >
              {/* Header (Frame 13) */}
              <div className="flex items-center justify-between w-full px-1 pt-1">
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...fluidSpring, delay: 0.05 }}
                  className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[18px] text-[#050505] tracking-tight"
                >
                  Live session
                </motion.h3>
                <motion.div layoutId="live-session-chevron" transition={fluidSpring}>
                  <ChevronIcon isExpanded={true} />
                </motion.div>
              </div>

              {/* Participants Grid (Frame 18 & Frame 19: 8 items) */}
              <div className="grid grid-cols-4 gap-y-3 gap-x-2 my-auto px-1">
                {/* Row 1: Reena, Gauri, Radhe, Brahmi (morph from collapsed stack) */}
                <div className="flex flex-col items-center">
                  <motion.div
                    layoutId="live-session-avatar-reena"
                    transition={fluidSpring}
                    className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-white shrink-0 shadow-sm"
                  >
                    <img
                      src={PARTICIPANTS[0].avatar}
                      alt={PARTICIPANTS[0].name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.08 }}
                    className="font-['Plus_Jakarta_Sans',sans-serif] text-[12px] text-[#050505] mt-1 tracking-tight"
                  >
                    Reena
                  </motion.span>
                </div>

                <div className="flex flex-col items-center">
                  <motion.div
                    layoutId="live-session-avatar-gauri"
                    transition={fluidSpring}
                    className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-white shrink-0 shadow-sm"
                  >
                    <img
                      src={PARTICIPANTS[1].avatar}
                      alt={PARTICIPANTS[1].name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.08 }}
                    className="font-['Plus_Jakarta_Sans',sans-serif] text-[12px] text-[#050505] mt-1 tracking-tight"
                  >
                    Gauri
                  </motion.span>
                </div>

                <div className="flex flex-col items-center">
                  <motion.div
                    layoutId="live-session-avatar-radhe"
                    transition={fluidSpring}
                    className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-white shrink-0 shadow-sm"
                  >
                    <img
                      src={PARTICIPANTS[2].avatar}
                      alt={PARTICIPANTS[2].name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.08 }}
                    className="font-['Plus_Jakarta_Sans',sans-serif] text-[12px] text-[#050505] mt-1 tracking-tight"
                  >
                    Radhe
                  </motion.span>
                </div>

                <div className="flex flex-col items-center">
                  <motion.div
                    layoutId="live-session-avatar-brahmi"
                    transition={fluidSpring}
                    className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-white shrink-0 shadow-sm"
                  >
                    <img
                      src={PARTICIPANTS[3].avatar}
                      alt={PARTICIPANTS[3].name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.08 }}
                    className="font-['Plus_Jakarta_Sans',sans-serif] text-[12px] text-[#050505] mt-1 tracking-tight"
                  >
                    Brahmi
                  </motion.span>
                </div>

                {/* Row 2: Pooja, Priya, Shilpa, Kriti (bloom out from +4 position) */}
                {PARTICIPANTS.slice(4).map((person, idx) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 14, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 25,
                      delay: 0.04 + idx * 0.03,
                    }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-[44px] h-[44px] rounded-full overflow-hidden ring-2 ring-white shrink-0 shadow-sm">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[12px] text-[#050505] mt-1 tracking-tight">
                      {person.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Speaking Bar (Frame 20: 260px x 44px) - morphs from sound wave icon */}
              <motion.div
                layoutId="live-session-sound-wave"
                transition={fluidSpring}
                className="w-[260px] h-[44px] mx-auto bg-[#1F2123] rounded-full flex items-center justify-between px-3 shadow-sm shrink-0"
              >
                <SoundWaveIcon isAnimated={true} />
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12, duration: 0.25 }}
                  className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[13px] text-white pr-2 whitespace-nowrap"
                >
                  Pooja is speaking
                </motion.span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default LiveSession;
