"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, Copy } from "lucide-react";

export function FigmaLogo({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="184 312 656 656"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M312 840C312 784.772 356.772 740 412 740H512V840C512 895.228 467.228 940 412 940C356.772 940 312 895.228 312 840Z" fill="#24CB71"/>
      <path d="M512 340V540H612C667.228 540 712 495.228 712 440C712 384.772 667.228 340 612 340H512Z" fill="#FF7237"/>
      <circle cx="611.167" cy="640" r="100" fill="#00B6FF"/>
      <path d="M312 440C312 495.228 356.772 540 412 540H512V340H412C356.772 340 312 384.772 312 440Z" fill="#FF3737"/>
      <path d="M312 640C312 695.228 356.772 740 412 740H512V540H412C356.772 540 312 584.772 312 640Z" fill="#874FFF"/>
    </svg>
  );
}

export interface CopyToFigmaButtonProps {
  slug: string;
  componentTitle?: string;
  variant?: "pill-row" | "compact";
  className?: string;
}

export function CopyToFigmaButton({
  slug,
  componentTitle = "UX With Motion Component",
  variant = "pill-row",
  className = "",
}: CopyToFigmaButtonProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availability, setAvailability] = useState<{ slug: string; available: boolean } | null>(null);
  const cachedSlugRef = useRef<string | null>(null);
  const cachedHtmlRef = useRef<string | null>(null);

  const isAvailable = availability?.slug === slug ? availability.available : null;

  // Prefetch clipboard payload on mount or hover
  const prefetchPayload = async (): Promise<string | null> => {
    if (cachedSlugRef.current === slug && cachedHtmlRef.current) {
      setAvailability({ slug, available: true });
      return cachedHtmlRef.current;
    }
    try {
      const res = await fetch(`/api/components/${slug}/figma`);
      if (res.ok) {
        const html = await res.text();
        if (html && (html.includes("data-buffer") || html.includes("<!--(figma)"))) {
          cachedSlugRef.current = slug;
          cachedHtmlRef.current = html;
          setAvailability({ slug, available: true });
          return html;
        }
      }
      cachedSlugRef.current = slug;
      cachedHtmlRef.current = null;
      setAvailability({ slug, available: false });
      return null;
    } catch {
      setAvailability({ slug, available: false });
      return null;
    }
  };

  useEffect(() => {
    let active = true;
    fetch(`/api/components/${slug}/figma`)
      .then(async (res) => {
        if (!active) return;
        if (res.ok) {
          const html = await res.text();
          if (active && html && (html.includes("data-buffer") || html.includes("<!--(figma)"))) {
            cachedSlugRef.current = slug;
            cachedHtmlRef.current = html;
            setAvailability({ slug, available: true });
            return;
          }
        }
        if (active) {
          cachedSlugRef.current = slug;
          cachedHtmlRef.current = null;
          setAvailability({ slug, available: false });
        }
      })
      .catch(() => {
        if (active) {
          setAvailability({ slug, available: false });
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const handleCopyToFigma = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      let payload = cachedHtmlRef.current;
      if (!payload) {
        payload = await prefetchPayload();
      }

      if (!payload) {
        alert("Figma clipboard data is being generated for this component. Try again in a moment.");
        setIsLoading(false);
        return;
      }

      const plainText = componentTitle;

      // Modern Clipboard API with text/html
      if (typeof window !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined") {
        const htmlBlob = new Blob([payload], { type: "text/html" });
        const textBlob = new Blob([plainText], { type: "text/plain" });

        const item = new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        });

        await navigator.clipboard.write([item]);
      } else {
        // Fallback for browsers with restricted async clipboard
        const copyListener = (event: ClipboardEvent) => {
          event.clipboardData?.setData("text/html", payload!);
          event.clipboardData?.setData("text/plain", plainText);
          event.preventDefault();
        };
        document.addEventListener("copy", copyListener);
        document.execCommand("copy");
        document.removeEventListener("copy", copyListener);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Direct clipboard write failed, trying execCommand fallback:", err);
      try {
        const copyListener = (event: ClipboardEvent) => {
          if (cachedHtmlRef.current) {
            event.clipboardData?.setData("text/html", cachedHtmlRef.current);
            event.clipboardData?.setData("text/plain", componentTitle);
            event.preventDefault();
          }
        };
        document.addEventListener("copy", copyListener);
        document.execCommand("copy");
        document.removeEventListener("copy", copyListener);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (fallbackErr) {
        console.error("Clipboard copy completely failed:", fallbackErr);
        alert("Unable to copy to clipboard. Please grant clipboard permissions.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If we definitively know this component doesn't have a figma payload, we can disable or dim it
  const isDisabled = isAvailable === false;

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleCopyToFigma}
        onMouseEnter={prefetchPayload}
        disabled={isDisabled || isLoading}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-sans font-medium transition-all cursor-pointer ${
          copied
            ? "bg-green-50 text-green-700 border border-green-200"
            : isDisabled
            ? "opacity-50 cursor-not-allowed bg-[#EEF1F4] text-[#7D7F82]"
            : "bg-white hover:bg-[#F7F9FB] text-[#3D3D3D] hover:text-black border border-[#CBCED1] shadow-2xs active:scale-[0.98]"
        } ${className}`}
        title={isDisabled ? "Figma asset coming soon" : "Copy directly to Figma (⌘V)"}
      >
        <FigmaLogo size={14} />
        <span>{copied ? "Copied! Paste in Figma (⌘V)" : "Copy to Figma"}</span>
      </button>
    );
  }

  // Default: Pill Row style matching Figma Frame 2443:8571 ("Input Field - 6")
  return (
    <button
      type="button"
      onClick={handleCopyToFigma}
      onMouseEnter={prefetchPayload}
      disabled={isDisabled || isLoading}
      className={`w-full h-[54px] sm:h-[60px] rounded-[53px] border border-[#CBCED1] px-5 sm:px-[24px] flex items-center justify-between transition-all cursor-pointer group shadow-2xs ${
        copied
          ? "bg-green-50/40 border-green-300"
          : isDisabled
          ? "opacity-50 cursor-not-allowed bg-[#FBFBFC]"
          : "bg-white hover:bg-[#F7F9FB] active:scale-[0.99]"
      } ${className}`}
      title={isDisabled ? "Figma component coming soon" : "Copy Figma component (⌘V)"}
    >
      <span className="font-sans font-medium text-[16px] sm:text-[17.28px] text-[#3D3D3D]">
        Figma component
      </span>

      <div className="flex items-center gap-[10px]">
        <span className="font-sans font-medium text-[16px] sm:text-[17.28px] text-[#B0B0B0]">|</span>
        {copied ? (
          <span className="flex items-center gap-1.5 text-green-600 text-[13px] sm:text-[14px] font-medium animate-fadeIn">
            <Check size={16} className="text-green-600" />
            Copied
          </span>
        ) : isDisabled ? (
          <span className="text-[#A0A2A5] text-[13px] font-sans">Coming soon</span>
        ) : (
          <Copy size={16} className="text-[#3D3D3D] group-hover:text-black transition-colors" />
        )}
      </div>
    </button>
  );
}
