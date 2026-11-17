"use client";

import React, { useState, useEffect } from "react";
import { Check, Clipboard, FileCheck, ExternalLink, Play, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { FigmaLogo } from "@/components/ui/CopyToFigmaButton";

interface FigmaPayloadCardProps {
  registryId: string;
  title: string;
  value?: string;
  onChange: (value: string) => void;
  figmaLink?: string;
}

const FIGMA_NODE_MAP: Record<string, string> = {
  "smooth-time-picker": "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=2249-1408",
  "smooth-date-picker": "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=2249-1407",
  "four-item-tabs": "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=1508-5258",
  "motion-toggle": "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=1516-11016",
};

export function FigmaPayloadCard({
  registryId,
  title,
  value = "",
  onChange,
  figmaLink,
}: FigmaPayloadCardProps) {
  const [testedCopy, setTestedCopy] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // If local value is empty, try loading existing saved file from /api/components/[slug]/figma
  useEffect(() => {
    if (!value && registryId) {
      let isMounted = true;
      fetch(`/api/components/${registryId}/figma`)
        .then((res) => (res.ok ? res.text() : null))
        .then((html) => {
          if (isMounted && html && html.includes("data-buffer")) {
            onChange(html);
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, [registryId, value, onChange]);

  // Global paste handler: if user copies inside Figma and presses Cmd+V anywhere on this step
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing text into normal inputs unless it's Figma html
      const html = e.clipboardData?.getData("text/html");
      if (html && (html.includes("data-buffer") || html.includes("data-metadata") || html.includes("<!--(figma)"))) {
        e.preventDefault();
        e.stopPropagation();
        processPayload(html);
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [registryId, onChange]);

  const processPayload = async (html: string) => {
    onChange(html);
    const size = Math.round((html.length / 1024) * 10) / 10;
    setSaveNotice(`✓ Captured ${size} KB Figma payload!`);

    // Auto-save to /public/figma-data/[slug].html via API if slug is present
    if (registryId) {
      try {
        const res = await fetch(`/api/components/${registryId}/figma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ htmlPayload: html }),
        });
        if (res.ok) {
          setSaveNotice(`✓ Saved & active on uxwithmotion.com (${size} KB)`);
          setTimeout(() => setSaveNotice(null), 5000);
        }
      } catch (err) {
        console.warn("Auto-save figma payload failed:", err);
      }
    }
  };

  const hasBuffer = Boolean(value && (value.includes("data-buffer") || value.includes("<!--(figma)")));
  const sizeKb = value ? Math.round((value.length / 1024) * 10) / 10 : 0;

  const handleTestCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!value) return;

    try {
      const htmlBlob = new Blob([value], { type: "text/html" });
      const textBlob = new Blob([title || registryId || "Figma Component"], { type: "text/plain" });

      const item = new ClipboardItem({
        "text/html": htmlBlob,
        "text/plain": textBlob,
      });

      await navigator.clipboard.write([item]);
      setTestedCopy(true);
      setTimeout(() => setTestedCopy(false), 2500);
    } catch (err) {
      alert("Failed to write to clipboard: " + err);
    }
  };

  const directFigmaUrl =
    figmaLink ||
    FIGMA_NODE_MAP[registryId] ||
    "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion";

  return (
    <div className="p-5 rounded-2xl border border-[#DEE1E4] bg-white flex flex-col gap-4 shadow-2xs">
      {/* Step Header matching Figma Clipboard Manager */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FigmaLogo size={20} />
          <h3 className="font-sans font-bold text-sm text-[#1F2123]">
            2. Paste Figma Clipboard Content (Cmd+V)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              hasBuffer
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            {hasBuffer ? `✓ Active on Site (${sizeKb} KB)` : "Missing Payload"}
          </span>

          <a
            href={directFigmaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#DEE1E4] text-xs font-medium hover:bg-[#F7F9FB] transition-colors text-[#1F2123]"
            title="Open node in Figma"
          >
            <span>Open in Figma</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <p className="text-xs text-[#7D7F82] leading-relaxed">
        Select the component frame in Figma, press <kbd className="font-mono bg-[#EEF1F4] px-1 py-0.5 rounded">Cmd + C</kbd>, then click below and press <kbd className="font-mono bg-[#EEF1F4] px-1 py-0.5 rounded">Cmd + V</kbd>.
      </p>

      {/* Paste Box Target matching /admin/figma-capture */}
      <div
        tabIndex={0}
        onPaste={(e) => {
          const html = e.clipboardData?.getData("text/html");
          if (html) {
            e.preventDefault();
            e.stopPropagation();
            processPayload(html);
          }
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer outline-none ${
          hasBuffer
            ? "border-green-400 bg-green-50/20"
            : "border-[#CBCED1] hover:border-black bg-[#FBFCFD]"
        }`}
      >
        {hasBuffer ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <FileCheck size={32} className="text-green-600 shrink-0" />
              <div>
                <p className="font-sans font-semibold text-sm text-green-800">
                  Valid Figma Clipboard Payload Detected!
                </p>
                <p className="text-xs text-[#555]">
                  Size: {sizeKb} KB | Contains data-metadata & data-buffer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTestCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#DEE1E4] hover:bg-[#F7F9FB] text-[#1F2123] transition-colors shadow-2xs cursor-pointer"
                title="Test copy to system clipboard"
              >
                {testedCopy ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <Check size={14} /> Copied! Paste in Figma (⌘V)
                  </span>
                ) : (
                  <>
                    <Play size={12} /> Test Copy Saved Payload
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onChange("")}
                className="p-2 text-[#7D7F82] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Remove payload"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3 text-[#7D7F82]">
            <Clipboard size={32} className="text-[#A0A2A5]" />
            <p className="font-sans font-medium text-sm text-[#1F2123]">
              Press Cmd+V or paste your copied Figma frame here
            </p>
            <p className="text-xs text-[#888]">
              Ensure you copied directly inside Figma (Cmd+C on the frame)
            </p>
          </div>
        )}
      </div>

      {saveNotice && (
        <div className="text-xs text-green-700 bg-green-50 border border-green-200 px-3.5 py-2 rounded-xl font-medium flex items-center gap-2">
          <Check size={14} className="text-green-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Collapsible Raw Inspector */}
      <div className="flex flex-col gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => setShowRawText(!showRawText)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#7D7F82] hover:text-[#1F2123] self-start cursor-pointer"
        >
          <span>{showRawText ? "Hide raw HTML payload" : "Or inspect / edit raw HTML string"}</span>
          {showRawText ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showRawText && (
          <textarea
            value={value}
            onChange={(e) => processPayload(e.target.value)}
            placeholder="<meta charset='utf-8'><span data-metadata=..."
            rows={3}
            className="w-full p-3 font-mono text-xs rounded-xl border border-[#DEE1E4] bg-[#F7F9FB] focus:outline-none focus:ring-1 focus:ring-black"
          />
        )}
      </div>
    </div>
  );
}
