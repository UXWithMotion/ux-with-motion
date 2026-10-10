"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function SwipeArrowButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      className="relative flex h-[44px] w-[127px] items-center overflow-hidden rounded-[50px] bg-[#1566E5] text-white"
    >
      {/* Left Arrow (Hidden by default, slides in from left) */}
      <motion.div
        initial={false}
        animate={{
          left: isHovered ? 16 : -20,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute top-1/2 -translate-y-1/2"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4.16667 10H15.8333M10.8333 15L15.8333 10L10.8333 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Text Label */}
      <motion.span
        initial={false}
        animate={{
          left: isHovered ? 41 : 16,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute top-1/2 -translate-y-1/2 font-sans text-[16px] font-medium leading-[1.2]"
      >
        Continue
      </motion.span>

      {/* Right Arrow (Visible by default, slides out to right) */}
      <motion.div
        initial={false}
        animate={{
          left: isHovered ? 131 : 91,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute top-1/2 -translate-y-1/2"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4.16667 10H15.8333M10.8333 15L15.8333 10L10.8333 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.button>
  );
}

