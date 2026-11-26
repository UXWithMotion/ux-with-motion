"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type GooeyNavItemId = "home" | "explore" | "about" | "contact";

export interface GooeyNavProps {
  /** Initially selected tab ID (default: "about") */
  defaultActive?: GooeyNavItemId;
  /** Controlled active tab ID */
  activeId?: GooeyNavItemId;
  /** Callback fired when a tab is selected */
  onSelect?: (id: GooeyNavItemId) => void;
  /** Continuously cycle across tabs when idle (default: true) */
  autoPlay?: boolean;
  /** Milliseconds between continuous morph transitions (default: 2400) */
  intervalMs?: number;
  /** Optional extra CSS classes */
  className?: string;
}

const SVG_WIDTH = 322;
const SVG_HEIGHT = 88;
const CENTER_Y = 44;
const STEP_X = 80;
const START_X = 41;
const WHITE_CIRCLE_SIZE = 70;

const LEAD_SPRING = {
  type: "spring" as const,
  stiffness: 195,
  damping: 23,
  mass: 0.9,
};

const TRAIL_SPRING = {
  type: "spring" as const,
  stiffness: 115,
  damping: 19,
  mass: 1.25,
};

const ICON_SPRING = {
  type: "spring" as const,
  stiffness: 320,
  damping: 22,
};

function HomeIcon({ isActive, isHovered }: { isActive: boolean; isHovered: boolean }) {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      animate={{
        scale: isActive ? 1.08 : isHovered ? 1.07 : 1,
        y: isHovered && !isActive ? -1 : 0,
      }}
      transition={ICON_SPRING}
    >
      <path
        d="M3.75 10.5L12 3.5L20.25 10.5V19C20.25 19.8284 19.5784 20.5 18.75 20.5H5.25C4.42157 20.5 3.75 19.8284 3.75 19V10.5Z"
        stroke="currentColor"
        strokeWidth={isActive ? 2.05 : 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.g
        initial={false}
        animate={isHovered && !isActive ? { scaleY: [1, 0.85, 1] } : { scaleY: 1 }}
        style={{ transformOrigin: "12px 20px" }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        <path
          d="M9.75 20.5V14.25C9.75 13.4216 10.4216 12.75 11.25 12.75H12.75C13.5784 12.75 14.25 13.4216 14.25 14.25V20.5"
          stroke="currentColor"
          strokeWidth={isActive ? 2.05 : 1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function ExploreGridIcon({ isActive, isHovered }: { isActive: boolean; isHovered: boolean }) {
  const spread = isHovered || isActive ? 0.65 : 0;

  return (
    <motion.svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      animate={{
        scale: isActive ? 1.08 : isHovered ? 1.06 : 1,
      }}
      transition={ICON_SPRING}
    >
      <motion.g
        initial={false}
        animate={{ x: -spread, y: -spread }}
        transition={ICON_SPRING}
      >
        <rect
          x="3.75"
          y="3.75"
          width="6.75"
          height="6.75"
          rx="1.6"
          stroke="currentColor"
          strokeWidth={isActive ? 2.05 : 1.9}
        />
      </motion.g>
      <motion.g
        initial={false}
        animate={{ x: spread, y: -spread }}
        transition={ICON_SPRING}
      >
        <rect
          x="13.5"
          y="3.75"
          width="6.75"
          height="6.75"
          rx="1.6"
          stroke="currentColor"
          strokeWidth={isActive ? 2.05 : 1.9}
        />
      </motion.g>
      <motion.g
        initial={false}
        animate={{ x: -spread, y: spread }}
        transition={ICON_SPRING}
      >
        <rect
          x="3.75"
          y="13.5"
          width="6.75"
          height="6.75"
          rx="1.6"
          stroke="currentColor"
          strokeWidth={isActive ? 2.05 : 1.9}
        />
      </motion.g>
      <motion.g
        initial={false}
        animate={{ x: spread, y: spread }}
        transition={ICON_SPRING}
      >
        <rect
          x="13.5"
          y="13.5"
          width="6.75"
          height="6.75"
          rx="1.6"
          stroke="currentColor"
          strokeWidth={isActive ? 2.05 : 1.9}
        />
      </motion.g>
    </motion.svg>
  );
}

function AboutUserIcon({ isActive, isHovered }: { isActive: boolean; isHovered: boolean }) {
  return (
    <motion.svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      animate={{
        scale: isActive ? 1.09 : isHovered ? 1.06 : 1,
      }}
      transition={ICON_SPRING}
    >
      <motion.g
        initial={false}
        animate={{ y: isHovered ? -0.6 : 0 }}
        transition={ICON_SPRING}
      >
        <circle
          cx="12"
          cy="8.25"
          r="3.85"
          stroke="currentColor"
          strokeWidth={isActive ? 2.05 : 1.9}
        />
      </motion.g>
      <motion.g
        initial={false}
        animate={{ y: isHovered ? 0.35 : 0 }}
        transition={ICON_SPRING}
      >
        <path
          d="M5.75 19.75C5.75 16.4363 8.54822 13.75 12 13.75C15.4518 13.75 18.25 16.4363 18.25 19.75"
          stroke="currentColor"
          strokeWidth={isActive ? 2.05 : 1.9}
          strokeLinecap="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function ContactMailIcon({ isActive, isHovered }: { isActive: boolean; isHovered: boolean }) {
  return (
    <motion.svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      animate={{
        scale: isActive ? 1.08 : isHovered ? 1.06 : 1,
        rotate: isHovered && !isActive ? -4 : 0,
      }}
      transition={ICON_SPRING}
    >
      <rect
        x="2.75"
        y="4.75"
        width="18.5"
        height="14.5"
        rx="2.4"
        stroke="currentColor"
        strokeWidth={isActive ? 2.05 : 1.9}
      />
      <motion.g
        initial={false}
        animate={{ y: isHovered ? 0.55 : 0 }}
        transition={ICON_SPRING}
      >
        <path
          d="M3.75 6.5L12 12.75L20.25 6.5"
          stroke="currentColor"
          strokeWidth={isActive ? 2.05 : 1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

interface NavItemConfig {
  id: GooeyNavItemId;
  label: string;
  renderIcon: (isActive: boolean, isHovered: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "home",
    label: "Home",
    renderIcon: (isActive, isHovered) => (
      <HomeIcon isActive={isActive} isHovered={isHovered} />
    ),
  },
  {
    id: "explore",
    label: "Explore",
    renderIcon: (isActive, isHovered) => (
      <ExploreGridIcon isActive={isActive} isHovered={isHovered} />
    ),
  },
  {
    id: "about",
    label: "About",
    renderIcon: (isActive, isHovered) => (
      <AboutUserIcon isActive={isActive} isHovered={isHovered} />
    ),
  },
  {
    id: "contact",
    label: "Contact",
    renderIcon: (isActive, isHovered) => (
      <ContactMailIcon isActive={isActive} isHovered={isHovered} />
    ),
  },
];

export function GooeyNav({
  defaultActive = "about",
  activeId,
  onSelect,
  autoPlay = true,
  intervalMs = 2400,
  className = "",
}: GooeyNavProps) {
  const [internalActive, setInternalActive] = useState<GooeyNavItemId>(defaultActive);
  const [hoveredId, setHoveredId] = useState<GooeyNavItemId | null>(null);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [radiusScale, setRadiusScale] = useState(1);
  const navRef = useRef<HTMLElement>(null);
  const reactId = useId();
  const filterId = `gooey-nav-filter-${reactId.replace(/:/g, "")}`;

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const readScale = () => {
      const raw = window.getComputedStyle(el).getPropertyValue("--uxm-radius-scale").trim();
      if (!raw) {
        setRadiusScale(1);
        return;
      }
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        setRadiusScale(Math.min(1, Math.max(0, parsed)));
      }
    };

    readScale();

    const parent = el.parentElement;
    if (!parent || typeof MutationObserver === "undefined") return;

    const observer = new MutationObserver(readScale);
    observer.observe(parent, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  const currentActive = activeId !== undefined ? activeId : internalActive;
  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => item.id === currentActive)
  );
  const activeItem = NAV_ITEMS[activeIndex];
  const activeCenterX = START_X + activeIndex * STEP_X;
  const wellRadius = Number((30.5 * radiusScale).toFixed(2));
  const trailRadius = Number((34 * radiusScale).toFixed(2));
  const haloRadius = Number((40.5 * radiusScale).toFixed(2));
  const bridgeRadius = Number((9 * radiusScale).toFixed(2));
  const blurStdDev = Number((7.5 * (0.12 + 0.88 * radiusScale)).toFixed(2));
  const useGooeyFilter = radiusScale > 0.02;

  useEffect(() => {
    if (!autoPlay || activeId !== undefined || isPointerInside) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setInternalActive((prev) => {
        const idx = NAV_ITEMS.findIndex((item) => item.id === prev);
        const nextIdx = (idx + 1) % NAV_ITEMS.length;
        return NAV_ITEMS[nextIdx].id;
      });
    }, Math.max(1200, intervalMs));

    return () => window.clearInterval(timer);
  }, [autoPlay, intervalMs, activeId, isPointerInside, currentActive]);

  const handleSelect = (id: GooeyNavItemId) => {
    if (activeId === undefined) {
      setInternalActive(id);
    }
    onSelect?.(id);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Gooey navigation bar"
      onMouseEnter={() => {
        setIsPointerInside(true);
      }}
      onMouseLeave={() => {
        setIsPointerInside(false);
        setHoveredId(null);
      }}
      onFocusCapture={() => {
        setIsPointerInside(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsPointerInside(false);
          setHoveredId(null);
        }
      }}
      className={`relative inline-flex flex-col items-center select-none ${className}`}
    >
      {/* Main Gooey Metaball Dock */}
      <div
        className="relative"
        style={{ width: `${SVG_WIDTH}px`, height: `${SVG_HEIGHT}px` }}
      >
        {/* Organic Metaball Backing Layer */}
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          fill="none"
          aria-hidden="true"
          className="absolute inset-0 overflow-visible pointer-events-none"
        >
          <defs>
            <filter
              id={filterId}
              x="-20%"
              y="-35%"
              width="140%"
              height="170%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation={blurStdDev} result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8.5"
                result="goo"
              />
            </filter>
          </defs>

          <g style={{ filter: "drop-shadow(0 1px 4px rgba(0, 0, 0, 0.055))" }}>
            <g filter={useGooeyFilter ? `url(#${filterId})` : undefined}>
              {/* Continuous soft metaball bridge connecting the 4 circular wells */}
              <rect
                x={START_X}
                y={CENTER_Y - 9}
                width={STEP_X * (NAV_ITEMS.length - 1)}
                height={18}
                rx={bridgeRadius}
                ry={bridgeRadius}
                fill="#E6E9EC"
              />

              {/* Four base wells with subtle magnetic swell on hover */}
              {NAV_ITEMS.map((item, idx) => {
                const isItemHovered = hoveredId === item.id;
                const cx = START_X + idx * STEP_X;
                return (
                  <g key={item.id} transform={`translate(${cx}, ${CENTER_Y})`}>
                    <motion.rect
                      x={-30.5}
                      y={-30.5}
                      width={61}
                      height={61}
                      rx={wellRadius}
                      ry={wellRadius}
                      fill="#E6E9EC"
                      initial={false}
                      animate={{
                        scale: isItemHovered ? 1.07 : 1,
                      }}
                      transition={ICON_SPRING}
                    />
                  </g>
                );
              })}

              {/* Trailing liquid tail creating the elastic morph bridge */}
              <motion.g
                initial={false}
                animate={{ x: activeCenterX }}
                transition={TRAIL_SPRING}
              >
                <rect
                  x={-34}
                  y={CENTER_Y - 34}
                  width={68}
                  height={68}
                  rx={trailRadius}
                  ry={trailRadius}
                  fill="#E6E9EC"
                />
              </motion.g>

              {/* Active outer bulging metaball halo */}
              <motion.g
                initial={false}
                animate={{ x: activeCenterX }}
                transition={LEAD_SPRING}
              >
                <g transform={`translate(0, ${CENTER_Y})`}>
                  <motion.rect
                    x={-40.5}
                    y={-40.5}
                    width={81}
                    height={81}
                    rx={haloRadius}
                    ry={haloRadius}
                    fill="#E6E9EC"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </g>
              </motion.g>
            </g>
          </g>
        </svg>

        {/* Active Crisp White Inner Circle */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ x: activeCenterX - WHITE_CIRCLE_SIZE / 2 }}
          transition={LEAD_SPRING}
          style={{
            width: `${WHITE_CIRCLE_SIZE}px`,
            height: `${WHITE_CIRCLE_SIZE}px`,
            top: `${(SVG_HEIGHT - WHITE_CIRCLE_SIZE) / 2}px`,
          }}
          className="absolute left-0 pointer-events-none"
        >
          <motion.div
            animate={{ scale: [1, 1.022, 1] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.045)]"
          />
        </motion.div>

        {/* Interactive Tab Buttons */}
        {NAV_ITEMS.map((item, idx) => {
          const isActive = item.id === currentActive;
          const isHovered = hoveredId === item.id;
          const centerX = START_X + idx * STEP_X;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() =>
                setHoveredId((prev) => (prev === item.id ? null : prev))
              }
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              style={{
                left: `${centerX - 30}px`,
                top: `${CENTER_Y - 30}px`,
                width: "60px",
                height: "60px",
                color: isActive ? "#181816" : isHovered ? "#424340" : "#757573",
              }}
              className="absolute z-10 flex items-center justify-center rounded-full cursor-pointer bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-[#181816]/25 transition-colors duration-300"
            >
              {item.renderIcon(isActive, isHovered)}
            </button>
          );
        })}
      </div>

      {/* Centered Label Sliding Below Active Circle */}
      <div
        className="relative mt-[8px] h-[22px] overflow-visible pointer-events-none"
        style={{ width: `${SVG_WIDTH}px` }}
      >
        <motion.div
          initial={false}
          animate={{ x: activeCenterX }}
          transition={LEAD_SPRING}
          className="absolute left-0 top-0"
        >
          <div className="-translate-x-1/2 flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeItem.id}
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[15px] leading-[22px] tracking-[-0.01em] text-[#20201E] whitespace-nowrap"
              >
                {activeItem.label}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}

export default GooeyNav;
