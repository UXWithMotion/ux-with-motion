"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const pathOff =
  "M26 14C26 20.6274 20.6274 26 14 26C7.3726 26 2 20.6274 2 14C2 7.3726 7.3726 2 14 2C20.6274 2 26 7.3726 26 14Z";
const pathStretchRight =
  "M39 14C39 20.6274 26.6274 26 20 26C13.3726 26 8 20.6274 8 14C8 7.37258 13.3726 2 20 2C26.6274 2 39 7.37258 39 14Z";
const pathOn =
  "M56 14C56 20.6274 50.6274 26 44 26C37.3726 26 32 20.6274 32 14C32 7.3726 37.3726 2 44 2C50.6274 2 56 7.3726 56 14Z";
const pathStretchLeft =
  "M50 14C50 20.6274 44.6274 26 38 26C31.3726 26 20.5 20.6274 20.5 14C20.5 7.37258 31.3726 2 38 2C44.6274 2 50 7.37258 50 14Z";

export function MotionToggle() {
  const [isOn, setIsOn] = useState(false);

  return (
    <motion.button
      onClick={() => setIsOn(!isOn)}
      initial={false}
      animate={{
        backgroundColor: isOn ? "#1F2123" : "#FFFFFF",
        borderColor: isOn ? "#1F2123" : "#DEE1E4",
      }}
      className="relative flex h-[30px] w-[60px] cursor-pointer items-center justify-center rounded-full border shadow-sm"
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <svg
        width="58"
        height="28"
        viewBox="0 0 58 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 m-auto"
      >
        <motion.path
          initial={false}
          animate={
            isOn
              ? {
                  d: [pathOff, pathStretchRight, pathOn],
                  fill: "#FFFFFF",
                }
              : {
                  d: [pathOn, pathStretchLeft, pathOff],
                  fill: "#1F2123",
                }
          }
          transition={{
            duration: 0.4,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        />
      </svg>
    </motion.button>
  );
}
