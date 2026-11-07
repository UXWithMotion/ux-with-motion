"use client";

import { EmailInputPreview } from "../../preview/EmailInputPreview";

import React, { useState } from "react";
import { useBuilder } from "../BuilderContext";
import { updateComponent } from "@/lib/admin/components/mutations";
import { useRouter } from "next/navigation";
import { Rocket, Loader2, CheckCircle2 } from "lucide-react";
import { LivePreviewIframe } from "../../preview/LivePreviewIframe";

export function PublishStep() {
  const { state } = useBuilder();
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  // Extract default values for the preview
  const defaultOverrides = React.useMemo(() => {
    const defaults: Record<string, string> = {};
    (state.schema_definition || []).forEach((config: any) => {
      if (config.variable) {
        defaults[config.variable] = config.defaultValue;
      }
    });
    return defaults;
  }, [state.schema_definition]);

  const handlePublish = async () => {
    if (!state.id) {
      setError("Cannot publish a component that hasn't been saved yet.");
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      await updateComponent(state.id, {
        status: "published",
        schema_definition: state.schema_definition
      });
      setPublished(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/components");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to publish component.");
      setIsPublishing(false);
    }
  };

  if (published) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl p-12 text-center max-w-md w-full shadow-sm flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-[#00963D] mb-6" />
          <h2 className="text-2xl font-bold text-[#454545] mb-3">
            {state.status === "published" ? "Changes Saved!" : "Published Successfully!"}
          </h2>
          <p className="text-[#7D7F82] mb-8">
            {state.status === "published" 
              ? `Your updates to "${state.title}" are now live.`
              : `Your component "${state.title}" is now live and available on the public components page.`}
          </p>
          <div className="flex items-center gap-2 text-[#7D7F82]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Redirecting to components list...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-start gap-6 p-8 min-h-0 overflow-hidden w-full">
      
      {/* Left Panel: Summary & Publish Action */}
      <div className="flex-1 max-w-[400px] h-full bg-[#FBFCFD] border border-[#DEE1E4] rounded-xl flex flex-col overflow-hidden">
        <div className="p-8 flex flex-col h-full overflow-y-auto">
          
          <div className="flex-1 shrink-0">
            <div className="w-12 h-12 bg-[#F7F9FB] rounded-full flex items-center justify-center mb-6">
              <Rocket className="w-6 h-6 text-[#DB7100]" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#454545] mb-4">
              {state.status === "published" ? "Review Changes" : "Ready to Publish"}
            </h2>
            
            <p className="text-[#7D7F82] mb-8 leading-relaxed">
              {state.status === "published" 
                ? "This component is already live. Saving these changes will immediately update the public components library."
                : "Your component is fully configured. Publishing will make it instantly available in the public components library for users to browse, customize, and copy."}
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-[#DEE1E4]">
                <span className="text-[#7D7F82] font-medium">Component Name</span>
                <span className="text-[#454545] font-semibold">{state.title || "Untitled Component"}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#DEE1E4]">
                <span className="text-[#7D7F82] font-medium">Configurable Elements</span>
                <span className="text-[#454545] font-semibold">{(state.schema_definition || []).length}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#DEE1E4]">
                <span className="text-[#7D7F82] font-medium">Source Code Type</span>
                <span className="text-[#454545] font-semibold">{state.source_type === "react" ? "React + Tailwind" : "HTML & CSS"}</span>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
          </div>

          <div className="pt-6 shrink-0 mt-auto">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full bg-[#1F2123] hover:bg-[#333537] text-white py-4 rounded-xl font-bold text-[16px] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {state.status === "published" ? "Saving..." : "Publishing..."}
                </>
              ) : (
                <>
                  {state.status === "published" ? "Save Changes" : "Publish Component"}
                </>
              )}
            </button>
            <p className="text-center text-[#7D7F82] text-[13px] mt-4">
              {state.status === "published" 
                ? "You can unpublish or edit this component later from the dashboard."
                : "You can unpublish or edit this component later from the dashboard."}
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Final Preview */}
      <div className="flex-1 h-full bg-[#FAFAFA] border border-[#DEE1E4] rounded-xl flex flex-col overflow-hidden relative">
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-[#DEE1E4] px-4 py-2 rounded-lg z-10 shadow-sm pointer-events-none">
          <span className="font-semibold text-[13px] text-[#7D7F82]">Final Live Preview</span>
        </div>
{state.registry_id === "email-input" ? <EmailInputPreview /> : (
        <LivePreviewIframe 
          sourceType={state.source_type} 
          snippets={state.snippets}
          overrides={defaultOverrides}
          schemaDefinition={state.schema_definition}
          className="w-full h-full border-none"
        />
)}
      </div>

    </div>
  );
}

