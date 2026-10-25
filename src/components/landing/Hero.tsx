"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ExploreButton } from "@/components/ui/ExploreButton";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative w-full overflow-hidden pt-8 pb-12 md:pt-16 md:pb-24 bg-[#FBFCFD]">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-[60px] max-w-[1294px] mx-auto">
          
          {/* Left Artwork / Video */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full md:w-1/2 flex justify-center md:justify-start"
          >
            <div className="relative w-full max-w-[560px] aspect-[511/424] rounded-[24px] overflow-hidden">
              <video
                ref={videoRef}
                src="/videos/ux with motion final animation.mp4"
                autoPlay
                muted
                playsInline
                onTimeUpdate={() => {
                  // Adjust this value (in seconds) to cut off the black part at the end
                  const cutoffTime = 4.7; 
                  if (videoRef.current && videoRef.current.currentTime >= cutoffTime) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                }}
                className="w-full h-full object-cover scale-[1.2]"
              />
            </div>
          </motion.div>

          {/* Right Content */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex flex-col gap-[20px] md:gap-[28px] mb-[32px] md:mb-[40px] w-full max-w-[654px]">
              <h1 className="font-title font-bold text-[40px] sm:text-[48px] md:text-[56px] leading-[1.1] text-[#454545] tracking-[-0.02em] text-balance">
                Premium UI, starting here
              </h1>
              <p className="font-sans font-normal text-[18px] sm:text-[20px] md:text-[22px] leading-[1.6] text-[#7D7F82] max-w-[572px] text-balance">
                Discover 50+ thoughtfully crafted UI components by UXWithMotion (UX With Motion) to explore, learn
                from, and get inspired.
              </p>
            </div>

            {/* Explore Component CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <ExploreButton href="/components" label="Explore Components" />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}

