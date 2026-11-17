"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clipboard, FileCheck, ExternalLink, Save, Play } from "lucide-react";
import { getAdminComponents } from "@/lib/admin/components/queries";
import { FigmaLogo } from "@/components/ui/CopyToFigmaButton";

const FIGMA_NODE_MAP: Record<string, string> = {
  "smooth-time-picker": "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=2249-1408",
  "smooth-date-picker": "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=2249-1407",
  "four-item-tabs": "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=1508-5258",
  "motion-toggle": "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=1516-11016",
};

export default function FigmaCaptureAdminPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("smooth-time-picker");
  const [pastedHtml, setPastedHtml] = useState<string>("");
  const [detectedInfo, setDetectedInfo] = useState<{
    hasMeta: boolean;
    hasBuffer: boolean;
    sizeKb: number;
    previewText?: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedFiles, setSavedFiles] = useState<Record<string, boolean>>({});
  const [testedCopy, setTestedCopy] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const comps = await getAdminComponents();
        setComponents(comps || []);
        if (comps && comps.length > 0) {
          const first = comps.find((c: any) => c.registry_id === "smooth-time-picker") || comps[0];
          setSelectedSlug(first.registry_id || first.id);
        }

        // Check which components already have figma-data saved
        const statusMap: Record<string, boolean> = {};
        for (const comp of comps || []) {
          const slug = comp.registry_id || comp.id;
          try {
            const res = await fetch(`/api/components/${slug}/figma`);
            statusMap[slug] = res.ok;
          } catch {
            statusMap[slug] = false;
          }
        }
        setSavedFiles(statusMap);
      } catch (err) {
        console.error("Failed to load components:", err);
      }
    }
    load();
  }, []);

  // Listen to paste events anywhere on the page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const html = e.clipboardData?.getData("text/html");
      const plain = e.clipboardData?.getData("text/plain");

      if (html && (html.includes("data-buffer") || html.includes("data-metadata") || html.includes("figma"))) {
        e.preventDefault();
        processPastedHtml(html, plain);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const processPastedHtml = (html: string, plainText?: string) => {
    setPastedHtml(html);
    const hasMeta = html.includes("<!--(figmeta)") || html.includes("data-metadata");
    const hasBuffer = html.includes("<!--(figma)") || html.includes("data-buffer");
    const sizeKb = Math.round((html.length / 1024) * 10) / 10;

    setDetectedInfo({
      hasMeta,
      hasBuffer,
      sizeKb,
      previewText: plainText || "Figma Component",
    });
    setSaveStatus("");
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    processPastedHtml(val);
  };

  const handleSave = async () => {
    if (!pastedHtml || !selectedSlug) return;
    setIsSaving(true);
    setSaveStatus("");

    try {
      const res = await fetch(`/api/components/${selectedSlug}/figma`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlPayload: pastedHtml }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveStatus(`Saved successfully to public/figma-data/${selectedSlug}.html (${data.size} bytes)`);
        setSavedFiles((prev) => ({ ...prev, [selectedSlug]: true }));
      } else {
        setSaveStatus(`Error: ${data.error || "Failed to save"}`);
      }
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestCopy = async () => {
    try {
      const res = await fetch(`/api/components/${selectedSlug}/figma`);
      if (!res.ok) {
        alert("No saved payload found for this component.");
        return;
      }
      const html = await res.text();
      const htmlBlob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([selectedSlug], { type: "text/plain" });

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

  const figmaDirectUrl = FIGMA_NODE_MAP[selectedSlug] || "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion";

  return (
    <div className="flex flex-col flex-1 w-full bg-[#FAFAFA] min-h-screen text-[#1F2123]">
      {/* Top Bar */}
      <header className="h-[70px] border-b border-[#DEE1E4] px-8 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/components"
            className="p-2 text-[#7D7F82] hover:text-[#1F2123] rounded-full hover:bg-black/5 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2.5">
            <FigmaLogo size={22} />
            <h1 className="font-sans font-bold text-lg text-[#1F2123]">
              Figma Clipboard Payload Manager
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={figmaDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#DEE1E4] text-sm font-medium hover:bg-[#F7F9FB] transition-colors"
          >
            <span>Open in Figma</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-[900px] w-full mx-auto p-8 flex flex-col gap-8">
        {/* Step Guide Banner */}
        <div className="bg-white border border-[#DEE1E4] rounded-[24px] p-6 shadow-xs flex flex-col gap-3">
          <h2 className="font-sans font-bold text-base text-[#1F2123] flex items-center gap-2">
            <Clipboard size={18} className="text-[#1F2123]" />
            How to Capture & Store Native Figma Payloads
          </h2>
          <ol className="list-decimal list-inside text-sm text-[#555] space-y-1.5 leading-relaxed">
            <li>Select your target component from the dropdown below.</li>
            <li>Click <strong>Open in Figma ↗</strong> to view the node, select the component frame, and press <strong>Cmd + C</strong> (Mac) or <strong>Ctrl + C</strong> (Win).</li>
            <li>Return to this page and press <strong>Cmd + V</strong>.</li>
            <li>Click <strong>Save Payload</strong> to write the payload to <code className="bg-[#EEF1F4] px-1.5 py-0.5 rounded text-xs">/public/figma-data/[slug].html</code>.</li>
            <li>Users on <code className="bg-[#EEF1F4] px-1.5 py-0.5 rounded text-xs">uxwithmotion.com</code> can now click <strong>Copy to Figma</strong> and paste the fully editable vector component into Figma!</li>
          </ol>
        </div>

        {/* Component Selector */}
        <div className="bg-white border border-[#DEE1E4] rounded-[24px] p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="font-sans font-semibold text-sm text-[#1F2123]">
              1. Select Target Component
            </label>
            {savedFiles[selectedSlug] && (
              <button
                type="button"
                onClick={handleTestCopy}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1F2123] hover:text-black underline cursor-pointer"
              >
                {testedCopy ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <Check size={14} /> Copied to system clipboard! Paste in Figma (⌘V)
                  </span>
                ) : (
                  <>
                    <Play size={12} /> Test Copy Saved Payload
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="flex-1 h-[48px] px-4 rounded-[12px] border border-[#DEE1E4] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              {components.map((comp) => {
                const slug = comp.registry_id || comp.id;
                const hasPayload = savedFiles[slug];
                return (
                  <option key={comp.id} value={slug}>
                    {comp.title} ({slug}) {hasPayload ? "✓ Figma Ready" : "— Missing Payload"}
                  </option>
                );
              })}
            </select>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                savedFiles[selectedSlug]
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {savedFiles[selectedSlug] ? "✓ Active on Site" : "Missing Payload"}
            </span>
          </div>
        </div>

        {/* Paste Area */}
        <div className="bg-white border border-[#DEE1E4] rounded-[24px] p-6 shadow-xs flex flex-col gap-4">
          <label className="font-sans font-semibold text-sm text-[#1F2123]">
            2. Paste Figma Clipboard Content (Cmd+V)
          </label>

          <div
            tabIndex={0}
            className={`border-2 border-dashed rounded-[16px] p-8 text-center transition-all cursor-pointer outline-none ${
              detectedInfo?.hasBuffer
                ? "border-green-400 bg-green-50/30"
                : "border-[#CBCED1] hover:border-black bg-[#FBFCFD]"
            }`}
          >
            {detectedInfo?.hasBuffer ? (
              <div className="flex flex-col items-center gap-2">
                <FileCheck size={36} className="text-green-600" />
                <p className="font-sans font-semibold text-sm text-green-800">
                  Valid Figma Clipboard Payload Detected!
                </p>
                <p className="text-xs text-[#555]">
                  Size: {detectedInfo.sizeKb} KB | Contains data-metadata & data-buffer
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#7D7F82]">
                <Clipboard size={36} />
                <p className="font-sans font-medium text-sm text-[#1F2123]">
                  Press Cmd+V or paste your copied Figma frame here
                </p>
                <p className="text-xs">
                  Ensure you copied directly inside Figma (Cmd+C on the frame)
                </p>
              </div>
            )}
          </div>

          <textarea
            value={pastedHtml}
            onChange={handleManualInput}
            placeholder="Or inspect / edit raw HTML string here: <meta charset='utf-8'><span data-metadata=..."
            rows={4}
            className="w-full p-3 font-mono text-xs rounded-[12px] border border-[#DEE1E4] bg-[#F7F9FB] focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!detectedInfo?.hasBuffer || isSaving}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-medium text-sm transition-all cursor-pointer ${
                detectedInfo?.hasBuffer && !isSaving
                  ? "bg-[#1F2123] hover:bg-black text-white active:scale-[0.98]"
                  : "bg-[#EEF1F4] text-[#A0A2A5] cursor-not-allowed"
              }`}
            >
              <Save size={16} />
              <span>{isSaving ? "Saving..." : "Save Payload"}</span>
            </button>

            {saveStatus && (
              <span
                className={`text-sm font-medium ${
                  saveStatus.startsWith("Saved") ? "text-green-600" : "text-red-600"
                }`}
              >
                {saveStatus}
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
