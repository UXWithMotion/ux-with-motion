"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Figma iOS 100% Corner Smoothing (Squircle) Math ─────────────────────────

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

interface CornerParams {
  cornerRadius: number;
  cornerSmoothing: number;
  roundingAndSmoothingBudget: number;
}

function getPathParamsForCorner({
  cornerRadius,
  cornerSmoothing,
  roundingAndSmoothingBudget,
}: CornerParams) {
  let p = (1 + cornerSmoothing) * cornerRadius;
  const maxCornerSmoothing = roundingAndSmoothingBudget / cornerRadius - 1;
  cornerSmoothing = Math.min(cornerSmoothing, maxCornerSmoothing);
  p = Math.min(p, roundingAndSmoothingBudget);

  const arcMeasure = 90 * (1 - cornerSmoothing);
  const arcSectionLength =
    Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2));
  const angleBeta = 45 * cornerSmoothing;
  const c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));
  const b = (p - arcSectionLength - c - d) / 3;
  const a = 2 * b;

  return { a, b, c, d, p, arcSectionLength, cornerRadius };
}

export function getSquirclePath(
  width: number,
  height: number,
  cornerRadius = 20,
  cornerSmoothing = 1.0,
  inset = 0
) {
  const w = width - inset * 2;
  const h = height - inset * 2;
  const budget = Math.min(w, h) / 2;
  const r = Math.min(Math.max(cornerRadius - inset, 0), budget);
  const p = getPathParamsForCorner({
    cornerRadius: r,
    cornerSmoothing,
    roundingAndSmoothingBudget: budget,
  });

  const a = p.a.toFixed(3);
  const b = p.b.toFixed(3);
  const c = p.c.toFixed(3);
  const d = p.d.toFixed(3);
  const arc = p.arcSectionLength.toFixed(3);
  const apb = (p.a + p.b).toFixed(3);
  const apbpc = (p.a + p.b + p.c).toFixed(3);
  const bpc = (p.b + p.c).toFixed(3);

  const startX = (w - p.p + inset).toFixed(3);
  const startY = inset.toFixed(3);
  const rightX = (w + inset).toFixed(3);
  const bottomY = (h + inset).toFixed(3);
  const leftX = inset.toFixed(3);
  const bottomStartX = (h - p.p + inset).toFixed(3);
  const leftBottomX = (p.p + inset).toFixed(3);
  const leftTopY = (p.p + inset).toFixed(3);

  return (
    `M ${startX} ${startY} ` +
    `c ${a} 0 ${apb} 0 ${apbpc} ${d} ` +
    `a ${r} ${r} 0 0 1 ${arc} ${arc} ` +
    `c ${d} ${c} ${d} ${bpc} ${d} ${apbpc} ` +
    `L ${rightX} ${bottomStartX} ` +
    `c 0 ${a} 0 ${apb} -${d} ${apbpc} ` +
    `a ${r} ${r} 0 0 1 -${arc} ${arc} ` +
    `c -${c} ${d} -${bpc} ${d} -${apbpc} ${d} ` +
    `L ${leftBottomX} ${bottomY} ` +
    `c -${a} 0 -${apb} 0 -${apbpc} -${d} ` +
    `a ${r} ${r} 0 0 1 -${arc} -${arc} ` +
    `c -${d} -${c} -${d} -${bpc} -${d} -${apbpc} ` +
    `L ${leftX} ${leftTopY} ` +
    `c 0 -${a} 0 -${apb} ${d} -${apbpc} ` +
    `a ${r} ${r} 0 0 1 ${arc} -${arc} ` +
    `c ${c} -${d} ${bpc} -${d} ${apbpc} -${d} ` +
    `Z`
  );
}

// ─── Exact Vector Icons from Figma (Node 1920:6315) ──────────────────────────

/** PDF Document Icon (Matching Figma FileTypeIcon) */
function PdfDocIcon({ className = "size-[40px]" }: { className?: string }) {
  return (
    <div className={`overflow-hidden relative shrink-0 select-none flex items-center justify-center ${className}`}>
      <svg
        width="32"
        height="40"
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[32px] h-[40px] shrink-0"
      >
        {/* Main Document Body */}
        <path
          d="M5.69462 0H20L32 12V34.7926C32 37.6712 29.5088 40 26.4403 40H5.57031C2.49114 40 0 37.6712 0 34.7926V5.20738C0 2.32883 2.61539 0 5.69462 0Z"
          fill="#D92D20"
        />
        {/* Top-Right Folded Corner */}
        <path
          d="M20.0257 8.16V0L32 12H24.0171C20.4248 12 19.8594 9.44 20.0257 8.16Z"
          fill="white"
          fillOpacity="0.3"
        />
        {/* Centered PDF Label */}
        <text
          x="16"
          y="31"
          textAnchor="middle"
          fill="white"
          fontSize="9"
          fontWeight="bold"
          fontFamily="Inter, -apple-system, sans-serif"
          letterSpacing="0.05em"
        >
          PDF
        </text>
      </svg>
    </div>
  );
}

/** 3-Vertical-Dots Icon (Menu / More_Vertical) */
function MoreVerticalIcon({ className = "size-[20px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="5" r="1.25" fill="#050505" />
      <circle cx="10" cy="10" r="1.25" fill="#050505" />
      <circle cx="10" cy="15" r="1.25" fill="#050505" />
    </svg>
  );
}

/** Linear Trash Icon (Hicon / Linear / Delete 2) */
function DeleteIcon({ className = "size-[20px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.16667 7.08333C4.2441 7.89833 4.38463 8.90816 4.569 10.2329L4.78761 11.8038C5.02521 13.511 5.14401 14.3647 5.3959 15.0503C5.86694 16.3323 6.68118 17.2873 7.65304 17.6974C8.17274 17.9167 8.78183 17.9167 10 17.9167C11.2182 17.9167 11.8273 17.9167 12.347 17.6974C13.3188 17.2873 14.1331 16.3323 14.6041 15.0503C14.856 14.3647 14.9748 13.511 15.2124 11.8038L15.431 10.2329C15.6153 8.90815 15.756 7.39833 15.8333 7.08333M16.6667 5.41667H3.33333M8.33333 14.5833V7.91667M11.6667 14.5833V7.91667M13.3333 5.41667V4.58333C13.3333 2.74238 11.841 1.25 10 1.25C8.15905 1.25 6.66667 2.74238 6.66667 4.58333V5.41667H13.3333Z"
        stroke="#2D264B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Linear Download Icon (Hicon / Linear / Download) */
function DownloadIcon({ className = "size-[20px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.667 8.33333C17.1901 9.02971 17.5 9.89532 17.5 10.8333V11.6667C17.5 12.4409 17.5 12.828 17.4487 13.1518C17.1663 14.9347 15.768 16.333 13.9852 16.6154C13.6613 16.6667 13.2742 16.6667 12.5 16.6667H7.50001C6.72584 16.6667 6.33875 16.6667 6.01487 16.6154C4.23198 16.333 2.83369 14.9347 2.55131 13.1518C2.50001 12.828 2.50001 12.4409 2.50001 11.6667V10.8333C2.50001 9.89532 2.80997 9.02971 3.33304 8.33333M10 1.66667V12.5V13.3333M6.66668 10L7.83155 11.4692C8.76051 12.6408 9.22499 13.2266 9.79112 13.3168C9.86048 13.3278 9.93024 13.3333 10 13.3333M13.3333 10L12.1685 11.4692C11.2395 12.6408 10.775 13.2266 10.2089 13.3168C10.1396 13.3278 10.0698 13.3333 10 13.3333"
        stroke="#2D264B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Checkmark Icon (Interface / Check) */
function CheckIcon({ className = "size-[20px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 10.5L8 15L16.5 5.5"
        stroke="#050505"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Close / Cancel Icon (Menu / Close_MD) */
function CloseIcon({ className = "size-[20px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 15L10 10M10 10L5 5M10 10L15 5M10 10L5 15"
        stroke="#050505"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface PdfActionCardProps {
  className?: string;
  property1?: "Frame 1" | "Frame 2" | "Frame 3" | "Frame 4";
  fileName?: string;
  fileSize?: string;
  dateAdded?: string;
  onDelete?: () => void;
  onDownload?: () => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PdfActionCard({
  className = "",
  property1 = "Frame 1",
  fileName = "sample.pdf",
  fileSize = "202.5 KB",
  dateAdded = "added: 03 June, 2026",
  onDelete,
  onDownload,
}: PdfActionCardProps) {
  // Internal interactive state mirroring Figma variants
  const [currentFrame, setCurrentFrame] = useState<"Frame 1" | "Frame 2" | "Frame 3" | "Frame 4">(
    property1
  );
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Sync state if property1 changes externally (e.g. from Figma schema selector in admin)
  useEffect(() => {
    setCurrentFrame(property1);
  }, [property1]);

  const isFrame1 = currentFrame === "Frame 1";
  const isFrame2 = currentFrame === "Frame 2";
  const isFrame3 = currentFrame === "Frame 3";
  const isFrame4 = currentFrame === "Frame 4";

  const [containerWidth, setContainerWidth] = useState(420);
  const containerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver for dynamic iOS squircle corner smoothing
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth || 420);
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute Figma iOS 100% Corner Smoothing Squircle Paths
  const outerSquirclePath = useMemo(() => {
    return getSquirclePath(containerWidth, 68, 20, 1.0, 0);
  }, [containerWidth]);

  const innerFullWidth = Math.max(containerWidth - 4, 300);

  // Gentle morph transition configuration
  const springTransition = {
    type: "spring" as const,
    stiffness: 320,
    damping: 28,
    mass: 0.8,
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadSuccess(true);
    onDownload?.();
    setTimeout(() => setDownloadSuccess(false), 1500);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFrame("Frame 3");
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFrame("Frame 4");
    onDelete?.();
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFrame("Frame 2");
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFrame("Frame 1");
  };

  return (
    <div className={`relative flex items-center justify-center p-3 select-none ${className}`}>
      {/* 
        Outer Container: 420px wide, 68px tall, 20px rounded border radius.
        Uses Figma iOS 100% Corner Smoothing (Squircle) via clip-path.
        Always maintains solid 420px width without layout collapse.
      */}
      <motion.div
        ref={containerRef}
        transition={springTransition}
        animate={{
          backgroundColor: isFrame3 ? "#FFD8D8" : "#EEF1F4",
        }}
        style={{
          clipPath: `path('${outerSquirclePath}')`,
        }}
        className="relative w-[420px] max-w-full h-[68px] rounded-[20px] p-[2px] overflow-hidden flex items-center shrink-0"
      >
        {/* 
          Revealed Action Buttons Track (rendered underneath on the right):
          - Frame 2: Trash (Delete) and Download icons in #EEF1F4 track
          - Frame 3: Check (Confirm) and Close (Cancel) icons in #FFD8D8 track
        */}
        <div className="absolute right-[2px] top-[2px] bottom-[2px] w-[119px] flex items-center justify-center pr-[14px] pl-[6px] z-0">
          <AnimatePresence mode="wait" initial={false}>
            {isFrame2 && (
              <motion.div
                key="frame2-actions"
                initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                transition={springTransition}
                className="flex items-center gap-[10px]"
              >
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="p-[8px] rounded-[8px] cursor-pointer hover:bg-black/5 active:scale-90 transition-all flex items-center justify-center shrink-0 text-[#2D264B]"
                  title="Delete file"
                  aria-label="Delete file"
                >
                  <DeleteIcon className="size-[20px]" />
                </button>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadClick}
                  className={`p-[8px] rounded-[8px] cursor-pointer hover:bg-black/5 active:scale-90 transition-all flex items-center justify-center shrink-0 ${
                    downloadSuccess ? "text-green-600 scale-105" : "text-[#2D264B]"
                  }`}
                  title={downloadSuccess ? "Downloaded!" : "Download file"}
                  aria-label="Download file"
                >
                  <DownloadIcon className="size-[20px]" />
                </button>
              </motion.div>
            )}

            {isFrame3 && (
              <motion.div
                key="frame3-actions"
                initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                transition={springTransition}
                className="flex items-center gap-[10px]"
              >
                {/* Confirm Delete Checkmark */}
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="p-[8px] rounded-[8px] cursor-pointer hover:bg-black/10 active:scale-90 transition-all flex items-center justify-center shrink-0 text-[#050505]"
                  title="Confirm delete"
                  aria-label="Confirm delete"
                >
                  <CheckIcon className="size-[20px]" />
                </button>

                {/* Cancel Delete Close */}
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="p-[8px] rounded-[8px] cursor-pointer hover:bg-black/10 active:scale-90 transition-all flex items-center justify-center shrink-0 text-[#050505]"
                  title="Cancel"
                  aria-label="Cancel delete"
                >
                  <CloseIcon className="size-[20px]" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 
          Main Sliding Card Panel:
          - Frame 1: Full width (416px, white)
          - Frame 2 & 3: Retracts smoothly to 299px, revealing action buttons on the right
          - Frame 4: Expands to full width (416px), background morphs to #FFD8D8, displaying centered confirmation
        */}
        <motion.div
          transition={springTransition}
          initial={false}
          animate={{
            width: isFrame2 || isFrame3 ? 299 : innerFullWidth,
            backgroundColor: isFrame4 ? "#FFD8D8" : "#FFFFFF",
            boxShadow: isFrame4 ? "none" : "0 1px 3px rgba(0,0,0,0.03)",
          }}
          className="h-full rounded-[20px] flex items-center shrink-0 overflow-hidden relative z-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isFrame4 ? (
              /* Frame 4: Deleted Confirmation Banner - Exactly matching Figma Node 1920:6323 */
              <motion.div
                key="frame4-deleted"
                initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={handleReset}
                className="w-full h-full flex flex-col items-center justify-center select-none px-4 cursor-pointer"
              >
                <p className="font-sans font-medium text-[16px] leading-[1.2] text-[#D92D20] whitespace-nowrap text-center">
                  {fileName} is deleted
                </p>
                <p className="font-sans font-medium text-[12px] leading-[1.2] text-[#FF8F8F] whitespace-nowrap text-center mt-[3px]">
                  {fileSize}
                </p>
              </motion.div>
            ) : (
              /* Frame 1, 2, 3: File details, PDF badge, morphing title and 3-dots button */
              <motion.div
                key="file-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full flex items-center justify-between py-[12px] px-[16px]"
              >
                {/* Left Content Area: PDF Icon + Details */}
                <div className="flex items-center gap-[8px] min-w-[245px] shrink-0">
                  <PdfDocIcon className="size-[40px]" />

                  {/* Title & Metadata with Gentle Blur-Morph */}
                  <div className="w-[191px] flex flex-col gap-[3px] items-start shrink-0 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      {isFrame3 ? (
                        <motion.div
                          key="confirm-title"
                          initial={{ opacity: 0, y: 3, filter: "blur(3px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -3, filter: "blur(3px)" }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="w-full flex flex-col gap-[3px]"
                        >
                          <p className="font-sans font-medium text-[16px] leading-[1.2] text-[#000000] w-full truncate">
                            Delete PDF ?
                          </p>
                          <p className="font-sans font-medium text-[12px] leading-[1.2] text-[#CBCED1] whitespace-nowrap truncate">
                            {fileName}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default-title"
                          initial={{ opacity: 0, y: 3, filter: "blur(3px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -3, filter: "blur(3px)" }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="w-full flex flex-col gap-[3px]"
                        >
                          <p className="font-sans font-medium text-[16px] leading-[1.2] text-[#000000] w-full truncate">
                            {fileName}
                          </p>
                          <div className="flex items-center gap-[5px] w-full">
                            <p className="font-sans font-medium text-[12px] leading-[1.2] text-[#CBCED1] whitespace-nowrap">
                              {dateAdded}
                            </p>
                            <div className="size-[3px] rounded-full bg-[#CBCED1] shrink-0" />
                            <p className="font-sans font-medium text-[12px] leading-[1.2] text-[#CBCED1] whitespace-nowrap">
                              {fileSize}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 3-Dots Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFrame1) setCurrentFrame("Frame 2");
                    else if (isFrame2) setCurrentFrame("Frame 1");
                    else if (isFrame3) setCurrentFrame("Frame 2");
                  }}
                  className="p-[8px] rounded-[8px] cursor-pointer flex items-center justify-center shrink-0 hover:bg-black/5 active:scale-90 transition-all text-[#050505]"
                  title={isFrame1 ? "Show actions" : "Hide actions"}
                  aria-label="More options"
                >
                  <MoreVerticalIcon className="size-[20px]" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default PdfActionCard;
