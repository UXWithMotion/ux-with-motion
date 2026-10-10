"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function ViewMoreEyeButton() {
  const [isHovered, setIsHovered] = useState(false);

  // Gentle spring configuration for the sliding effect
  const slideSpring = {
    type: "spring" as const,
    stiffness: 150,
    damping: 20,
    mass: 0.8,
  };

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      // Outer button creates the gradient border via padding (1px)
      className="relative flex h-[49px] w-[116px] p-[1px] cursor-pointer rounded-[10px] bg-[linear-gradient(90deg,#5A94FF_0%,#F7AE51_33%,#D36CFF_66%,#70DAFF_100%)] overflow-hidden"
    >
      {/* Inner container masks the center and holds the actual UI */}
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[9px] bg-[#F5F9FF]">
        {/* Eye Icon (Hidden by default, slides in from left) */}
        <motion.div
          initial={false}
          animate={{
            x: isHovered ? 0 : -80,
          }}
          transition={slideSpring}
          className="absolute flex items-center justify-center"
        >
          <motion.div
            animate={isHovered ? "blink" : "initial"}
            variants={{
              initial: { scaleY: 1 },
              blink: {
                scaleY: [1, 0.1, 1],
                transition: {
                  duration: 0.3,
                  times: [0, 0.5, 1],
                  ease: "easeInOut",
                  delay: 0.3, // blink slightly after settling in the center
                  repeat: Infinity,
                  repeatDelay: 2,
                },
              },
            }}
            className="flex items-center justify-center"
          >
            <svg
              width="38"
              height="26"
              viewBox="0 0 38 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 0C10.3636 0 2.98818 5.37182 0 12.9545C2.98818 20.5373 10.3636 25.9091 19 25.9091C27.6364 25.9091 35.0118 20.5373 38 12.9545C35.0118 5.37182 27.6364 0 19 0ZM19 21.5909C14.2327 21.5909 10.3636 17.7218 10.3636 12.9545C10.3636 8.18727 14.2327 4.31818 19 4.31818C23.7673 4.31818 27.6364 8.18727 27.6364 12.9545C27.6364 17.7218 23.7673 21.5909 19 21.5909ZM19 7.77273C16.1327 7.77273 13.8182 10.0873 13.8182 12.9545C13.8182 15.8218 16.1327 18.1364 19 18.1364C21.8673 18.1364 24.1818 15.8218 24.1818 12.9545C24.1818 10.0873 21.8673 7.77273 19 7.77273Z"
                fill="#323232"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Text Label */}
        <motion.span
          initial={false}
          animate={{
            x: isHovered ? 100 : 0,
          }}
          transition={slideSpring}
          className="absolute font-sans text-[16px] font-medium text-black whitespace-nowrap pointer-events-none"
        >
          View more
        </motion.span>
      </div>
    </motion.button>
  );
}
