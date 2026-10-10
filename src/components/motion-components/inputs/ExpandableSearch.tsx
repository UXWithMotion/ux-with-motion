"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ExpandableSearch() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // A more gentle, natural spring transition
  const gentleSpring = {
    type: "spring" as const,
    stiffness: 150,
    damping: 20,
    mass: 0.8,
  };

  return (
    <motion.div
      initial={false}
      animate={{
        width: isExpanded ? 250 : 46,
        paddingLeft: isExpanded ? 16 : 11,
        paddingRight: isExpanded ? 16 : 11,
        borderColor: isExpanded ? "#A57FF0" : "transparent",
      }}
      transition={gentleSpring}
      className="relative flex h-[46px] items-center overflow-hidden rounded-[43px] border bg-[#F7F9FB] cursor-pointer"
      onClick={() => {
        if (!isExpanded) setIsExpanded(true);
      }}
    >
      <div className="shrink-0 flex items-center justify-center size-[24px]">
        <svg
          width="22.5"
          height="22.5"
          viewBox="0 0 22.5 22.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.2804 17.2198C17.9875 16.9269 17.5126 16.9269 17.2197 17.2198C16.9268 17.5126 16.9268 17.9875 17.2197 18.2804L17.7501 17.7501L18.2804 17.2198ZM21.2196 22.2804C21.5125 22.5733 21.9874 22.5733 22.2803 22.2804C22.5732 21.9875 22.5732 21.5126 22.2803 21.2197L21.75 21.75L21.2196 22.2804ZM17.7501 17.7501L17.2197 18.2804L21.2196 22.2804L21.75 21.75L22.2803 21.2197L18.2804 17.2198L17.7501 17.7501ZM9.75 18.75V18C5.19365 18 1.5 14.3063 1.5 9.75H0.75H0C0 15.1348 4.36522 19.5 9.75 19.5V18.75ZM18.75 9.75H18C18 14.3063 14.3063 18 9.75 18V18.75V19.5C15.1348 19.5 19.5 15.1348 19.5 9.75H18.75ZM9.75 0.75V1.5C14.3063 1.5 18 5.19365 18 9.75H18.75H19.5C19.5 4.36522 15.1348 0 9.75 0V0.75ZM9.75 0.75V0C4.36522 0 0 4.36522 0 9.75H0.75H1.5C1.5 5.19365 5.19365 1.5 9.75 1.5V0.75Z"
            fill="#2D264B"
          />
        </svg>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.input
            ref={inputRef}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            exit={{ opacity: 0, width: 0 }}
            transition={gentleSpring}
            type="text"
            placeholder="Search for..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsExpanded(false);
              }
            }}
            onBlur={() => {
              if (searchValue.trim() === "") {
                setIsExpanded(false);
              }
            }}
            className="ml-[10px] bg-transparent outline-none font-sans text-[16px] font-medium text-[#2D264B] placeholder:text-[#CBCED1]"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
