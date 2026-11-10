"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function Hero() {
  const [stats, setStats] = useState({
    activeText: "3 active users",
    membersText: "1,240 total visitors",
    totalVisitorsText: "1,240 total visitors",
  });
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  // Fetch live stats from API
  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const res = await fetch("/api/stats/hero");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStats({
              activeText: data.activeText || "3 active users",
              membersText: data.membersText || "1,240 total visitors",
              totalVisitorsText: data.totalVisitorsText || "1,240 total visitors",
            });
          }
        }
      } catch (err) {
        // Fallback gracefully to default values on error
        console.error("Failed to load live hero stats:", err);
      }
    }

    fetchStats();

    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Compute rotation list without duplicates
  const statList = useMemo(() => {
    const list = [stats.activeText];
    if (stats.membersText && stats.membersText !== stats.totalVisitorsText) {
      list.push(stats.membersText);
    }
    if (stats.totalVisitorsText) {
      list.push(stats.totalVisitorsText);
    }
    return list;
  }, [stats.activeText, stats.membersText, stats.totalVisitorsText]);

  // Smoothly cycle between stats every 4.5 seconds
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % statList.length);
    }, 4500);

    return () => clearInterval(cycleTimer);
  }, [statList.length]);

  const currentDisplay = statList[activeStatIndex % statList.length] || stats.activeText;

  const handleNextStat = () => {
    setActiveStatIndex((prev) => (prev + 1) % statList.length);
  };

  return (
    <section className="relative w-full bg-white overflow-hidden py-16 sm:py-20 md:py-24 lg:py-[155px]">
      <div className="max-w-[868px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Live Status Badge with Green Underline */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleNextStat}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleNextStat();
            }
          }}
          title="Click to toggle live counter"
          className="inline-flex flex-col items-center justify-center h-[36px] border-b-2 border-[#008232] cursor-pointer select-none transition-all duration-300 group"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentDisplay}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="font-sans font-normal text-[16px] leading-[24px] text-[#7D7F82] tracking-normal whitespace-nowrap"
            >
              {currentDisplay}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Title and Subtitle Container (Figma Frame 1171278874) */}
        <div className="mt-10 flex flex-col items-center max-w-[868px]">
          <h1 className="font-title font-bold text-[34px] sm:text-[42px] md:text-[49px] leading-[1.2] md:leading-[58.8px] text-black tracking-[-0.01em] text-balance">
            Animated UI components for React
          </h1>

          <p className="mt-3 font-sans font-normal text-[16px] sm:text-[18px] md:text-[20px] leading-[1.5] md:leading-[30px] text-[#7D7F82] max-w-[778px] text-balance">
            Explore animated inputs, buttons, and micro-interactions. Try them live, then sign in to copy the code for your next project.
          </p>
        </div>

        {/* Browse Components CTA Button (Figma Frame 5029) */}
        <div className="mt-8">
          <Link
            href="/components"
            className="inline-flex items-center justify-center w-[209px] h-[52px] bg-[#1F2123] hover:bg-black text-white font-sans font-medium text-[16px] leading-[19.2px] rounded-[27px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            Browse components
          </Link>
        </div>
      </div>
    </section>
  );
}
