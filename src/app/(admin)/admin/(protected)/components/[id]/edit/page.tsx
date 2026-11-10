"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getAdminComponent, getAdminComponents } from "@/lib/admin/components/queries";
import { BuilderProvider, ComponentBuilderState } from "@/components/admin/builder/BuilderContext";
import { BuilderShell } from "@/components/admin/builder/BuilderShell";
import { componentRegistry } from "@/lib/registry/components";

export default function EditComponentPage() {
  const params = useParams<{ id: string }>();
  const componentId = params?.id;
  
  const [initialState, setInitialState] = useState<Partial<ComponentBuilderState> | null>(null);
  const [existingIds, setExistingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (!componentId) return;
        
        const [comp, allComps] = await Promise.all([
          getAdminComponent(componentId),
          getAdminComponents()
        ]);
        
        if (comp) {
          const registryEntry = componentRegistry[comp.registry_id];

          setInitialState({
            id: comp.id,
            title: comp.title || "",
            description: comp.description || "",
            registry_id: comp.registry_id || "",
            source_type: comp.source_type || "react",
            snippets: comp.snippets || { html: "", css: "", react: "" },
            schema_definition: comp.schema_definition || [],
            status: comp.status || "draft",
            currentStep: 1,
            docs: registryEntry?.docs || {
              overview: comp.description || "",
              useCases: [],
              dependencies: [{ name: "framer-motion" }, { name: "lucide-react" }],
              setupInstructions: "npm install framer-motion lucide-react",
              usageExample: "",
              supportedProps: [],
              accessibilityNotes: "Accessible keyboard controls and semantic ARIA states.",
              relatedComponents: [],
            },
            seo: registryEntry?.seo || {
              seoTitle: `${comp.title} — Animated UI Component | UX With Motion`,
              metaDescription: comp.description || "",
            },
            publishedSource: comp.snippets?.react || "",
          });
        }
        
        setExistingIds(
          new Set(
            allComps
              .filter((c: { id: string; registry_id: string }) => c.id !== componentId)
              .map((c: { registry_id: string }) => c.registry_id)
          )
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load component");
      }
    }
    load();
  }, [componentId]);

  if (error) {
    return <div className="p-8 text-red-500 bg-[#F7F9FB] h-full">{error}</div>;
  }

  if (!initialState) return <div className="flex-1 bg-[#F7F9FB]" />;

  return (
    <div className="flex flex-col h-full bg-[#F7F9FB]">
      {/* Header */}
      <header className="h-[63px] bg-[#FBFCFD] border-b border-[#DEE1E4] px-8 flex items-center shrink-0">
        <Link
          href="/admin/components"
          className="mr-4 text-[#7D7F82] hover:text-[#454545] transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold text-[#454545]">Update {initialState.title || "Component"}</h1>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <BuilderProvider initialState={initialState}>
          <BuilderShell existingIds={existingIds} />
        </BuilderProvider>
      </div>
    </div>
  );
}
