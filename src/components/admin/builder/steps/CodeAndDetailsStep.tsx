"use client";

import React, { useState } from "react";
import { useBuilder } from "../BuilderContext";
import { Code, LayoutTemplate, Box, ChevronDown, Sparkles, AlertCircle } from "lucide-react";
import Editor from "@monaco-editor/react";
import { ComponentPreviewResolver } from "@/components/preview/ComponentPreviewResolver";

const CATEGORIES = [
  { id: "inputs", label: "Inputs & Pickers" },
  { id: "buttons", label: "Buttons & Actions" },
  { id: "cards", label: "Cards & Surfaces" },
  { id: "navigation", label: "Navigation" },
  { id: "feedback", label: "Feedback & Status" },
  { id: "micro-interactions", label: "Micro-interactions" },
];

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

export function CodeAndDetailsStep() {
  const { state, updateState } = useBuilder();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"react" | "html" | "css">("react");
  const [isRegistryIdManual, setIsRegistryIdManual] = useState(Boolean(state.id));
  const [editorError, setEditorError] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    // Keep published URL stable when display name changes if id exists or user manually edited slug
    if (!isRegistryIdManual && !state.id) {
      const generatedId = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updateState({ title: newTitle, registry_id: generatedId });
    } else {
      updateState({ title: newTitle });
    }
  };

  const handleRegistryIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRegistryIdManual(true);
    updateState({ registry_id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") });
  };

  const handleSnippetChange = (type: "react" | "html" | "css", value: string | undefined) => {
    updateState({ snippets: { ...state.snippets, [type]: value || "" } });
  };

  const editorLanguage = activeTab === "react" ? "typescript" : activeTab === "css" ? "css" : "html";

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden h-full">
      {/* ── LEFT: Workspace (Details + Editor) ── */}
      <div className="flex-1 lg:max-w-[560px] bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl overflow-y-auto flex flex-col gap-6 p-6 shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-[#1F2123]">Code & Details</h2>
            {state.hasUnsavedChanges && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-sm text-[#7D7F82]">Define basic component information and paste trusted source code.</p>
        </div>

        {/* Basic Info */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1F2123] mb-1.5">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={state.title}
              onChange={handleTitleChange}
              placeholder="e.g. Smooth Time Picker"
              className="w-full h-11 px-3.5 rounded-xl border border-[#DEE1E4] focus:border-[#1F2123] focus:ring-1 focus:ring-[#1F2123] outline-none text-sm transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2123] mb-1.5">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={state.description}
              onChange={(e) => updateState({ description: e.target.value })}
              placeholder="A high-performance interactive time picker with smooth dial transitions and accessibility..."
              className="w-full h-20 p-3.5 rounded-xl border border-[#DEE1E4] focus:border-[#1F2123] focus:ring-1 focus:ring-[#1F2123] outline-none text-sm resize-none transition-all bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1F2123] mb-1.5">Category</label>
              <select
                value={state.category || "inputs"}
                onChange={(e) => updateState({ category: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-[#DEE1E4] focus:border-[#1F2123] outline-none text-sm bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2123] mb-1.5">Source Type</label>
              <div className="flex rounded-xl border border-[#DEE1E4] p-1 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    updateState({ source_type: "react" });
                    setActiveTab("react");
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    state.source_type === "react" ? "bg-[#1F2123] text-white shadow-xs" : "text-[#7D7F82] hover:text-[#1F2123]"
                  }`}
                >
                  React
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateState({ source_type: "html_css" });
                    setActiveTab("html");
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    state.source_type === "html_css" ? "bg-[#1F2123] text-white shadow-xs" : "text-[#7D7F82] hover:text-[#1F2123]"
                  }`}
                >
                  HTML/CSS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Source Code Editor */}
        <div className="pt-4 border-t border-[#DEE1E4] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[#1F2123]">Source Code Editor</label>
            <div className="flex gap-1 bg-[#EEF1F4] p-1 rounded-lg">
              {(state.source_type === "react" || state.source_type === "both") && (
                <button
                  type="button"
                  onClick={() => setActiveTab("react")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === "react" ? "bg-white text-[#1F2123] shadow-xs" : "text-[#7D7F82] hover:text-[#1F2123]"
                  }`}
                >
                  React (.tsx)
                </button>
              )}
              {(state.source_type === "html_css" || state.source_type === "both") && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab("html")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      activeTab === "html" ? "bg-white text-[#1F2123] shadow-xs" : "text-[#7D7F82] hover:text-[#1F2123]"
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("css")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      activeTab === "css" ? "bg-white text-[#1F2123] shadow-xs" : "text-[#7D7F82] hover:text-[#1F2123]"
                    }`}
                  >
                    CSS
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#3c3c3c] bg-[#1e1e1e] relative min-h-[320px]">
            <Editor
              height={320}
              language={editorLanguage}
              theme="vs-dark"
              value={state.snippets[activeTab] || ""}
              onChange={(value) => handleSnippetChange(activeTab, value)}
              loading={<div className="p-8 text-center text-gray-400 text-sm">Loading code editor...</div>}
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
          {editorError && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {editorError}
            </p>
          )}
        </div>

        {/* Advanced Settings: Registry ID & Stable URL */}
        <div className="pt-4 border-t border-[#DEE1E4]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-semibold text-[#7D7F82] hover:text-[#1F2123] transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            Advanced Settings (Registry ID & URL)
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 rounded-xl bg-[#F7F9FB] border border-[#DEE1E4] flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#1F2123]">Registry ID / Slug</label>
              <input
                type="text"
                value={state.registry_id}
                onChange={handleRegistryIdChange}
                placeholder="e.g. smooth-time-picker"
                className="w-full h-10 px-3 rounded-lg border border-[#DEE1E4] font-mono text-xs focus:border-[#1F2123] outline-none bg-white"
              />
              <p className="text-[11px] text-[#7D7F82]">
                Canonical Public URL: <code className="text-[#1F2123] font-mono">/components/{state.registry_id || "..."}</code>
              </p>
              {state.id && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Note: Editing this value changes the public URL path. Keep it stable to prevent broken inbound links.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Preview Alongside ── */}
      <div className="flex-1 bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl p-6 flex flex-col shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2123]">Workspace Preview</h2>
            <p className="text-sm text-[#7D7F82]">Live rendering using the registered component renderer.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF1F4] text-[#1F2123] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#DB7100]" />
            <span>Active Renderer</span>
          </div>
        </div>

        <div className="flex-1 bg-[#F9F9F9] rounded-xl border border-[#DEE1E4] overflow-hidden relative">
          <ComponentPreviewResolver
            registryId={state.registry_id}
            sourceType={state.source_type}
            snippets={state.snippets}
            controlsValues={state.controls_values}
            publishedSource={state.publishedSource}
          />
        </div>
      </div>
    </div>
  );
}
