"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  initials?: string;
  isNew?: boolean;
}

// Initial 3 avatars from Figma design (State 1)
const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: "reena",
    name: "Reena",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "radhe",
    name: "Radhe",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "gauri",
    name: "Gauri",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&h=160&q=80",
  },
];

// Known email to avatar dictionary (matching Figma State 5)
const KNOWN_AVATARS: Record<string, { name: string; avatar: string }> = {
  "sahil@gmail.com": {
    name: "Sahil",
    // Exact man with dark hair and jacket from Figma State 5
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80",
  },
  "alex@gmail.com": {
    name: "Alex",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&h=160&q=80",
  },
  "elena@gmail.com": {
    name: "Elena",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80",
  },
  "daniel@gmail.com": {
    name: "Daniel",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80",
  },
};

// Generates first and last name first characters (initials) from email
function getInitialsFromEmail(email: string): string {
  const username = email.split("@")[0].trim();
  const parts = username.split(/[._\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (username.slice(0, 2) || "U").toUpperCase();
}

// Generates a soft vibrant gradient for initials avatar
function getInitialsColor(str: string): string {
  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-sky-500 to-blue-600",
    "from-violet-600 to-fuchsia-600",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export function LiveSessionInvite() {
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Click outside listener: collapse back to normal invite state if user clicks outside
  useEffect(() => {
    if (!isExpanded || isSubmitting) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
        setEmail("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isExpanded, isSubmitting]);

  // iOS-style liquid spring physics
  const fluidSpring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 26,
    mass: 0.85,
  };

  const handleSend = () => {
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    const lower = trimmed.toLowerCase();
    const known = KNOWN_AVATARS[lower];

    let newParticipant: Participant;
    if (known) {
      newParticipant = {
        id: `user-${Date.now()}`,
        name: known.name,
        email: trimmed,
        avatar: known.avatar,
        isNew: true,
      };
    } else {
      newParticipant = {
        id: `user-${Date.now()}`,
        name: trimmed.split("@")[0],
        email: trimmed,
        initials: getInitialsFromEmail(trimmed),
        isNew: true,
      };
    }

    // Step 1: Start the progressive blur & compacting animation
    setIsSubmitting(true);

    // Step 2: Add avatar immediately so it drops in while the pill compacts
    setParticipants(() => {
      // Strictly maintain MAX 4 participants (matching Figma State 5!)
      return [newParticipant, ...INITIAL_PARTICIPANTS];
    });

    // Step 3: Trigger the compacting transition to + Invite
    setIsExpanded(false);

    // Step 4: Settle back cleanly after animation completes
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape") {
      setIsExpanded(false);
      setEmail("");
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setParticipants(INITIAL_PARTICIPANTS);
    setIsExpanded(false);
    setEmail("");
  };

  const isFull = participants.length >= 4;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[160px] p-4 select-none">
      <motion.div
        ref={containerRef}
        layout
        transition={fluidSpring}
        className="relative flex items-center h-[52px] bg-white border border-[#E9EBEF] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-1 overflow-hidden"
      >
        {/* Avatars Stack (Frame 10) - Strictly max 4 avatars */}
        <motion.div layout transition={fluidSpring} className="flex items-center -space-x-[11px] pl-0.5 shrink-0 z-10">
          <AnimatePresence initial={false}>
            {participants.map((person) => (
              <motion.div
                key={person.id}
                layout
                initial={
                  person.isNew
                    ? { y: -48, scale: 0.6, opacity: 0 }
                    : { opacity: 1, scale: 1 }
                }
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{
                  type: "spring",
                  stiffness: 360,
                  damping: 24,
                  mass: 0.8,
                }}
                className="relative w-[44px] h-[44px] rounded-full shrink-0 shadow-sm ring-2 ring-white"
              >
                {person.avatar ? (
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-tr ${getInitialsColor(
                      person.email || person.name
                    )} flex items-center justify-center text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] tracking-tight shadow-inner`}
                    title={person.email || person.name}
                  >
                    {person.initials}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Action Pill: Single continuous fluid morphing container without direct cut */}
        <div className="relative pl-1 shrink-0">
          <motion.div
            layout
            animate={{
              width: isExpanded ? 291 : 94,
            }}
            transition={fluidSpring}
            className="relative flex items-center h-[44px] bg-[#EEF1F4] rounded-full overflow-hidden"
          >
            {/* View A: "+ Invite" button (visible when collapsed) */}
            <motion.button
              type="button"
              onClick={() => {
                if (!isExpanded && !isSubmitting) {
                  setIsExpanded(true);
                }
              }}
              animate={{
                opacity: isExpanded ? 0 : 1,
                x: isExpanded ? -20 : 0,
                filter: isExpanded ? "blur(8px)" : "blur(0px)",
                pointerEvents: isExpanded ? "none" : "auto",
              }}
              transition={{
                duration: isExpanded ? 0.2 : 0.45,
                ease: "easeInOut",
              }}
              className="absolute inset-0 flex items-center justify-center gap-1.5 px-4 h-full cursor-pointer text-[#1F2123] hover:text-black transition-colors"
            >
              {/* Plus Icon (Figma 1965:1263) */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current stroke-[2] shrink-0"
              >
                <path d="M10 4V16M4 10H16" strokeLinecap="round" />
              </svg>

              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[16px] tracking-tight whitespace-nowrap">
                Invite
              </span>
            </motion.button>

            {/* View B: Email Input & Send Button (fluidly expands, progressively blurs on submit) */}
            <motion.div
              animate={{
                opacity: isExpanded ? 1 : 0,
                x: isExpanded ? 0 : 25,
                filter: isSubmitting
                  ? "blur(12px)"
                  : isExpanded
                  ? "blur(0px)"
                  : "blur(8px)",
                pointerEvents: isExpanded && !isSubmitting ? "auto" : "none",
              }}
              transition={{
                duration: isSubmitting ? 0.5 : 0.35,
                ease: "easeInOut",
              }}
              className="flex items-center justify-between w-[291px] h-full pl-[12px] pr-[4px] shrink-0"
            >
              {/* Mail Icon & Input */}
              <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
                {/* Mail Icon (Figma 1965:1281) */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-[#898B8E] stroke-[1.5] shrink-0"
                >
                  <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
                  <path d="M3.5 5.5L10 11L16.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="name@gmail.com"
                  disabled={!isExpanded || isSubmitting}
                  className="w-full bg-transparent font-['Plus_Jakarta_Sans',sans-serif] text-[15px] text-[#1F2123] placeholder-[#898B8E] focus:outline-none tracking-tight"
                />
              </div>

              {/* "send" button (Figma Frame 22) */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={isSubmitting}
                className="h-[36px] px-4 rounded-full bg-[#1F2123] hover:bg-black text-white font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] flex items-center justify-center shrink-0 shadow-sm cursor-pointer transition-colors"
              >
                send
              </motion.button>
            </motion.div>

            {/* Progressive directional blur overlay sweeping across during contraction (Figma State 4) */}
            <motion.div
              animate={{
                opacity: isSubmitting ? 1 : 0,
                x: isSubmitting ? ["-100%", "0%", "100%"] : "-100%",
              }}
              transition={{
                duration: 0.55,
                ease: "easeInOut",
              }}
              className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#EEF1F4]/80 to-[#EEF1F4] backdrop-blur-[6px]"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Subtle indicator / reset button when max 4 reached */}
      {isFull && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleReset}
          className="mt-2 text-[12px] font-['Plus_Jakarta_Sans',sans-serif] text-[#898B8E] hover:text-[#1F2123] transition-colors cursor-pointer"
        >
          4/4 members • Click to reset demo
        </motion.button>
      )}
    </div>
  );
}

export default LiveSessionInvite;
