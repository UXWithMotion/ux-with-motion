"use client";

import React, { useState } from "react";
import { useBuilder } from "../BuilderContext";
import { updateComponent, createComponent } from "@/lib/admin/components/mutations";
import { useRouter } from "next/navigation";
import { Rocket, Loader2, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, FileCode } from "lucide-react";
import { ComponentPreviewResolver } from "@/components/preview/ComponentPreviewResolver";
import { componentRegistry } from "@/lib/registry/components";
import Link from "next/link";

export function ReviewAndPublishStep() {
  const { state, updateState } = useBuilder();
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const registryEntry = state.registry_id ? componentRegistry[state.registry_id] : undefined;
  const hasTrustedRenderer = Boolean(registryEntry?.component);
  const isReact = state.source_type === "react" || state.source_type === "both";

  const isRendererValid = !isReact || hasTrustedRenderer;

  const handlePublish = async () => {
    if (!state.title.trim()) {
      setError("Component Name is required.");
      return;
    }
    if (!state.registry_id.trim()) {
      setError("Registry ID is required.");
      return;
    }
    if (isReact && !hasTrustedRenderer) {
      setError(`Cannot publish React component. Missing trusted registry renderer for ID: "${state.registry_id}". Register the component code in the repository first.`);
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const publishPayload = {
        title: state.title,
        description: state.description,
        registry_id: state.registry_id,
        source_type: state.source_type,
        snippets: state.snippets,
        schema_definition: state.schema_definition,
        status: "published" as const,
      };

      if (state.id) {
        await updateComponent(state.id, publishPayload);
      } else {
        const created = await createComponent(publishPayload);
        updateState({ id: created.id });
      }

      setPublished(true);
    } catch (err: any) {
      setError(err.message || "Failed to publish component.");
      setIsPublishing(false);
    }
  };

  if (published) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F7F9FB]">
        <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl p-10 text-center max-w-lg w-full shadow-sm flex flex-col items-center">
          <CheckCircle2 className="w-14 h-14 text-[#00963D] mb-4" />
          <h2 className="text-2xl font-bold text-[#1F2123] mb-2">
            {state.status === "published" ? "Changes Published!" : "Component Published Successfully!"}
          </h2>
          <p className="text-[#7D7F82] text-sm mb-6 leading-relaxed">
            &ldquo;{state.title}&rdquo; is now live at its canonical URL. Signed-out visitors can interact with the preview, and signed-in members can access the reviewed code.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <Link
              href={`/components/${state.registry_id}`}
              target="_blank"
              className="flex-1 w-full py-3 px-4 rounded-xl bg-[#1F2123] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => router.push("/admin/components")}
              className="flex-1 w-full py-3 px-4 rounded-xl border border-[#DEE1E4] text-[#454545] text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden h-full">
      {/* ── LEFT: Metadata Summary & Action ── */}
      <div className="flex-1 lg:max-w-[460px] bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl overflow-y-auto flex flex-col p-6 shadow-2xs">
        <div className="flex items-center gap-3 pb-5 border-b border-[#DEE1E4]">
          <div className="w-10 h-10 rounded-xl bg-[#F7F9FB] border border-[#DEE1E4] flex items-center justify-center text-[#DB7100]">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1F2123]">
              {state.status === "published" ? "Review & Publish Changes" : "Review & Publish"}
            </h2>
            <p className="text-xs text-[#7D7F82]">Verify metadata and release to production.</p>
          </div>
        </div>

        <div className="flex-1 py-5 flex flex-col gap-4">
          <div className="space-y-3 bg-white p-4 rounded-xl border border-[#DEE1E4] text-xs">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-[#7D7F82] font-medium">Display Name</span>
              <span className="text-[#1F2123] font-semibold">{state.title || "Untitled"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-[#7D7F82] font-medium">Canonical Slug</span>
              <span className="text-[#1F2123] font-mono font-medium">{state.registry_id || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-[#7D7F82] font-medium">Category</span>
              <span className="text-[#1F2123] font-semibold capitalize">{state.category || "inputs"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-[#7D7F82] font-medium">Source Type</span>
              <span className="text-[#1F2123] font-semibold">{state.source_type === "react" ? "React + Tailwind" : state.source_type}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-[#7D7F82] font-medium">Public URL</span>
              <span className="text-[#1F2123] font-mono truncate max-w-[200px]">/components/{state.registry_id}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#7D7F82] font-medium">Documentation</span>
              <span className="text-[#00963D] font-semibold">
                {state.docs?.overview ? "Configured" : "Minimal"}
              </span>
            </div>
          </div>

          {/* Trusted Renderer Check */}
          <div className="p-4 rounded-xl border border-[#DEE1E4] bg-white flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${hasTrustedRenderer ? "text-[#00963D]" : "text-amber-500"}`} />
              <span className="text-xs font-bold text-[#1F2123]">Renderer & Source Verification</span>
            </div>
            {hasTrustedRenderer ? (
              <p className="text-xs text-[#7D7F82] leading-relaxed">
                Trusted compiled renderer is verified in the codebase registry. Live interactive demo is ready for signed-out visitors.
              </p>
            ) : isReact ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  No matching React renderer found for ID &ldquo;{state.registry_id}&rdquo;. React components must be registered in the codebase before publication.
                </span>
              </div>
            ) : null}
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Publish Action */}
        <div className="pt-4 border-t border-[#DEE1E4] mt-auto">
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || !isRendererValid}
            className="w-full bg-[#1F2123] hover:bg-black text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>{state.status === "published" ? "Publish Changes" : "Publish Component"}</span>
            )}
          </button>
          <p className="text-center text-[#7D7F82] text-[11px] mt-2.5">
            Single-click publication immediately updates sitemaps and public caching.
          </p>
        </div>
      </div>

      {/* ── RIGHT: Signed-out Public Preview ── */}
      <div className="flex-1 bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl p-6 flex flex-col shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2123]">Public Page Preview</h2>
            <p className="text-sm text-[#7D7F82]">Signed-out visitor experience simulation.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EEF1F4] text-[#454545]">
            Signed-out view
          </span>
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
