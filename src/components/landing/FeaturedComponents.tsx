"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ExploreButton } from "@/components/ui/ExploreButton";
import { ComponentModalPublic, ComponentItem } from "@/components/ui/ComponentModalPublic";
import { componentRegistry } from "@/lib/registry/components";
import { LivePreviewIframe } from "@/components/admin/preview/LivePreviewIframe";
import { useCustomization } from "@/components/providers/CustomizationProvider";

export interface FeaturedComponentsProps {
  initialComponents: ComponentItem[];
  title?: string;
  subtitle?: string;
}

export function FeaturedComponents({
  initialComponents,
  title = "Components that feel alive.",
  subtitle,
}: FeaturedComponentsProps) {
  const [components] = useState<ComponentItem[]>(initialComponents || []);
  const [activeModalComponent, setActiveModalComponent] = useState<ComponentItem | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { getOverrides } = useCustomization();

  // Load saved bookmarks from localStorage
  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const bookmarks = JSON.parse(localStorage.getItem("saved_components") || "[]");
        setSavedIds(bookmarks);
      } catch {
        setSavedIds([]);
      }
    };

    loadBookmarks();
    window.addEventListener("saved_components_changed", loadBookmarks);
    return () => window.removeEventListener("saved_components_changed", loadBookmarks);
  }, []);

  // Keep authentication state synced for source code access in the modal
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

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const toggleSave = (e: React.MouseEvent | null, id: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isSaved = savedIds.includes(id);
    const newSaved = isSaved ? savedIds.filter((s) => s !== id) : [...savedIds, id];
    localStorage.setItem("saved_components", JSON.stringify(newSaved));
    setSavedIds(newSaved);
    window.dispatchEvent(new Event("saved_components_changed"));
  };

  const handleCardClick = (e: React.MouseEvent, comp: ComponentItem) => {
    // Cmd/Ctrl-click or middle-click opens component page in new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      window.open(`/components/${comp.registry_id || comp.id}`, "_blank");
      return;
    }
    // Normal click opens modal preview
    if (e.button === 0) {
      e.preventDefault();
      setActiveModalComponent(comp);
    }
  };

  const renderCard = (comp: ComponentItem) => {
    const isSaved = savedIds.includes(comp.id);
    const componentSlug = comp.registry_id || comp.id;

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
    const hasHtmlCss = comp.snippets?.html || comp.snippets?.css;

    return (
      <div
        key={comp.id}
        onClick={(e) => handleCardClick(e, comp)}
        className="bg-[#F1F1F2] border border-[#DEE1E4] flex flex-col gap-px items-start relative rounded-[32px] w-full overflow-clip group cursor-pointer min-h-[251px] h-auto text-inherit transition-shadow hover:shadow-xs"
      >
        {/* Top action bar */}
        <div className="flex items-center justify-between p-[8px] w-full shrink-0 relative z-10 bg-transparent min-h-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center" />
          <div className="flex gap-[6px] items-center">
            <button
              type="button"
              onClick={(e) => toggleSave(e, comp.id)}
              className={`flex items-center justify-center size-[34px] transition-colors cursor-pointer ${
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
            {RegistryComponent ? (
              <div
                style={activeOverrides as React.CSSProperties}
                className="w-full flex items-center justify-center"
              >
                <RegistryComponent />
              </div>
            ) : hasHtmlCss && comp.source_type !== "react" ? (
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
            ) : (
              <div className="text-[#7D7F82] font-medium text-sm flex flex-col items-center gap-1">
                <span>Preview Unavailable</span>
              </div>
            )}
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
                  setActiveModalComponent(comp);
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
    <section id="featured-components" className="w-full pt-12 pb-16 md:pt-16 md:pb-24">
      <Container>
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-title font-bold text-[32px] sm:text-[44px] md:text-[61px] leading-[1.12] text-[#454545] tracking-[-0.02em] text-balance">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 font-sans font-normal text-[16px] sm:text-[18px] md:text-[20px] leading-[1.5] text-[#7D7F82] max-w-[700px] mx-auto text-balance">
              {subtitle}
            </p>
          )}
        </div>

        {/* 6 Component Cards Grid (3 columns desktop, 2 tablet, 1 mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full max-w-[1300px] mx-auto">
          {components.slice(0, 6).map((comp) => renderCard(comp))}
        </div>

        {/* Explore more button */}
        <div className="flex justify-center mt-12 md:mt-16">
          <ExploreButton href="/components" label="Explore more" />
        </div>
      </Container>

      {/* Component Modal */}
      {activeModalComponent && (
        <ComponentModalPublic
          component={activeModalComponent}
          isOpen={!!activeModalComponent}
          onClose={() => setActiveModalComponent(null)}
          isAuthenticated={isAuthenticated}
          allComponents={components}
          savedIds={savedIds}
          onToggleSave={(id) => toggleSave(null, id)}
          onSelectComponent={(comp) => setActiveModalComponent(comp)}
        />
      )}
    </section>
  );
}
