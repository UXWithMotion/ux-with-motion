"use client";

import React, { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Copy, Lock, Bookmark, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { componentRegistry } from "@/lib/registry/components";
import { LivePreviewIframe } from "@/components/admin/preview/LivePreviewIframe";
import { useCustomization } from "@/components/providers/CustomizationProvider";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type ComponentItem = {
  id: string;
  title: string;
  description?: string;
  status: string;
  registry_id: string;
  tags?: string[];
  snippets?: any;
  source_type?: string;
  schema_definition?: any[];
  access_tier?: "free" | "premium";
  is_locked?: boolean;
};

export interface ComponentModalPublicProps {
  component: ComponentItem;
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  isDetailPage?: boolean;
  allComponents?: ComponentItem[];
  savedIds?: string[];
  onToggleSave?: (id: string) => void;
  onSelectComponent?: (comp: ComponentItem) => void;
}

export function ComponentModalPublic({
  component,
  isOpen,
  onClose,
  isAuthenticated,
  isDetailPage = false,
  allComponents = [],
  savedIds = [],
  onToggleSave,
  onSelectComponent,
}: ComponentModalPublicProps) {
  const Heading = isDetailPage ? "h1" : "h2";
  const router = useRouter();
  const { getOverrides, setOverrides: updateGlobalOverrides, saveOverrides } = useCustomization();

  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState<string | false>(false);
  const [prevComponentId, setPrevComponentId] = useState(component.id);
  const [overrides, setOverrides] = useState<Record<string, string>>(() => getOverrides(component.id));

  const drawerContentRef = useRef<HTMLDivElement>(null);

  // Responsive mobile detection before first paint
  useIsomorphicLayoutEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset overrides when a new component is opened without triggering cascading effect renders
  if (component.id !== prevComponentId) {
    setPrevComponentId(component.id);
    setOverrides(getOverrides(component.id));
  }

  useEffect(() => {
    if (drawerContentRef.current) {
      drawerContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [component.id]);

  const handleClose = () => {
    saveOverrides(component.id, overrides);
    onClose();
  };

  const isSaved = savedIds.includes(component.id);
  const registryEntry = componentRegistry[component.registry_id];

  const schemaDefToUse = useMemo(() => {
    return component.schema_definition && component.schema_definition.length > 0
      ? component.schema_definition
      : registryEntry?.schema_definition || [];
  }, [component.schema_definition, registryEntry]);

  // Extract just the CSS variable overrides
  const activeOverrides = useMemo(() => {
    const active: Record<string, string> = {};
    schemaDefToUse.forEach((config: any) => {
      const val =
        overrides[config.variable] !== undefined
          ? overrides[config.variable]
          : config.defaultValue;
      if (config.variable) {
        active[config.variable] = val;
      }
    });
    return active;
  }, [schemaDefToUse, overrides]);

  const overrideStyleBlock = useMemo(() => {
    if (Object.keys(activeOverrides).length === 0) return "";
    return `\n\n<style>\n:root {\n${Object.entries(activeOverrides)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n")}\n}\n</style>`;
  }, [activeOverrides]);

  // User must be authenticated to view or copy source code during public beta
  const isLocked = isAuthenticated !== undefined ? !isAuthenticated : !!component.is_locked;

  // Fallback to registry if DB doesn't have snippets and it hasn't been locked
  const snippets = isLocked
    ? { html: "", css: "", nextjs: "" }
    : component.snippets || registryEntry?.snippets || { html: "", css: "", nextjs: "" };

  const handleSignInClick = () => {
    const slug = component.registry_id || component.id;
    let returnUrl = `/components/${encodeURIComponent(slug)}?tab=code`;
    if (typeof window !== "undefined") {
      const currentParams = new URLSearchParams(window.location.search);
      const search = currentParams.get("search");
      if (search) {
        returnUrl += `&search=${encodeURIComponent(search)}`;
      }
    }
    router.push(`/login?next=${encodeURIComponent(returnUrl)}`);
  };

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextjsSnippet = snippets.nextjs || snippets.react || "";

  // Filter other components for the "Other Components" section
  const otherComponentsList = useMemo(() => {
    if (!allComponents || allComponents.length === 0) return [];
    return allComponents.filter((c) => c.id !== component.id).slice(0, 4);
  }, [allComponents, component.id]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-[#1F2123]/30 backdrop-blur-sm cursor-pointer"
          />

          {isMobile ? (
            /* ═════════════════════════════════════════════════════════════════
               MOBILE BOTTOM DRAWER (Figma Node 2312:9368)
               Slides smoothly from bottom, drag-to-dismiss gesture supported
               ═════════════════════════════════════════════════════════════════ */
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.55 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 130 || info.velocity.y > 400) {
                  handleClose();
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 340 }}
              className="fixed inset-x-0 bottom-0 z-[101] w-full max-h-[92vh] bg-white rounded-t-[32px] border-t border-[#DEE1E4] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* Drag Handle Bar Pill */}
              <div className="w-12 h-1.5 rounded-full bg-[#DEE1E4] mx-auto mt-3 mb-1 shrink-0 cursor-grab active:cursor-grabbing" />

              {/* Scrollable Drawer Content */}
              <div
                ref={drawerContentRef}
                className="flex-1 overflow-y-auto px-5 pb-12 pt-1 overscroll-contain"
              >
                {/* Frame [2312:9383]: Title + Close Button */}
                <div className="flex items-center justify-between pt-2 pb-3 w-full shrink-0">
                  <Heading className="font-sans font-medium text-[27px] sm:text-[31px] text-[#1F2123] leading-tight truncate pr-2">
                    {component.title}
                  </Heading>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="size-[32px] sm:size-[36px] rounded-full bg-[#EEF1F4] hover:bg-[#DEE1E4] flex items-center justify-center text-[#7D7F82] hover:text-[#1F2123] transition-colors shrink-0 cursor-pointer"
                    aria-label="Close drawer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Component card [2312:9386] */}
                <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[28px] w-full h-[220px] relative flex items-center justify-center overflow-hidden my-3 shrink-0 select-none">
                  {/* Bookmark icon [2312:9387] */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleSave) onToggleSave(component.id);
                    }}
                    className={`absolute top-3.5 right-3.5 size-[38px] rounded-full flex items-center justify-center transition-colors z-20 cursor-pointer ${
                      isSaved
                        ? "text-[#1F2123] bg-black/5 hover:bg-black/10"
                        : "text-[#7D7F82] hover:text-black hover:bg-black/5"
                    }`}
                    aria-label={isSaved ? "Saved" : "Save component"}
                    title={isSaved ? "Saved" : "Bookmark"}
                  >
                    <Bookmark
                      size={20}
                      className={
                        isSaved
                          ? "fill-current stroke-current"
                          : "fill-transparent stroke-current stroke-2"
                      }
                    />
                  </button>

                  {/* Live Interactive Node */}
                  <div className="w-full h-full transform flex items-center justify-center scale-100 sm:scale-105 pointer-events-auto">
                    {(() => {
                      const RegistryComponent = registryEntry?.component;
                      if (RegistryComponent) {
                        return (
                          <div
                            style={activeOverrides as React.CSSProperties}
                            className="w-full h-full flex items-center justify-center"
                          >
                            <RegistryComponent />
                          </div>
                        );
                      }
                      if (snippets?.html || snippets?.css) {
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <LivePreviewIframe
                              sourceType={
                                (component.source_type as "react" | "html_css" | "both") || "html_css"
                              }
                              snippets={snippets}
                              schemaDefinition={component.schema_definition}
                              overrides={activeOverrides}
                              className="w-[120%] h-[120%] border-none scale-[0.85] origin-center"
                            />
                          </div>
                        );
                      }
                      return (
                        <div className="text-[#7D7F82] font-medium text-sm flex flex-col items-center gap-1.5 text-center px-4">
                          <span>Preview Unavailable</span>
                          <span className="text-xs text-[#A0A2A5]">
                            Missing trusted registry renderer
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Code Section [2312:9392] */}
                <div className="mt-5 mb-2">
                  <h3 className="font-sans font-bold text-[18px] text-[#1F2123] mb-3">
                    Code
                  </h3>

                  {isLocked ? (
                    <div className="flex flex-col items-center justify-center w-full text-center gap-3 py-6 px-4 bg-[#F7F9FB] rounded-[24px] border border-[#DEE1E4]">
                      <div className="size-12 rounded-full bg-[#EEF1F4] border border-[#DEE1E4] flex items-center justify-center">
                        <Lock className="text-[#454545] size-5" />
                      </div>
                      <p className="font-sans font-semibold text-[16px] text-[#1F2123]">
                        Sign in to view code
                      </p>
                      <button
                        type="button"
                        onClick={handleSignInClick}
                        className="mt-1 bg-[#1F2123] text-white px-6 py-2.5 rounded-full font-sans font-medium text-[14px] hover:bg-black transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                      >
                        Sign in
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* Input Field - Next.js [Figma 2322:9668] */}
                      {nextjsSnippet && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(nextjsSnippet, "nextjs")}
                          className="w-full h-[54px] sm:h-[60px] rounded-[53px] border border-[#CBCED1] px-5 sm:px-6 flex items-center justify-between bg-white hover:bg-[#F7F9FB] active:scale-[0.99] transition-all cursor-pointer group shadow-2xs"
                        >
                          <span className="font-sans font-medium text-[16px] sm:text-[17.28px] text-[#3D3D3D]">
                            Next.js Code
                          </span>
                          <div className="flex items-center gap-[10px]">
                            <span className="font-sans font-medium text-[16px] sm:text-[17.28px] text-[#B0B0B0]">|</span>
                            {copied === "nextjs" ? (
                              <span className="flex items-center gap-1.5 text-green-600 text-[13px] font-medium">
                                <Check size={16} className="text-green-600" />
                                Copied
                              </span>
                            ) : (
                              <Copy size={16} className="text-[#3D3D3D] group-hover:text-black transition-colors" />
                            )}
                          </div>
                        </button>
                      )}

                      {/* Prompt */}
                      {snippets.prompt && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(snippets.prompt, "prompt")}
                          className="w-full h-[54px] sm:h-[60px] rounded-[53px] border border-[#CBCED1] px-5 sm:px-6 flex items-center justify-between bg-white hover:bg-[#F7F9FB] active:scale-[0.99] transition-all cursor-pointer group shadow-2xs"
                        >
                          <span className="font-sans font-medium text-[16px] sm:text-[17.28px] text-[#3D3D3D]">
                            Prompt
                          </span>
                          <div className="flex items-center gap-[10px]">
                            <span className="font-sans font-medium text-[16px] sm:text-[17.28px] text-[#B0B0B0]">|</span>
                            {copied === "prompt" ? (
                              <span className="flex items-center gap-1.5 text-green-600 text-[13px] font-medium">
                                <Check size={16} className="text-green-600" />
                                Copied
                              </span>
                            ) : (
                              <Copy size={16} className="text-[#3D3D3D] group-hover:text-black transition-colors" />
                            )}
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Component Grid [2312:9413]: Other Components */}
                {otherComponentsList.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-[#DEE1E4]/70 w-full">
                    {/* Other Components [2312:9414] */}
                    <h3 className="font-sans font-bold text-[20px] text-[#1F2123] mb-4">
                      Other Components
                    </h3>
                    <div className="flex flex-col gap-4">
                      {otherComponentsList.map((other) => {
                        const OtherRegistry = componentRegistry[other.registry_id]?.component;
                        const isOtherSaved = savedIds.includes(other.id);

                        return (
                          <div
                            key={other.id}
                            onClick={() => {
                              if (onSelectComponent) {
                                onSelectComponent(other);
                                if (drawerContentRef.current) {
                                  drawerContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
                                }
                              }
                            }}
                            className="bg-[#F1F1F2] border border-[#DEE1E4] rounded-[16px] w-full overflow-hidden flex flex-col group cursor-pointer hover:border-[#1F2123]/40 transition-all shadow-2xs"
                          >
                            {/* Frame 1171278851: Top Action Bar (Play icon + Bookmark icon) */}
                            <div className="flex items-center justify-between p-3 pb-0 w-full z-10">
                              <div className="flex items-center">
                                {(other as any).access_tier === "premium" && (
                                  <div className="flex items-center justify-center bg-[#FDF8F0] border border-[#F3E2C6] rounded-full px-2 py-0.5">
                                    <span className="text-[#C18824] text-[10px] font-bold uppercase tracking-wider">
                                      Premium
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {/* Play icon */}
                                <div className="size-[34px] rounded-full flex items-center justify-center text-[#7D7F82]">
                                  <Play size={16} className="text-[#7D7F82] fill-transparent" />
                                </div>
                                {/* Bookmark icon */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onToggleSave) onToggleSave(other.id);
                                  }}
                                  className={`size-[34px] rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                    isOtherSaved ? "text-[#1F2123]" : "text-[#7D7F82] hover:text-black"
                                  }`}
                                  aria-label={isOtherSaved ? "Saved" : "Save"}
                                >
                                  <Bookmark
                                    size={17}
                                    className={isOtherSaved ? "fill-current stroke-current" : "stroke-2"}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* component [SLOT]: Center Preview */}
                            <div className="h-[151px] w-full flex items-center justify-center p-2 relative overflow-hidden pointer-events-none">
                              <div className="transform scale-[0.85] flex items-center justify-center w-full">
                                {OtherRegistry ? (
                                  <OtherRegistry />
                                ) : other.snippets?.html || other.snippets?.css ? (
                                  <div className="w-[140%] h-[140%]">
                                    <LivePreviewIframe
                                      sourceType={(other.source_type as any) || "html_css"}
                                      snippets={other.snippets || {}}
                                      className="w-full h-full border-none scale-75 origin-center"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#7D7F82]">Preview</span>
                                )}
                              </div>
                            </div>

                            {/* Frame 1171278850: Footer with Title and Tags */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-[#DEE1E4]/60 bg-transparent mt-auto">
                              <h4 className="font-sans font-medium text-[20px] text-black truncate max-w-[55%]">
                                {other.title}
                              </h4>
                              <div className="flex items-center gap-1.5 shrink-0 overflow-hidden">
                                {(other.tags && other.tags.length > 0
                                  ? other.tags.slice(0, 3)
                                  : ["Html & css", "Next js", "Figma"]
                                ).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-white border border-[#EEF1F4] rounded-[4px] px-1.5 py-0.5 text-[11px] font-sans text-[#7D7F82] whitespace-nowrap"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ═════════════════════════════════════════════════════════════════
               DESKTOP MODAL DIALOG (100% UNTOUCHED ORIGINAL DESIGN)
               ═════════════════════════════════════════════════════════════════ */
            <div className="fixed inset-0 z-[101] hidden md:flex items-center justify-center p-4 md:p-10 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#FBFCFD] w-full max-w-[1301px] h-full max-h-[692px] rounded-[40px] p-[32px] flex flex-col md:flex-row gap-[24px] pointer-events-auto shadow-2xl overflow-hidden"
              >
                {/* Left Side: Preview Area */}
                <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[28px] w-full md:w-[572px] h-full shrink-0 relative flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full transform flex items-center justify-center scale-110">
                    {(() => {
                      const RegistryComponent = registryEntry?.component;
                      if (RegistryComponent) {
                        return (
                          <div
                            style={activeOverrides as React.CSSProperties}
                            className="w-full h-full flex items-center justify-center"
                          >
                            <RegistryComponent />
                          </div>
                        );
                      }

                      const hasHtmlCss = snippets?.html || snippets?.css;
                      if (hasHtmlCss && component.source_type !== "react") {
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <LivePreviewIframe
                              sourceType={
                                (component.source_type as "react" | "html_css" | "both") || "html_css"
                              }
                              snippets={snippets}
                              schemaDefinition={component.schema_definition}
                              overrides={activeOverrides}
                              className="w-[120%] h-[120%] border-none scale-[0.85] origin-center"
                            />
                          </div>
                        );
                      }

                      return (
                        <div className="text-[#7D7F82] font-medium text-sm flex flex-col items-center gap-2">
                          <span>Preview Unavailable</span>
                          <span className="text-xs">
                            This component requires a trusted registry renderer.
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Side: Panel Area */}
                <div className="flex-1 flex flex-col gap-[24px] p-0 md:p-[24px] overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between w-full shrink-0">
                    <div className="flex items-center gap-3">
                      <Heading className="font-sans font-medium text-[24px] md:text-[31px] text-[#454545] leading-[1.2]">
                        {component.title}
                      </Heading>
                    </div>
                    <button
                      onClick={handleClose}
                      className="size-[32px] flex items-center justify-center text-[#7D7F82] hover:text-black transition-colors cursor-pointer"
                      aria-label="Close modal"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {isDetailPage && component.description?.trim() && (
                    <p className="text-[15px] leading-relaxed text-[#7D7F82]">
                      {component.description}
                    </p>
                  )}

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto w-full pr-2">
                    {isLocked ? (
                      <div className="flex flex-col items-center justify-center h-full w-full max-w-[593px] text-center gap-4 py-12 px-4">
                        <div className="size-16 rounded-full bg-[#EEF1F4] border border-[#DEE1E4] flex items-center justify-center mb-1">
                          <Lock className="text-[#454545] size-7" />
                        </div>
                        <h3 className="font-sans font-bold text-[22px] text-[#454545]">
                          Sign in to view code
                        </h3>
                        <p className="text-[#7D7F82] text-[15px] leading-relaxed max-w-[360px]">
                          Source code and copy features are free during our public beta. Sign in with Google to access, inspect, and copy this component.
                        </p>
                        <button
                          type="button"
                          onClick={handleSignInClick}
                          className="mt-3 bg-[#1F2123] text-white px-8 py-3.5 rounded-full font-sans font-medium text-[15px] hover:bg-black transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
                        >
                          Sign in to view code
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-[16px] w-full max-w-[593px]">
                        <h3 className="font-sans font-bold text-[18px] text-[#454545]">
                          Code
                        </h3>

                        {(() => {
                          const nextjsCode = snippets.nextjs || snippets.react;

                          if (!nextjsCode) {
                            return (
                              <div className="text-[#7D7F82] text-[14px] text-center py-8 bg-[#F7F9FB] rounded-[16px] border border-[#EEF1F4]">
                                Next.js code is not available for this component.
                              </div>
                            );
                          }

                          const codeToCopy = nextjsCode;

                          return (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(codeToCopy, "nextjs")}
                              className="w-full h-[60px] rounded-[53px] border border-[#CBCED1] px-[24px] flex items-center justify-between bg-white hover:bg-[#F7F9FB] active:scale-[0.99] transition-all cursor-pointer group shadow-2xs"
                            >
                              <span className="font-sans font-medium text-[17.28px] text-[#3D3D3D]">
                                Next.js Code
                              </span>
                              <div className="flex items-center gap-[10px]">
                                <span className="font-sans font-medium text-[17.28px] text-[#B0B0B0]">|</span>
                                {copied === "nextjs" ? (
                                  <span className="flex items-center gap-1.5 text-green-600 text-[14px] font-medium">
                                    <Check size={18} className="text-green-600" />
                                    Copied
                                  </span>
                                ) : (
                                  <Copy size={18} className="text-[#3D3D3D] group-hover:text-black transition-colors" />
                                )}
                              </div>
                            </button>
                          );
                        })()}

                        {snippets.prompt && (
                          <button
                            type="button"
                            className="w-full h-[60px] rounded-[53px] border border-[#CBCED1] px-[24px] flex items-center justify-between bg-white hover:bg-[#F7F9FB] active:scale-[0.99] transition-all cursor-pointer group shadow-2xs"
                            onClick={() => copyToClipboard(snippets.prompt, "prompt")}
                          >
                            <span className="font-sans font-medium text-[17.28px] text-[#3D3D3D]">
                              Prompt
                            </span>
                            <div className="flex items-center gap-[10px]">
                              <span className="font-sans font-medium text-[17.28px] text-[#B0B0B0]">|</span>
                              {copied === "prompt" ? (
                                <span className="flex items-center gap-1.5 text-green-600 text-[14px] font-medium">
                                  <Check size={18} className="text-green-600" />
                                  Copied
                                </span>
                              ) : (
                                <Copy size={18} className="text-[#3D3D3D] group-hover:text-black transition-colors" />
                              )}
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
