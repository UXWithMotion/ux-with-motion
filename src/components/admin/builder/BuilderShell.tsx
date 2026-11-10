"use client";

import React, { useState, useEffect } from "react";
import { useBuilder } from "./BuilderContext";
import { StepIndicator } from "./StepIndicator";
import { CodeAndDetailsStep } from "./steps/CodeAndDetailsStep";
import { PreviewAndControlsStep } from "./steps/PreviewAndControlsStep";
import { DocsAndSeoStep } from "./steps/DocsAndSeoStep";
import { ReviewAndPublishStep } from "./steps/ReviewAndPublishStep";
import { createComponent, saveDraftOrUpdate } from "@/lib/admin/components/mutations";
import { getComponentDraft, discardComponentDraft } from "@/lib/admin/components/drafts";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Sparkles, Trash2 } from "lucide-react";

export function BuilderShell({ existingIds }: { existingIds: Set<string> }) {
  const { state, updateState, nextStep, prevStep, isSaving, setIsSaving } = useBuilder();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  // Check for stored draft on component load
  useEffect(() => {
    if (!state.id) return;
    let isCancelled = false;

    async function loadDraft() {
      try {
        const draft = await getComponentDraft(state.id!);
        if (draft && !isCancelled) {
          updateState({
            title: draft.title || state.title,
            description: draft.description || state.description,
            registry_id: draft.registry_id || state.registry_id,
            source_type: draft.source_type || state.source_type,
            snippets: draft.snippets || state.snippets,
            controls_values: draft.controls_values || state.controls_values,
            docs: (draft.docs as any) || state.docs,
            seo: (draft.seo as any) || state.seo,
          });
          setDraftNotice(`Loaded private draft changes from ${new Date(draft.updated_at).toLocaleTimeString()}`);
        }
      } catch (e) {
        console.warn("Could not check draft storage:", e);
      }
    }

    loadDraft();
    return () => {
      isCancelled = true;
    };
  }, [state.id]);

  const handleDiscardDraft = async () => {
    if (!state.id) return;
    try {
      await discardComponentDraft(state.id);
      setDraftNotice(null);
      router.refresh();
    } catch (e) {
      console.error("Failed to discard draft:", e);
    }
  };

  const handleSaveDraft = async (proceedToNext: boolean) => {
    if (!state.title.trim()) {
      setError("Component Name is required.");
      return;
    }
    if (!state.registry_id.trim()) {
      setError("Registry ID is required.");
      return;
    }
    if (!state.id && existingIds.has(state.registry_id)) {
      setError(`A component with registry ID "${state.registry_id}" already exists.`);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      if (state.id) {
        // Save draft or update privately
        await saveDraftOrUpdate(state.id, {
          title: state.title,
          description: state.description,
          registry_id: state.registry_id,
          source_type: state.source_type,
          snippets: state.snippets,
          schema_definition: state.schema_definition,
          controls_values: state.controls_values,
          docs: state.docs,
          seo: state.seo,
          status: state.status,
        });
        if (proceedToNext) nextStep();
      } else {
        // Create new draft
        const result = await createComponent({
          title: state.title,
          description: state.description,
          registry_id: state.registry_id,
          source_type: state.source_type,
          snippets: state.snippets,
          schema_definition: state.schema_definition,
          status: "draft",
          type: "component",
          order: 0,
        });

        updateState({ id: result.id });
        if (proceedToNext) {
          nextStep();
        }
        router.push(`/admin/components/${result.id}/edit`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <CodeAndDetailsStep />;
      case 2:
        return <PreviewAndControlsStep />;
      case 3:
        return <DocsAndSeoStep />;
      case 4:
        return <ReviewAndPublishStep />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F9FB]">
      <StepIndicator />

      {draftNotice && (
        <div className="mx-8 mt-4 px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{draftNotice} (unpublished)</span>
          </div>
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="flex items-center gap-1 text-xs text-blue-700 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-blue-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Discard Draft
          </button>
        </div>
      )}

      {error && (
        <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold px-2">
            ×
          </button>
        </div>
      )}

      {renderStep()}

      {/* Footer Controls */}
      <div className="h-[72px] bg-[#FBFCFD] border-t border-[#DEE1E4] px-8 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex gap-3 items-center">
          {state.currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 rounded-xl border border-[#DEE1E4] text-[#454545] font-semibold text-xs hover:bg-gray-100 transition-colors"
            >
              Previous Step
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSaveDraft(false)}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-[#DEE1E4] text-[#454545] font-semibold text-xs hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Draft"}
          </button>
        </div>

        <div className="flex items-center gap-4">
          {state.status === "published" && (
            <div className="flex items-center gap-2 mr-2">
              <span className="w-2 h-2 rounded-full bg-[#00963D] animate-pulse" />
              <span className="text-[#00963D] font-semibold text-xs">Live on Website</span>
            </div>
          )}

          {state.currentStep < 4 ? (
            <button
              type="button"
              onClick={() => handleSaveDraft(true)}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#1F2123] text-white font-semibold text-xs hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-2 shadow-xs"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save & Continue"}
            </button>
          ) : (
            <span className="text-xs text-[#7D7F82] font-medium">Ready for review & publish</span>
          )}
        </div>
      </div>
    </div>
  );
}
