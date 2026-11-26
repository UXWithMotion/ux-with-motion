"use client";

import React, { useState, useId } from "react";
import { motion } from "framer-motion";

export type LiquidNavItemId = "new-chat" | "media" | "plugins" | "explore";

export interface LiquidNavMenuProps {
  /** Initially selected menu item ID (default: "new-chat") */
  defaultActive?: LiquidNavItemId;
  /** Controlled active item ID */
  activeId?: LiquidNavItemId;
  /** Callback fired when an item is selected */
  onSelect?: (id: LiquidNavItemId) => void;
  /** Optional extra CSS classes */
  className?: string;
}

/**
 * New chat icon extracted directly from Figma node 2595:7829.
 * Micro-interaction: pencil path gently tilts and writes when hovered.
 */
function NewChatIcon({ isHovered }: { isHovered: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="overflow-visible"
    >
      <path
        d="M8.16675 2.50128C8.53391 2.50128 8.83161 2.79921 8.83179 3.16632C8.83179 3.53359 8.53402 3.83136 8.16675 3.83136H5.83374C4.72836 3.83136 3.83197 4.72798 3.83179 5.83331V14.1663C3.83179 15.2718 4.72825 16.1683 5.83374 16.1683H14.1667C15.2722 16.1683 16.1687 15.2718 16.1687 14.1663V11.8333C16.1689 11.4662 16.4666 11.1683 16.8337 11.1683C17.2007 11.1684 17.4986 11.4663 17.4988 11.8333V14.1663C17.4988 16.0063 16.0068 17.4983 14.1667 17.4983H5.83374C3.99371 17.4983 2.50171 16.0063 2.50171 14.1663V5.83331C2.50189 3.99344 3.99382 2.50128 5.83374 2.50128H8.16675Z"
        fill="#1F2123"
      />
      <motion.path
        d="M13.4266 3.10381C14.3858 2.15908 15.9277 2.16466 16.8797 3.11651C17.834 4.07106 17.8373 5.61827 16.8866 6.57647L11.7245 11.7786C11.3006 12.2058 10.7623 12.5027 10.1747 12.6321L7.78789 13.1565C7.20666 13.2842 6.68895 12.766 6.81719 12.1849L7.34258 9.80498C7.47299 9.21426 7.77202 8.67391 8.20293 8.24932L13.4266 3.10381ZM15.9393 4.05694C15.5039 3.62172 14.7989 3.61907 14.3602 4.05108L9.13652 9.19659C8.88866 9.44077 8.71649 9.75138 8.64141 10.0911L8.28984 11.6849L9.88848 11.3333C10.2266 11.2588 10.5363 11.0878 10.7801 10.8421L15.9422 5.63897C16.377 5.20075 16.3757 4.49352 15.9393 4.05694Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#1F2123"
        style={{ transformOrigin: "8px 12px" }}
        animate={
          isHovered
            ? {
                rotate: [0, -10, 6, 0],
                x: [0, 0.8, -0.3, 0],
                y: [0, -1, 0.2, 0],
              }
            : { rotate: 0, x: 0, y: 0 }
        }
        transition={{ duration: 0.45, ease: "easeInOut" }}
      />
    </svg>
  );
}

/**
 * Media icon extracted directly from Figma node 2595:7835 (visible child layer 2595:7839).
 * Micro-interaction: sun lifts gently and mountain ridge rises softly inside the frame on hover.
 */
function MediaIcon({ isHovered }: { isHovered: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M19.3875 8.54999V15.45C19.3875 16.8997 18.2123 18.075 16.7625 18.075H7.23755C5.7878 18.075 4.61255 16.8997 4.61255 15.45V8.54999C4.61255 7.10024 5.7878 5.92499 7.23755 5.92499H16.7625C18.2123 5.92499 19.3875 7.10024 19.3875 8.54999Z"
        strokeWidth="1.35"
        stroke="#111112"
      />
      <motion.path
        d="M5.02502 16.2937C5.02502 16.2937 8.1184 13.1386 8.1469 13.1108C8.91565 12.3608 9.72655 12.3608 10.4484 13.1108C10.4859 13.1483 11.6813 14.3812 11.6813 14.3812"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#111112"
        animate={isHovered ? { y: [0, -0.7, 0] } : { y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      />
      <motion.path
        d="M10.9125 13.2562C10.9125 13.2562 13.8615 10.3273 13.95 10.2375C14.5594 9.61871 15.3187 9.63746 15.975 10.2937C16.0487 10.3674 19.1554 13.5259 19.1554 13.5259"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#111112"
        animate={isHovered ? { y: [0, -0.9, 0] } : { y: 0 }}
        transition={{ duration: 0.45, delay: 0.04, ease: "easeOut" }}
      />
      <motion.path
        d="M7.78093 8.11871C8.3401 8.11871 8.79343 8.57204 8.79343 9.13121C8.79343 9.69038 8.3401 10.1437 7.78093 10.1437C7.22176 10.1437 6.76843 9.69038 6.76843 9.13121C6.76843 8.57204 7.22176 8.11871 7.78093 8.11871Z"
        fill="#111112"
        style={{ transformOrigin: "7.8px 9.1px" }}
        animate={
          isHovered
            ? { y: [0, -1.1, 0], scale: [1, 1.2, 1] }
            : { y: 0, scale: 1 }
        }
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
    </svg>
  );
}

/**
 * Plugins icon extracted directly from Figma node 2595:7861.
 * Micro-interaction: gentle plug twist/snap rotation on hover.
 */
function PluginsIcon({ isHovered }: { isHovered: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ transformOrigin: "10px 10px" }}
      animate={
        isHovered
          ? { rotate: [0, -14, 6, 0], scale: [1, 1.07, 1] }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      <path
        d="M10.3123 1.85547C15.2771 1.85547 18.391 5.73725 18.0809 10.1797C17.9647 11.8429 17.0564 13.0834 15.8231 13.5879C14.7326 14.0337 13.47 13.8674 12.4461 13.0293C11.7934 13.5786 11.0359 13.9386 10.2449 14.0049C9.32652 14.0816 8.42804 13.757 7.70197 13.0029L7.66389 12.9639C7.642 12.9408 7.61006 12.9054 7.57014 12.8633C7.49037 12.7791 7.3782 12.6616 7.24982 12.5264C6.99227 12.2551 6.66818 11.9143 6.40217 11.6367L6.34357 11.5684C6.06899 11.2168 6.099 10.707 6.42756 10.3906L6.63459 10.1904L5.89533 9.4209C5.64063 9.15629 5.64831 8.73517 5.91291 8.48047C6.17753 8.22606 6.59874 8.23452 6.85334 8.49902L7.59357 9.26758L9.38557 7.54297L8.64533 6.77344C8.39063 6.50883 8.39831 6.08771 8.66291 5.83301C8.92752 5.57835 9.34866 5.58697 9.60334 5.85156L10.3436 6.62012L10.5604 6.41309C10.9126 6.07453 11.4734 6.08657 11.8104 6.44043L13.1072 7.80371C13.8503 8.56878 14.1444 9.47864 14.0252 10.3955C13.9486 10.9833 13.7041 11.5416 13.3485 12.0479C13.9958 12.5468 14.7208 12.6019 15.3192 12.3574C16.0315 12.0661 16.6687 11.3039 16.7537 10.0869C17.0141 6.35655 14.4499 3.18555 10.3123 3.18555C6.6529 3.18579 3.49073 5.98227 3.24494 9.50195C2.97008 13.4404 5.75621 16.7634 9.99787 16.7637C11.4792 16.7637 12.9444 16.412 13.9949 15.668C14.2945 15.4561 14.7094 15.527 14.9217 15.8262C15.134 16.1259 15.0632 16.5416 14.7635 16.7539C13.4191 17.7061 11.6557 18.0938 9.99787 18.0938C4.9396 18.0934 1.5924 14.0706 1.91779 9.40918C2.21615 5.13666 6.01184 1.85571 10.3123 1.85547ZM7.67072 11.04C7.8573 11.2357 8.04954 11.4365 8.21369 11.6094C8.34275 11.7453 8.45587 11.8647 8.53596 11.9492C8.57591 11.9914 8.60776 12.0257 8.62971 12.0488L8.66389 12.084C9.12159 12.5574 9.62959 12.7208 10.1336 12.6787C10.6588 12.6348 11.2424 12.3601 11.785 11.8379C12.3336 11.3098 12.6385 10.7414 12.7059 10.2246C12.77 9.7323 12.6301 9.21889 12.1502 8.72656L12.1444 8.7207L11.1571 7.68457L7.67072 11.04Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#1F2123"
      />
    </motion.svg>
  );
}

/**
 * Explore icon extracted directly from Figma node 2595:7868.
 * Micro-interaction: 4 circles subtly bloom outward in a soft stagger on hover.
 */
function ExploreIcon({ isHovered }: { isHovered: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="overflow-visible"
    >
      <motion.path
        d="M7.87695 5.83301C7.87678 4.70466 6.9614 3.79004 5.83301 3.79004C4.70476 3.79021 3.79021 4.70476 3.79004 5.83301C3.79004 6.9614 4.70466 7.87678 5.83301 7.87695C6.96151 7.87695 7.87695 6.96151 7.87695 5.83301ZM9.20703 5.83301C9.20703 7.69605 7.69605 9.20703 5.83301 9.20703C3.97012 9.20686 2.45996 7.69594 2.45996 5.83301C2.46014 3.97023 3.97023 2.46014 5.83301 2.45996C7.69594 2.45996 9.20686 3.97012 9.20703 5.83301Z"
        fill="#1F2123"
        style={{ transformOrigin: "5.83px 5.83px" }}
        animate={isHovered ? { x: [0, -0.7, 0], y: [0, -0.7, 0], scale: [1, 1.12, 1] } : { x: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      />
      <motion.path
        d="M7.87695 14.1639C7.87678 13.0356 6.9614 12.121 5.83301 12.121C4.70476 12.1211 3.79021 13.0357 3.79004 14.1639C3.79004 15.2923 4.70466 16.2077 5.83301 16.2079C6.96151 16.2079 7.87695 15.2924 7.87695 14.1639ZM9.20703 14.1639C9.20703 16.027 7.69605 17.538 5.83301 17.538C3.97012 17.5378 2.45996 16.0269 2.45996 14.1639C2.46014 12.3012 3.97023 10.7911 5.83301 10.7909C7.69594 10.7909 9.20686 12.301 9.20703 14.1639Z"
        fill="#1F2123"
        style={{ transformOrigin: "5.83px 14.16px" }}
        animate={isHovered ? { x: [0, -0.7, 0], y: [0, 0.7, 0], scale: [1, 1.12, 1] } : { x: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.42, delay: 0.04, ease: "easeOut" }}
      />
      <motion.path
        d="M16.2102 5.83301C16.21 4.70466 15.2947 3.79004 14.1663 3.79004C13.038 3.79021 12.1235 4.70476 12.1233 5.83301C12.1233 6.9614 13.0379 7.87678 14.1663 7.87695C15.2948 7.87695 16.2102 6.96151 16.2102 5.83301ZM17.5403 5.83301C17.5403 7.69605 16.0293 9.20703 14.1663 9.20703C12.3034 9.20686 10.7932 7.69594 10.7932 5.83301C10.7934 3.97023 12.3035 2.46014 14.1663 2.45996C16.0292 2.45996 17.5401 3.97012 17.5403 5.83301Z"
        fill="#1F2123"
        style={{ transformOrigin: "14.17px 5.83px" }}
        animate={isHovered ? { x: [0, 0.7, 0], y: [0, -0.7, 0], scale: [1, 1.12, 1] } : { x: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.42, delay: 0.04, ease: "easeOut" }}
      />
      <motion.path
        d="M16.2102 14.1639C16.21 13.0356 15.2947 12.121 14.1663 12.121C13.038 12.1211 12.1235 13.0357 12.1233 14.1639C12.1233 15.2923 13.0379 16.2077 14.1663 16.2079C15.2948 16.2079 16.2102 15.2924 16.2102 14.1639ZM17.5403 14.1639C17.5403 16.027 16.0293 17.538 14.1663 17.538C12.3034 17.5378 10.7932 16.0269 10.7932 14.1639C10.7934 12.3012 12.3035 10.7911 14.1663 10.7909C16.0292 10.7909 17.5401 12.301 17.5403 14.1639Z"
        fill="#1F2123"
        style={{ transformOrigin: "14.17px 14.16px" }}
        animate={isHovered ? { x: [0, 0.7, 0], y: [0, 0.7, 0], scale: [1, 1.12, 1] } : { x: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.42, delay: 0.08, ease: "easeOut" }}
      />
    </svg>
  );
}

interface NavItemConfig {
  id: LiquidNavItemId;
  label: string;
  height: number;
  pxClass: string;
  radiusClass: string;
  textColorClass: string;
  iconBoxClass: string;
  renderIcon: (isHovered: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "new-chat",
    label: "New chat",
    height: 44,
    pxClass: "px-[8px]",
    radiusClass: "rounded-[8px]",
    textColorClass: "text-[#1F2123]",
    iconBoxClass: "size-[20px]",
    renderIcon: (isHovered) => <NewChatIcon isHovered={isHovered} />,
  },
  {
    id: "media",
    label: "Media",
    height: 48,
    pxClass: "px-[8px]",
    radiusClass: "rounded-[12px]",
    textColorClass: "text-[#111112]",
    iconBoxClass: "size-[24px]",
    renderIcon: (isHovered) => <MediaIcon isHovered={isHovered} />,
  },
  {
    id: "plugins",
    label: "Plugins",
    height: 44,
    pxClass: "px-[10px]",
    radiusClass: "rounded-[8px]",
    textColorClass: "text-[#1F2123]",
    iconBoxClass: "size-[20px]",
    renderIcon: (isHovered) => <PluginsIcon isHovered={isHovered} />,
  },
  {
    id: "explore",
    label: "Explore",
    height: 44,
    pxClass: "px-[10px]",
    radiusClass: "rounded-[8px]",
    textColorClass: "text-[#1F2123]",
    iconBoxClass: "size-[20px]",
    renderIcon: (isHovered) => <ExploreIcon isHovered={isHovered} />,
  },
];

// Gentle, soft liquid spring for the shifting background indicator
const LIQUID_SPRING = {
  type: "spring" as const,
  stiffness: 190,
  damping: 25,
  mass: 0.95,
};

export function LiquidNavMenu({
  defaultActive = "new-chat",
  activeId,
  onSelect,
  className = "",
}: LiquidNavMenuProps) {
  const [internalActive, setInternalActive] = useState<LiquidNavItemId>(defaultActive);
  const [hoveredId, setHoveredId] = useState<LiquidNavItemId | null>(null);
  const instanceId = useId();
  const currentActive = activeId !== undefined ? activeId : internalActive;

  const handleSelect = (id: LiquidNavItemId) => {
    if (activeId === undefined) {
      setInternalActive(id);
    }
    onSelect?.(id);
  };

  return (
    <nav
      aria-label="Sidebar navigation menu"
      className={`relative bg-white flex flex-col gap-px items-start p-[8px] rounded-[8px] w-[260px] h-[199px] select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] ${className}`}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = currentActive === item.id;
        const isHovered = hoveredId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === item.id ? null : prev))}
            onFocus={() => setHoveredId(item.id)}
            onBlur={() => setHoveredId((prev) => (prev === item.id ? null : prev))}
            aria-current={isActive ? "page" : undefined}
            style={{ height: `${item.height}px` }}
            className={`relative w-full shrink-0 flex items-center py-[12px] ${item.pxClass} ${item.radiusClass} cursor-pointer bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-[#1F2123]/25`}
          >
            {/* Shifting liquid background pill (244px × 44px, centered cleanly without transform conflict) */}
            {isActive && (
              <motion.div
                layoutId={`liquid-nav-bg-${instanceId}`}
                transition={LIQUID_SPRING}
                aria-hidden="true"
                className={`absolute inset-x-0 h-[44px] bg-[#E8E8E8] rounded-[8px] pointer-events-none ${
                  item.height === 48 ? "top-[2px]" : "top-0"
                }`}
              />
            )}

            {/* Icon + Label row */}
            <motion.div
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.14 }}
              className="relative z-10 flex flex-1 items-center gap-[6px] min-w-px"
            >
              <motion.span
                animate={{
                  scale: isActive ? 1.04 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                }}
                className={`relative shrink-0 flex items-center justify-center ${item.iconBoxClass}`}
              >
                {item.renderIcon(isHovered)}
              </motion.span>
              <span
                className={`font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[20px] tracking-[-0.1504px] whitespace-nowrap transition-opacity duration-200 ${item.textColorClass} ${
                  isActive || isHovered ? "opacity-100" : "opacity-90"
                }`}
              >
                {item.label}
              </span>
            </motion.div>
          </button>
        );
      })}
    </nav>
  );
}

export default LiquidNavMenu;
