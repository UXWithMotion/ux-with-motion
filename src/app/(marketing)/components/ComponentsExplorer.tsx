"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, Check, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ComponentModalPublic, ComponentItem } from "@/components/ui/ComponentModalPublic";
import { getPublishedComponents } from "@/lib/admin/components/queries";
import { componentRegistry } from "@/lib/registry/components";
import { LivePreviewIframe } from "@/components/admin/preview/LivePreviewIframe";
import { useCustomization } from "@/components/providers/CustomizationProvider";

type FilterDropdownProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
};

function FilterDropdown({ label, options, selected, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={ref} className={`relative ${isOpen ? "z-50" : "z-20"}`} onKeyDown={handleKeyDown}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-[#F7F9FB] border border-[#DEE1E4] rounded-[36px] pl-[16px] pr-[12px] py-[12px] flex items-center gap-[8px] overflow-clip hover:bg-[#EEF1F4] transition-colors"
      >
        <span className="font-sans font-medium text-[16px] leading-[1.2] text-[#454545] whitespace-nowrap">{label}</span>
        <ChevronDown size={24} className={`text-[#454545] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+8px)] left-0 w-[201px] bg-[#F7F9FB] border border-[#DEE1E4] rounded-[16px] flex flex-col items-start overflow-clip shadow-lg"
          >
            {options.map((option) => {
              const isChecked = selected.includes(option);
              return (
                <div 
                  key={option} 
                  onClick={() => {
                    onChange(isChecked ? selected.filter(o => o !== option) : [...selected, option]);
                  }} 
                  className="w-full flex items-center justify-between p-[12px] cursor-pointer hover:bg-[#EEF1F4] transition-colors group"
                >
                  <span className="font-sans font-medium text-[16px] leading-[1.2] text-[#454545] whitespace-nowrap">{option}</span>
                  <div className={`size-[20px] rounded-[4px] border flex items-center justify-center transition-colors ${isChecked ? "bg-black border-black" : "border-[#DEE1E4] group-hover:border-[#7D7F82] bg-[#FBFCFD]"}`}>
                    {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface ComponentsExplorerProps {
  initialComponents?: ComponentItem[];
  initialActiveSlug?: string;
}

export function ComponentsExplorer({
  initialComponents,
  initialActiveSlug,
}: ComponentsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSearch = searchParams?.get("search") || "";
  const search = rawSearch.toLowerCase();

  const [components, setComponents] = useState<ComponentItem[]>(initialComponents || []);
  const [isLoaded, setIsLoaded] = useState(!!initialComponents?.length);

  const [activeModalComponent, setActiveModalComponent] = useState<ComponentItem | null>(() => {
    if (initialActiveSlug && initialComponents?.length) {
      return (
        initialComponents.find(
          (c) => c.registry_id === initialActiveSlug || c.id === initialActiveSlug
        ) || null
      );
    }
    return null;
  });

  const [savedIds, setSavedIds] = useState<string[]>([]);

  const { getOverrides } = useCustomization();

  const hasInitializedSlugRef = useRef(false);

  // Load components client-side if not supplied initially
  useEffect(() => {
    const loadComponents = async () => {
      try {
        if (!initialComponents || initialComponents.length === 0) {
          const published = await getPublishedComponents();
          setComponents(published || []);
        }
      } catch (e) {
        console.error(e);
      }

      const bookmarks = JSON.parse(localStorage.getItem("saved_components") || "[]");
      setSavedIds(bookmarks);
      setIsLoaded(true);
    };

    loadComponents();
    window.addEventListener("saved_components_changed", loadComponents);
    return () => {
      window.removeEventListener("saved_components_changed", loadComponents);
    };
  }, [initialComponents]);

  // Sync initialActiveSlug only ONCE on mount or when components first load
  useEffect(() => {
    if (hasInitializedSlugRef.current) return;
    if (initialActiveSlug && components.length > 0) {
      const match = components.find(
        (c) => c.registry_id === initialActiveSlug || c.id === initialActiveSlug
      );
      if (match) {
        setActiveModalComponent(match);
      }
      hasInitializedSlugRef.current = true;
    }
  }, [initialActiveSlug, components]);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/components\/([^\/]+)$/);
      if (match) {
        const slug = match[1];
        const found = components.find(
          (c) => c.registry_id === slug || c.id === slug
        );
        setActiveModalComponent(found || null);
      } else {
        setActiveModalComponent(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [components]);

  const normalizedSearch = search ? search.toLowerCase().trim().replace(/\s+/g, " ") : "";
  const searchTerms = normalizedSearch
    .split(" ")
    .map((word) => {
      const synonyms: Record<string, string> = {
        buttons: "button",
        animations: "animation",
        cards: "card",
        icons: "icon",
        inputs: "input",
      };
      return synonyms[word] || word;
    })
    .filter(Boolean);

  const filteredComponents = components.filter((comp) => {
    if (searchTerms.length === 0) return true;

    const searchableText = [
      comp.title,
      comp.description || "",
      ...(comp.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchTerms.every((term) => searchableText.includes(term));
  });

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = savedIds.includes(id);
    const newSaved = isSaved ? savedIds.filter((s) => s !== id) : [...savedIds, id];
    localStorage.setItem("saved_components", JSON.stringify(newSaved));
    setSavedIds(newSaved);
    window.dispatchEvent(new Event("saved_components_changed"));
  };

  const handleCardClick = (e: React.MouseEvent, comp: ComponentItem) => {
    // Normal left click without cmd/ctrl/shift: open modal and update URL without full page reload
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      setActiveModalComponent(comp);
      const slug = comp.registry_id || comp.id;
      window.history.pushState(null, "", `/components/${slug}`);
    }
  };

  const handleCloseModal = () => {
    setActiveModalComponent(null);
    if (initialActiveSlug) {
      router.push("/components", { scroll: false });
    } else if (window.location.pathname.startsWith("/components/")) {
      window.history.pushState(null, "", "/components");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFCFD] pb-32">
      <div className="w-full px-6 lg:px-[70px] pt-8">
        {rawSearch && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-sans text-[20px] text-[#454545]">
              Search results for: <span className="font-bold">&quot;{rawSearch}&quot;</span>
            </h2>
            <button
              type="button"
              onClick={() => router.push("/components")}
              className="text-[14px] font-medium text-[#1566E5] hover:underline cursor-pointer shrink-0"
            >
              Clear search
            </button>
          </div>
        )}

        {!isLoaded ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-[24px] w-full">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#F7F9FB] border border-[#DEE1E4] flex flex-col gap-px items-start relative rounded-[32px] w-full overflow-clip min-h-[253px] break-inside-avoid mb-[24px]"
              >
                <div className="flex items-center justify-between p-[8px] w-full shrink-0 relative z-10 min-h-[50px]">
                  <div className="w-[50px] h-[20px] bg-[#E5E7EB] rounded-full animate-pulse ml-1" />
                  <div className="flex gap-[6px] items-center">
                    <div className="size-[34px] bg-[#E5E7EB] rounded-[6px] animate-pulse" />
                    <div className="size-[34px] bg-[#E5E7EB] rounded-[6px] animate-pulse" />
                  </div>
                </div>
                <div className="h-[151px] w-full relative flex items-center justify-center shrink-0 overflow-hidden">
                  <div className="w-[120px] h-[40px] bg-[#E5E7EB] rounded-[8px] animate-pulse" />
                </div>
                <div className="flex items-center p-[16px] w-full shrink-0 mt-auto border-t border-[#DEE1E4]">
                  <div className="w-[120px] h-[20px] bg-[#E5E7EB] rounded-[4px] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-[20px] text-[#7D7F82] font-medium">
              {rawSearch
                ? `No components found matching "${rawSearch}".`
                : "No published components found."}
            </p>
            {rawSearch && (
              <button
                type="button"
                onClick={() => router.push("/components")}
                className="px-5 py-2.5 bg-[#EEF1F4] hover:bg-[#DEE1E4] text-[#454545] font-sans font-medium text-[15px] rounded-full transition-colors cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-[24px] w-full">
            {filteredComponents.map((comp) => {
              const isSaved = savedIds.includes(comp.id);
              const componentSlug = comp.registry_id || comp.id;

              return (
                <Link
                  key={comp.id}
                  href={`/components/${componentSlug}`}
                  onClick={(e) => handleCardClick(e, comp)}
                  className="bg-[#F7F9FB] border border-[#DEE1E4] flex flex-col gap-px items-start relative rounded-[32px] w-full overflow-clip group cursor-pointer break-inside-avoid mb-[24px] min-h-[251px] block text-inherit no-underline"
                >
                  {/* Top action bar */}
                  <div className="flex items-center justify-between p-[8px] w-full shrink-0 relative z-10 bg-transparent min-h-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center">
                      {(comp as any).access_tier === "premium" && (
                        <div
                          className="flex items-center justify-center bg-[#FDF8F0] border border-[#F3E2C6] rounded-full px-2 py-0.5 shrink-0 ml-1"
                          title="Premium Component"
                        >
                          <span className="text-[#C18824] text-[10px] font-bold uppercase tracking-wider">
                            Premium
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-[6px] items-center">
                      <button
                        type="button"
                        onClick={(e) => toggleSave(e, comp.id)}
                        className={`flex items-center justify-center size-[34px] transition-colors ${
                          isSaved ? "text-[#454545]" : "text-[#B0B0B0] hover:text-black"
                        }`}
                        aria-label={isSaved ? "Saved" : "Bookmark"}
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
                    </div>
                  </div>

                  {/* Component Display Area */}
                  <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden bg-transparent pointer-events-auto z-0">
                    <div className="w-full h-full transform flex items-center justify-center scale-[0.9]">
                      {(() => {
                        const overrides = getOverrides(comp.id);
                        const activeOverrides: Record<string, string> = {};
                        const schemaDefToUse =
                          comp.schema_definition && comp.schema_definition.length > 0
                            ? comp.schema_definition
                            : componentRegistry[comp.registry_id]?.schema_definition || [];

                        schemaDefToUse.forEach((config: any) => {
                          const val =
                            overrides[config.variable] !== undefined
                              ? overrides[config.variable]
                              : config.defaultValue;
                          if (config.variable) {
                            activeOverrides[config.variable] = val;
                          }
                        });

                        const RegistryComponent = componentRegistry[comp.registry_id]?.component;
                        if (RegistryComponent) {
                          return (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={activeOverrides as React.CSSProperties}
                              className="w-full h-full flex items-center justify-center"
                            >
                              <RegistryComponent />
                            </div>
                          );
                        }

                        const hasHtmlCss = comp.snippets?.html || comp.snippets?.css;
                        if (hasHtmlCss && comp.source_type !== "react") {
                          return (
                            <div className="w-[150%] h-[150%]">
                              <LivePreviewIframe
                                sourceType={
                                  (comp.source_type as "react" | "html_css" | "both") || "html_css"
                                }
                                snippets={comp.snippets || {}}
                                schemaDefinition={comp.schema_definition}
                                overrides={activeOverrides}
                                className="w-full h-full border-none scale-[0.9] origin-center"
                              />
                            </div>
                          );
                        }

                        return (
                          <div className="text-[#7D7F82] font-medium text-sm flex flex-col items-center gap-1">
                            <span>Preview Unavailable</span>
                            <span className="text-[10px]">Missing trusted registry renderer</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Footer Area */}
                  <div className="flex items-center justify-between px-[20px] py-[12px] w-full shrink-0 relative z-10 bg-transparent h-[48px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-auto">
                    <div className="flex items-center gap-2 max-w-[100%]">
                      <h3 className="font-sans font-medium text-[20px] leading-[1.2] text-[#454545] whitespace-nowrap truncate">
                        {comp.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {activeModalComponent && (
        <ComponentModalPublic
          component={activeModalComponent}
          isOpen={!!activeModalComponent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

