"use client";

import React, { useState } from "react";
import { useBuilder } from "../BuilderContext";
import { BookOpen, Search, ExternalLink, Globe, Layers, Plus, Trash2 } from "lucide-react";
import { ComponentDependency, ComponentPropDoc } from "@/lib/registry/types";

export function DocsAndSeoStep() {
  const { state, updateState } = useBuilder();
  const [activeSubTab, setActiveSubTab] = useState<"docs" | "seo">("docs");

  const docs = state.docs || {};
  const seo = state.seo || {};

  const updateDocs = (field: string, value: any) => {
    updateState({
      docs: {
        ...docs,
        [field]: value,
      },
    });
  };

  const updateSeo = (field: string, value: any) => {
    updateState({
      seo: {
        ...seo,
        [field]: value,
      },
    });
  };

  const proposedUrl = `https://www.uxwithmotion.com/components/${state.registry_id || "my-component"}`;
  const effectiveSeoTitle = seo.seoTitle?.trim() || `${state.title || "Component"} — Animated UI Component | UX With Motion`;
  const effectiveSeoDesc =
    seo.metaDescription?.trim() ||
    state.description ||
    `Interactive ${state.title || "component"} with motion physics and accessible states for React and Tailwind CSS.`;

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden h-full">
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DEE1E4]">
        <div>
          <h2 className="text-xl font-bold text-[#1F2123]">Documentation & SEO</h2>
          <p className="text-sm text-[#7D7F82]">Define technical guides, examples, accessibility notes, and search metadata.</p>
        </div>

        <div className="flex rounded-xl border border-[#DEE1E4] p-1 bg-white">
          <button
            type="button"
            onClick={() => setActiveSubTab("docs")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === "docs" ? "bg-[#1F2123] text-white shadow-xs" : "text-[#7D7F82] hover:text-[#1F2123]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Documentation
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("seo")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === "seo" ? "bg-[#1F2123] text-white shadow-xs" : "text-[#7D7F82] hover:text-[#1F2123]"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            SEO & Search Preview
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-6">
        {activeSubTab === "docs" ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {/* Overview */}
            <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
              <label className="text-sm font-semibold text-[#1F2123]">Technical Overview</label>
              <p className="text-xs text-[#7D7F82]">Comprehensive explanation of architecture, behavior, and design intent.</p>
              <textarea
                value={docs.overview || ""}
                onChange={(e) => updateDocs("overview", e.target.value)}
                placeholder="The Smooth Time Picker combines smooth spring dial physics with an accessible popover trigger..."
                className="w-full h-28 p-3 rounded-xl border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none resize-none bg-white font-sans"
              />
            </div>

            {/* Use Cases */}
            <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
              <label className="text-sm font-semibold text-[#1F2123]">Recommended Use Cases</label>
              <p className="text-xs text-[#7D7F82]">List practical use cases (separated by newline).</p>
              <textarea
                value={(docs.useCases || []).join("\n")}
                onChange={(e) =>
                  updateDocs(
                    "useCases",
                    e.target.value.split("\n").filter((line) => line.trim().length > 0)
                  )
                }
                placeholder={"Meeting scheduling interfaces\nFlight and travel booking forms\nAlarm and timer configurations"}
                className="w-full h-24 p-3 rounded-xl border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none font-sans bg-white"
              />
            </div>

            {/* Dependencies & Setup Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
                <label className="text-sm font-semibold text-[#1F2123]">Dependencies</label>
                <p className="text-xs text-[#7D7F82]">Package names (comma-separated).</p>
                <input
                  type="text"
                  value={(docs.dependencies || []).map((d) => d.name).join(", ")}
                  onChange={(e) => {
                    const deps: ComponentDependency[] = e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((name) => ({ name }));
                    updateDocs("dependencies", deps);
                  }}
                  placeholder="framer-motion, lucide-react"
                  className="w-full h-10 px-3 rounded-xl border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none bg-white font-mono"
                />
              </div>

              <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
                <label className="text-sm font-semibold text-[#1F2123]">Setup Command / Instructions</label>
                <p className="text-xs text-[#7D7F82]">Installation command or setup note.</p>
                <input
                  type="text"
                  value={docs.setupInstructions || ""}
                  onChange={(e) => updateDocs("setupInstructions", e.target.value)}
                  placeholder="npm install framer-motion lucide-react"
                  className="w-full h-10 px-3 rounded-xl border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none bg-white font-mono"
                />
              </div>
            </div>

            {/* Working Usage Example */}
            <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
              <label className="text-sm font-semibold text-[#1F2123]">Working Usage Example</label>
              <p className="text-xs text-[#7D7F82]">Production example snippet (e.g. Booking form with state).</p>
              <textarea
                value={docs.usageExample || ""}
                onChange={(e) => updateDocs("usageExample", e.target.value)}
                placeholder={`import { SmoothTimePicker } from "@/components/inputs/SmoothTimePicker";\n\nexport function AppointmentBooking() {\n  return <SmoothTimePicker placeholder="Select Slot" />;\n}`}
                className="w-full h-40 p-3.5 rounded-xl border border-[#DEE1E4] text-xs font-mono focus:border-[#1F2123] outline-none bg-[#1e1e1e] text-[#d4d4d4]"
              />
            </div>

            {/* Accessibility Notes */}
            <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
              <label className="text-sm font-semibold text-[#1F2123]">Accessibility Notes</label>
              <p className="text-xs text-[#7D7F82]">Document keyboard navigation, ARIA roles, and screen-reader support.</p>
              <textarea
                value={docs.accessibilityNotes || ""}
                onChange={(e) => updateDocs("accessibilityNotes", e.target.value)}
                placeholder="Full keyboard navigation with Tab and Enter keys. ARIA-expanded indicator on trigger button. Reduced motion respected for all rotational dials."
                className="w-full h-24 p-3 rounded-xl border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none bg-white font-sans"
              />
            </div>

            {/* Related Components */}
            <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
              <label className="text-sm font-semibold text-[#1F2123]">Related Components</label>
              <p className="text-xs text-[#7D7F82]">Slugs (comma-separated).</p>
              <input
                type="text"
                value={(docs.relatedComponents || []).map((r) => r.slug).join(", ")}
                onChange={(e) => {
                  const rels = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((slug) => ({
                      slug,
                      name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                    }));
                  updateDocs("relatedComponents", rels);
                }}
                placeholder="date-picker, smooth-slider"
                className="w-full h-10 px-3 rounded-xl border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none bg-white font-mono"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {/* Google Search Preview */}
            <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#7D7F82]" />
                <h3 className="text-sm font-bold text-[#1F2123]">Google Search Result Preview</h3>
              </div>

              <div className="p-5 rounded-xl border border-[#DEE1E4] bg-white shadow-xs flex flex-col gap-1.5">
                <span className="text-xs text-[#4d5156] font-mono truncate">{proposedUrl}</span>
                <span className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                  {effectiveSeoTitle}
                </span>
                <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">{effectiveSeoDesc}</p>
              </div>
            </div>

            {/* SEO Title */}
            <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
              <label className="text-sm font-semibold text-[#1F2123]">Custom SEO Title</label>
              <p className="text-xs text-[#7D7F82]">Leave empty to use automatic brand-compliant title.</p>
              <input
                type="text"
                value={seo.seoTitle || ""}
                onChange={(e) => updateSeo("seoTitle", e.target.value)}
                placeholder={`${state.title || "Component"} — Animated UI Component | UX With Motion`}
                className="w-full h-11 px-3.5 rounded-xl border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none bg-white"
              />
            </div>

            {/* Meta Description */}
            <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
              <label className="text-sm font-semibold text-[#1F2123]">Custom Meta Description</label>
              <p className="text-xs text-[#7D7F82]">Succinct description for search engines and social cards (140-160 chars recommended).</p>
              <textarea
                value={seo.metaDescription || ""}
                onChange={(e) => updateSeo("metaDescription", e.target.value)}
                placeholder={effectiveSeoDesc}
                className="w-full h-24 p-3.5 rounded-xl border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none resize-none bg-white"
              />
            </div>

            {/* Share Image URL */}
            <div className="p-6 rounded-2xl border border-[#DEE1E4] bg-[#FBFCFD] flex flex-col gap-3 shadow-2xs">
              <label className="text-sm font-semibold text-[#1F2123]">Social Share Image URL (Open Graph)</label>
              <p className="text-xs text-[#7D7F82]">Optional custom OG banner URL. Defaults to standard UX With Motion card.</p>
              <input
                type="text"
                value={seo.shareImage || ""}
                onChange={(e) => updateSeo("shareImage", e.target.value)}
                placeholder="https://www.uxwithmotion.com/og/time-picker.png"
                className="w-full h-11 px-3.5 rounded-xl border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
