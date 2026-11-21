"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { ComponentModalPublic, ComponentItem, prefetchComponentSnippet, getComponentMotionDescription } from "@/components/ui/ComponentModalPublic";
import { getPublishedComponents } from "@/lib/admin/components/queries";
import { componentRegistry } from "@/lib/registry/components";
import { LivePreviewIframe } from "@/components/admin/preview/LivePreviewIframe";
import { useCustomization } from "@/components/providers/CustomizationProvider";

function ProgressiveCardPreview({
  isPriority,
  children,
}: {
  isPriority: boolean;
  children: React.ReactNode;
}) {
  const [shouldRender, setShouldRender] = useState(isPriority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldRender) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldRender]);

  if (!shouldRender) {
    return (
      <div
        ref={containerRef}
        className="w-full min-h-[140px] flex items-center justify-center animate-pulse"
      >
        <div className="w-20 h-6 bg-black/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center">
      {children}
    </div>
  );
}

export type ComponentCategoryTab = "buttons" | "tabs" | "inputs" | "cards";

export const CATEGORY_TABS: { id: ComponentCategoryTab; label: string }[] = [
  { id: "buttons", label: "Buttons" },
  { id: "tabs", label: "Tabs" },
  { id: "inputs", label: "input fields" },
  { id: "cards", label: "cards" },
];

const INPUT_SLUGS = new Set([
  "smooth-card-input",
  "ai-search-toggle",
  "ai-reasoning-drawer",
  "ai-reasoning",
  "expandable-search",
  "smooth-time-picker",
  "smooth-date-picker",
  "smooth-input",
  "smooth-otp-input",
  "smooth-password-input",
  "smooth-phone-input",
  "smooth-tag-input",
  "smooth-email-input",
  "smooth-copy-input",
  "product-type-dropdown",
]);

const TAB_SLUGS = new Set([
  "four-item-tabs",
  "tabs-button",
]);

const CARD_SLUGS = new Set([
  "image-compare",
  "pdf-action-card",
  "image-generation-preview",
  "live-session",
  "live-session-invite",
  "interactive-face",
]);

const BUTTON_SLUGS = new Set([
  "accept-button",
  "send-button",
  "delete-button",
  "bubble-arrow-button",
  "continue-button",
  "download-button",
  "generate-button",
  "get-access-button",
  "bookmark-button",
  "mail-button",
  "motion-toggle",
  "neo-delete-button",
  "services-indicator-button",
  "stepper-button",
  "swipe-arrow-button",
  "text-swipe-button",
  "view-more-eye-button",
]);

export function getComponentCategory(comp: ComponentItem): ComponentCategoryTab {
  const slug = (comp.registry_id || comp.id || "").toLowerCase();
  if (INPUT_SLUGS.has(slug)) return "inputs";
  if (TAB_SLUGS.has(slug)) return "tabs";
  if (CARD_SLUGS.has(slug)) return "cards";
  if (BUTTON_SLUGS.has(slug)) return "buttons";

  const title = (comp.title || "").toLowerCase();
  const tags = (comp.tags || []).map((t) => t.toLowerCase());

  // Input fields (inputs, search, pickers, dropdowns, forms)
  if (
    slug.includes("search") ||
    slug.includes("picker") ||
    slug.includes("input") ||
    slug.includes("dropdown") ||
    title.includes("input") ||
    title.includes("picker") ||
    title.includes("search") ||
    tags.some((t) => ["inputs", "input", "form", "search", "time picker", "date picker", "tag input"].includes(t))
  ) {
    return "inputs";
  }

  // Navigation tabs
  if (slug.includes("tab") || title.includes("tab") || tags.includes("tabs")) {
    return "tabs";
  }

  // Cards & Layout elements
  if (
    (slug.includes("card") && !slug.includes("card-input")) ||
    (title.includes("card") && !title.includes("card number")) ||
    tags.includes("cards")
  ) {
    return "cards";
  }

  // Default to buttons
  return "buttons";
}

export function matchesCategory(comp: ComponentItem, category: ComponentCategoryTab | null): boolean {
  if (!category) return true;
  return getComponentCategory(comp) === category;
}

export interface ComponentsExplorerProps {
  initialComponents?: ComponentItem[];
  initialActiveSlug?: string;
  header?: React.ReactNode;
}

export function ComponentsExplorer({
  initialComponents,
  initialActiveSlug,
  header,
}: ComponentsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSearch = searchParams?.get("search") || "";
  const search = rawSearch.toLowerCase();
  const compQueryParam = searchParams?.get("component");
  const targetSlug = initialActiveSlug || compQueryParam;

  const categoryParam = searchParams?.get("category")?.toLowerCase() as ComponentCategoryTab | undefined;
  const initialCategory: ComponentCategoryTab | null =
    categoryParam && ["buttons", "tabs", "inputs", "cards"].includes(categoryParam)
      ? categoryParam
      : null;
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategoryTab | null>(initialCategory);

  useEffect(() => {
    if (categoryParam && ["buttons", "tabs", "inputs", "cards"].includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    } else if (!categoryParam) {
      setSelectedCategory(null);
    }
  }, [categoryParam]);

  const handleTabClick = (tabId: ComponentCategoryTab) => {
    const nextCategory = selectedCategory === tabId ? null : tabId;
    setSelectedCategory(nextCategory);

    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      if (!nextCategory) {
        currentUrl.searchParams.delete("category");
      } else {
        currentUrl.searchParams.set("category", nextCategory);
      }
      window.history.pushState(null, "", currentUrl.pathname + (currentUrl.search ? currentUrl.search : ""));
    }
  };

  const [components, setComponents] = useState<ComponentItem[]>(initialComponents || []);
  const [isLoaded, setIsLoaded] = useState(!!initialComponents?.length);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [activeModalOverride, setActiveModalOverride] = useState<ComponentItem | null | undefined>(undefined);

  const activeModalComponent = useMemo(() => {
    if (activeModalOverride !== undefined) {
      return activeModalOverride;
    }
    if (targetSlug && components.length > 0) {
      return components.find((c) => c.registry_id === targetSlug || c.id === targetSlug) || null;
    }
    return null;
  }, [activeModalOverride, targetSlug, components]);

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { getOverrides } = useCustomization();

  const refreshComponents = useCallback(async () => {
    try {
      const published = await getPublishedComponents();
      const comps = published || [];
      setComponents(comps);
      setActiveModalOverride((prev) => {
        if (!prev) return prev;
        return comps.find((c) => c.id === prev.id || c.registry_id === prev.registry_id) || prev;
      });
    } catch (e) {
      console.error("Failed to refresh components:", e);
    }
  }, []);

  // Sync components whenever server supplies new initialComponents (e.g. after revalidation)
  useEffect(() => {
    if (initialComponents && initialComponents.length > 0) {
      setComponents(initialComponents);
    }
  }, [initialComponents]);

  // Load components client-side if not supplied initially
  useEffect(() => {
    const init = async () => {
      if (!initialComponents || initialComponents.length === 0) {
        await refreshComponents();
      }
      const bookmarks = JSON.parse(localStorage.getItem("saved_components") || "[]");
      setSavedIds(bookmarks);
      setIsLoaded(true);
    };

    void init();
    const handleSavedChanged = () => {
      const bookmarks = JSON.parse(localStorage.getItem("saved_components") || "[]");
      setSavedIds(bookmarks);
    };
    window.addEventListener("saved_components_changed", handleSavedChanged);
    return () => {
      window.removeEventListener("saved_components_changed", handleSavedChanged);
    };
  }, [initialComponents, refreshComponents]);

  // Keep authentication state synced
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    import("@/lib/supabase/browser").then(({ createClient }) => {
      if (!mounted) return;
      const supabase = createClient();

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        setIsAuthenticated(!!session?.user);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setIsAuthenticated(!!session?.user);
      });

      if (!mounted) {
        subscription.unsubscribe();
      } else {
        unsubscribe = () => subscription.unsubscribe();
      }
    });

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveModalOverride(undefined);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
    if (!matchesCategory(comp, selectedCategory)) {
      return false;
    }

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

  const [columns, setColumns] = useState(3);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const effectiveColumns = hasMounted ? columns : 3;

  const columnItems = useMemo(() => {
    const cols: ComponentItem[][] = Array.from({ length: effectiveColumns }, () => []);
    filteredComponents.forEach((comp, idx) => {
      cols[idx % effectiveColumns].push(comp);
    });
    return cols;
  }, [filteredComponents, effectiveColumns]);

  const skeletonCols = useMemo(() => {
    const cols = Array.from({ length: effectiveColumns }, () => [] as number[]);
    for (let i = 0; i < 6; i++) {
      cols[i % effectiveColumns].push(i);
    }
    return cols;
  }, [effectiveColumns]);

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
    // Middle-click or cmd/ctrl click opens in new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      window.open(`/components/${comp.registry_id || comp.id}`, "_blank");
      return;
    }
    // Normal left click: open modal and update URL without full page reload
    if (e.button === 0) {
      e.preventDefault();
      setActiveModalOverride(comp);
      const slug = comp.registry_id || comp.id;
      const searchParamVal = searchParams?.get("search");
      const searchStr = searchParamVal ? `?search=${encodeURIComponent(searchParamVal)}` : "";
      window.history.pushState(null, "", `/components/${slug}${searchStr}`);
    }
  };

  const handleCloseModal = () => {
    setActiveModalOverride(null);
    const searchParamVal = searchParams?.get("search");
    const searchStr = searchParamVal ? `?search=${encodeURIComponent(searchParamVal)}` : "";
    if (initialActiveSlug) {
      router.push(`/components${searchStr}`, { scroll: false });
    } else {
      window.history.pushState(null, "", `/components${searchStr}`);
    }
  };

  const renderCard = (comp: ComponentItem, isPriority = false) => {
    const isSaved = savedIds.includes(comp.id);
    const componentSlug = comp.registry_id || comp.id;

    return (
      <div
        key={comp.id}
        onClick={(e) => handleCardClick(e, comp)}
        onMouseEnter={() => {
          if (isAuthenticated) {
            prefetchComponentSnippet(comp.registry_id || comp.id);
          }
        }}
        className="bg-[#F1F1F2] border border-[#DEE1E4] flex flex-col gap-px items-start relative rounded-[32px] w-full overflow-clip group cursor-pointer min-h-[251px] h-auto text-inherit transition-shadow hover:shadow-xs"
      >
        {/* Top action bar */}
        <div className="flex items-center justify-between p-[8px] w-full shrink-0 relative z-10 bg-transparent min-h-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center" />
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
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full flex-1 flex items-center justify-center bg-transparent pointer-events-auto z-0 min-h-[151px] py-3 px-2 overflow-hidden cursor-default"
        >
          <div className="w-full transform flex items-center justify-center scale-[0.9]">
            <ProgressiveCardPreview isPriority={isPriority}>
              {(() => {
                const overrides = getOverrides(comp.id);
                const activeOverrides: Record<string, string> = {};
                const schemaDefToUse =
                  comp.schema_definition && comp.schema_definition.length > 0
                    ? comp.schema_definition
                    : componentRegistry[comp.registry_id]?.schema_definition || [];

                schemaDefToUse.forEach((config: { variable: string; defaultValue?: string }) => {
                  const val =
                    overrides[config.variable] !== undefined
                      ? overrides[config.variable]
                      : config.defaultValue;
                  if (config.variable && val !== undefined) {
                    activeOverrides[config.variable] = val;
                  }
                });

                const RegistryComponent = componentRegistry[comp.registry_id]?.component;
                if (RegistryComponent) {
                  return (
                    <div
                      style={activeOverrides as React.CSSProperties}
                      className="w-full flex items-center justify-center"
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
            </ProgressiveCardPreview>
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex items-center justify-between px-[20px] py-[12px] w-full shrink-0 relative z-10 bg-transparent h-[48px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-auto">
          <div className="flex items-center gap-2 max-w-[100%]">
            <Link
              href={`/components/${componentSlug}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                }
              }}
              className="font-sans font-medium text-[20px] leading-[1.2] text-[#454545] whitespace-nowrap truncate hover:text-black transition-colors"
            >
              {comp.title}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFCFD] pb-32">
      <div className="w-full px-6 lg:px-[70px] pt-8">
        {header}

        {/* Category Tabs Filter (Figma Node 2466:6053) */}
        <div className="flex items-center gap-[8px] overflow-x-auto pb-1 mb-5 sm:mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-start">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`px-[24px] py-[12px] rounded-[20px] font-sans font-semibold text-[14px] leading-normal whitespace-nowrap shrink-0 transition-colors select-none cursor-pointer active:scale-[0.98] ${
                  isActive
                    ? "bg-[#1F2123] text-white"
                    : "bg-[#EEF1F4] text-[#1F2123] hover:bg-[#DEE1E4]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

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
          <div className="flex gap-[24px] w-full items-start">
            {skeletonCols.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-[24px] flex-1 min-w-0">
                {col.map((i) => (
                  <div
                    key={i}
                    className="bg-[#F1F1F2] border border-[#DEE1E4] flex flex-col gap-px items-start relative rounded-[32px] w-full overflow-clip min-h-[253px]"
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
            ))}
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-[20px] text-[#7D7F82] font-medium">
              {rawSearch
                ? `No components found matching "${rawSearch}".`
                : selectedCategory
                ? `No components found in "${CATEGORY_TABS.find((t) => t.id === selectedCategory)?.label}".`
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
            {selectedCategory && !rawSearch && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  if (typeof window !== "undefined") {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.delete("category");
                    window.history.pushState(null, "", currentUrl.pathname + (currentUrl.search ? currentUrl.search : ""));
                  }
                }}
                className="px-5 py-2.5 bg-[#1F2123] hover:bg-black text-white font-sans font-medium text-[15px] rounded-full transition-colors cursor-pointer"
              >
                Show all components
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-[24px] w-full items-start">
            {columnItems.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-[24px] flex-1 min-w-0">
                {col.map((comp) => {
                  const globalIdx = filteredComponents.indexOf(comp);
                  return renderCard(comp, globalIdx < 6);
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeModalComponent && (
        <ComponentModalPublic
          component={activeModalComponent}
          isOpen={!!activeModalComponent}
          onClose={handleCloseModal}
          isAuthenticated={isAuthenticated}
          isDetailPage={Boolean(initialActiveSlug)}
          allComponents={components}
          savedIds={savedIds}
          onToggleSave={(id) => toggleSave(null as any, id)}
          onSelectComponent={(comp) => {
            setActiveModalOverride(comp);
            const slug = comp.registry_id || comp.id;
            const searchParamVal = searchParams?.get("search");
            const searchStr = searchParamVal ? `?search=${encodeURIComponent(searchParamVal)}` : "";
            window.history.pushState(null, "", `/components/${slug}${searchStr}`);
          }}
        />
      )}
    </div>
  );
}
