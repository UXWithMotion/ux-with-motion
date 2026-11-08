"use client";

import React, { useState } from "react";
import { useBuilder } from "../BuilderContext";
import { Code, LayoutTemplate, Box, ChevronDown, ChevronRight, Info } from "lucide-react";
import Editor from "@monaco-editor/react";
import { LivePreviewIframe } from "../../preview/LivePreviewIframe";
import { componentRegistry } from "@/lib/registry/components";

// ─── Code Format Suggestion Panels ──────────────────────────────────────────

function ReactFormatGuide() {
  const [open, setOpen] = useState(false);
  const example = `"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
// ✅ Allowed: framer-motion, lucide-react, tailwindcss

export default function MyButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-black text-white px-6 py-3
        rounded-full font-medium text-sm
        hover:bg-gray-800 transition-colors"
    >
      Click me
    </motion.button>
  );
}`;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden text-left">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-800 hover:bg-blue-100 transition-colors"
      >
        <Info className="w-4 h-4 shrink-0 text-blue-500" />
        <span className="flex-1 text-left">Code format guide — React / Next.js</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-blue-200 pt-3 flex flex-col gap-3">
          <p className="text-xs text-blue-700 font-medium">Paste a self-contained React component following this template:</p>

          <pre className="text-[11.5px] bg-[#1e1e1e] text-[#d4d4d4] rounded-lg p-4 overflow-x-auto whitespace-pre leading-relaxed font-mono">
            {example}
          </pre>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-blue-800 mb-0.5">Rules:</p>
            {[
              ["✅", "Start with", '"use client";'],
              ["✅", "Export as", "export default function ComponentName()"],
              ["✅", "Allowed imports:", "framer-motion, lucide-react, react"],
              ["✅", "Style with", "Tailwind CSS classes"],
              ["❌", "No external API calls or", "fetch / axios"],
              ["❌", "No imports from other local files", ""],
              ["❌", "No", "next/image, next/link, next/router"],
              ["❌", "No", "useEffect calling external endpoints"],
            ].map(([icon, label, code], i) => (
              <p key={i} className="text-xs text-blue-700">
                {icon} {label}{" "}
                {code && <code className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono">{code}</code>}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HtmlCssFormatGuide() {
  const [open, setOpen] = useState(false);
  const htmlExample = `<button class="my-btn">
  Click me
</button>`;
  const cssExample = `.my-btn {
  background: #000;
  color: #fff;
  padding: 12px 28px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: sans-serif;
  transition: background 0.2s, transform 0.1s;
}

.my-btn:hover {
  background: #333;
  transform: scale(1.03);
}

.my-btn:active {
  transform: scale(0.97);
}`;

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden text-left">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-green-800 hover:bg-green-100 transition-colors"
      >
        <Info className="w-4 h-4 shrink-0 text-green-500" />
        <span className="flex-1 text-left">Code format guide — HTML / CSS</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-green-200 pt-3 flex flex-col gap-3">
          <p className="text-xs text-green-700 font-medium">Two separate tabs: HTML body content + CSS styles.</p>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-green-800">HTML tab:</p>
            <pre className="text-[11.5px] bg-[#1e1e1e] text-[#d4d4d4] rounded-lg p-4 overflow-x-auto whitespace-pre leading-relaxed font-mono">
              {htmlExample}
            </pre>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-green-800">CSS tab:</p>
            <pre className="text-[11.5px] bg-[#1e1e1e] text-[#d4d4d4] rounded-lg p-4 overflow-x-auto whitespace-pre leading-relaxed font-mono">
              {cssExample}
            </pre>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-green-800 mb-0.5">Rules:</p>
            {[
              ["✅", "HTML tab:", "body content only — no <html>, <head>, <body> tags"],
              ["✅", "CSS tab:", "all styles using class selectors"],
              ["✅", "CSS animations and transitions are allowed"],
              ["❌", "No <style> tags in HTML", "— put all CSS in the CSS tab"],
              ["❌", "No external CDN links", "(Google Fonts, Bootstrap, etc.)"],
            ].map(([icon, label, desc], i) => (
              <p key={i} className="text-xs text-green-700">
                {icon} <span className="font-medium">{label}</span>{desc ? ` ${desc}` : ""}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Step Component ─────────────────────────────────────────────────────

const MONACO_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
  fontLigatures: true,
  wordWrap: "on" as const,
  scrollBeyondLastLine: false,
  padding: { top: 14, bottom: 14 },
  tabSize: 2,
  lineNumbers: "on" as const,
  renderLineHighlight: "gutter" as const,
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
  quickSuggestions: true,
  formatOnPaste: true,
  automaticLayout: true,
};

export function UploadCodeStep() {
  const { state, updateState } = useBuilder();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"react" | "html" | "css">("react");
  const [isRegistryIdDirty, setIsRegistryIdDirty] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (!isRegistryIdDirty) {
      const generatedId = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      updateState({ title: newTitle, registry_id: generatedId });
    } else {
      updateState({ title: newTitle });
    }
  };

  const handleRegistryIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRegistryIdDirty(true);
    updateState({ registry_id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") });
  };

  const handleSnippetChange = (type: "react" | "html" | "css", value: string | undefined) => {
    updateState({ snippets: { ...state.snippets, [type]: value || "" } });
  };

  const editorLanguage = activeTab === "react" ? "typescript" : activeTab === "css" ? "css" : "html";

  const hasCode =
    state.source_type === "react"
      ? !!state.snippets.react?.trim()
      : state.source_type === "html_css"
      ? !!(state.snippets.html?.trim() || state.snippets.css?.trim())
      : !!(state.snippets.react?.trim() || state.snippets.html?.trim() || state.snippets.css?.trim());

  const previewKey = `${state.snippets.react}||${state.snippets.html}||${state.snippets.css}`;

  return (
    <div className="flex-1 flex gap-6 p-6 overflow-hidden h-full">

      {/* ── LEFT: Config + Code Editor ── */}
      <div className="flex-1 max-w-[520px] bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl overflow-y-auto flex flex-col gap-5 p-6">


        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-[#454545] mb-1">Component Details</h2>
          <p className="text-sm text-[#7D7F82]">Define info and paste your source code.</p>
        </div>

        {/* Basic Info */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#454545] mb-1.5">Component Name *</label>
            <input
              type="text"
              value={state.title}
              onChange={handleTitleChange}
              placeholder="e.g., Delete Button"
              className="w-full h-10 px-3 rounded-lg border border-[#DEE1E4] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#454545] mb-1.5">Description</label>
            <textarea
              value={state.description}
              onChange={(e) => updateState({ description: e.target.value })}
              placeholder="Briefly describe what this component does..."
              className="w-full h-20 p-3 rounded-lg border border-[#DEE1E4] focus:border-[#111111] outline-none text-sm resize-none"
            />
          </div>
        </div>

        {/* Source Type */}
        <div className="pt-4 border-t border-[#DEE1E4]">
          <label className="block text-sm font-medium text-[#454545] mb-3">Source Type</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "react", label: "React / Next.js", icon: Box, tab: "react" },
              { key: "html_css", label: "HTML / CSS", icon: LayoutTemplate, tab: "html" },
              { key: "both", label: "Both", icon: Code, tab: "react" },
            ].map(({ key, label, icon: Icon, tab }) => (
              <button
                key={key}
                onClick={() => { updateState({ source_type: key as any }); setActiveTab(tab as any); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  state.source_type === key ? "border-[#111111] bg-[#fafafa]" : "border-[#DEE1E4] hover:border-[#d0d0d0]"
                }`}
              >
                <Icon className={`w-6 h-6 ${state.source_type === key ? "text-[#454545]" : "text-[#7D7F82]"}`} />
                <span className={`text-xs font-medium text-center ${state.source_type === key ? "text-[#454545]" : "text-[#7D7F82]"}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Format Guides */}
        <div className="flex flex-col gap-2">
          {(state.source_type === "react" || state.source_type === "both") && <ReactFormatGuide />}
          {(state.source_type === "html_css" || state.source_type === "both") && <HtmlCssFormatGuide />}
        </div>

        {/* Code Editor — Monaco (VS Code) */}
        <div className="pt-4 border-t border-[#DEE1E4] flex flex-col gap-2">
          <label className="block text-sm font-medium text-[#454545]">Source Code</label>

          {/* Tab pills */}
          <div className="flex gap-1">
            {(state.source_type === "react" || state.source_type === "both") && (
              <button
                onClick={() => setActiveTab("react")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "react" ? "bg-[#111111] text-white" : "bg-[#f4f4f5] text-[#7D7F82] hover:bg-[#e4e4e7]"
                }`}
              >
                React
              </button>
            )}
            {(state.source_type === "html_css" || state.source_type === "both") && (
              <>
                <button
                  onClick={() => setActiveTab("html")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === "html" ? "bg-[#111111] text-white" : "bg-[#f4f4f5] text-[#7D7F82] hover:bg-[#e4e4e7]"
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setActiveTab("css")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === "css" ? "bg-[#111111] text-white" : "bg-[#f4f4f5] text-[#7D7F82] hover:bg-[#e4e4e7]"
                  }`}
                >
                  CSS
                </button>
              </>
            )}
          </div>

          {/* Monaco Editor — VS Code dark theme */}
          <div className="rounded-xl overflow-hidden" style={{ height: 300, border: "1px solid #3c3c3c" }}>
            <Editor
              height={300}
              language={editorLanguage}
              theme="vs-dark"
              value={state.snippets[activeTab] || ""}
              onChange={(value) => handleSnippetChange(activeTab, value)}
              beforeMount={(monaco) => {
                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: true,
                  noSyntaxValidation: false,
                });
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                  target: monaco.languages.typescript.ScriptTarget.ES2020,
                  allowNonTsExtensions: true,
                  jsx: monaco.languages.typescript.JsxEmit.React,
                  allowJs: true,
                });
              }}
              options={MONACO_OPTIONS}
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="pt-4 border-t border-[#DEE1E4]">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-[#7D7F82] hover:text-[#454545] transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            Advanced Settings
          </button>
          {showAdvanced && (
            <div className="mt-4 p-4 rounded-xl bg-[#F7F9FB] border border-[#DEE1E4]">
              <label className="block text-sm font-medium text-[#454545] mb-1.5">Registry ID</label>
              <p className="text-xs text-[#7D7F82] mb-3">Unique technical ID used in the codebase registry.</p>
              <input
                type="text"
                value={state.registry_id}
                onChange={handleRegistryIdChange}
                placeholder="e.g., my-component"
                className="w-full h-10 px-3 rounded-lg border border-[#DEE1E4] font-mono text-sm focus:border-[#111111] outline-none bg-[#FBFCFD]"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Live Preview ── */}
      <div className="flex-1 bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl p-6 flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#454545] mb-1">Live Preview</h2>
          <p className="text-sm text-[#7D7F82]">Updates as you paste code.</p>
        </div>

        <div className="flex-1 bg-[#F9F9F9] rounded-xl border border-[#DEE1E4] overflow-auto relative">
          {(() => {
            const RegistryComponent = componentRegistry[state.registry_id]?.component;
            
            if (RegistryComponent && (state.source_type === "react" || state.source_type === "both")) {
              return (
                <div className="w-full min-h-full flex items-center justify-center p-8 bg-[#FBFCFD] relative">
                  <div className="absolute top-3 right-3 bg-[#F7F9FB] border border-[#DEE1E4] text-[#7D7F82] text-[10px] px-2 py-1 rounded-md font-mono uppercase tracking-widest shadow-sm">Registry Render</div>
                  <RegistryComponent />
                </div>
              );
            }

            return hasCode ? (
              <LivePreviewIframe 
                key={previewKey}
                sourceType={state.source_type}
                snippets={state.snippets}
                className="w-full h-full border-none"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
                <div className="w-12 h-12 bg-[#FBFCFD] border border-[#DEE1E4] rounded-xl flex items-center justify-center shadow-sm">
                  <Code className="w-5 h-5 text-[#7D7F82]" />
                </div>
                <p className="text-sm font-medium text-[#454545]">No code yet</p>
                <p className="text-xs text-[#7D7F82] max-w-[200px]">
                  Paste your code in the editor on the left to see a live preview here.
                </p>
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}

