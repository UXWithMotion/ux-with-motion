"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { componentRegistry } from "@/lib/registry/components";
import { LivePreviewIframe } from "@/components/admin/preview/LivePreviewIframe";
import { AlertCircle, RefreshCw, Info } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class PreviewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ComponentPreviewResolver error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="font-semibold text-sm">Preview Render Error</p>
            <p className="text-xs text-red-500 mt-1 max-w-sm">{this.state.error?.message || "An unexpected error occurred."}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export interface ComponentPreviewResolverProps {
  registryId?: string;
  sourceType?: "react" | "html_css" | "both";
  snippets?: {
    react?: string;
    html?: string;
    css?: string;
  };
  controlsValues?: Record<string, any>;
  publishedSource?: string;
  onResetControls?: () => void;
  className?: string;
  containerBg?: string;
}

export function ComponentPreviewResolver({
  registryId,
  sourceType = "react",
  snippets,
  controlsValues = {},
  publishedSource,
  onResetControls,
  className = "",
  containerBg = "bg-[#FBFCFD]",
}: ComponentPreviewResolverProps) {
  const registryEntry = registryId ? componentRegistry[registryId] : undefined;
  const ComponentToRender = registryEntry?.component;

  // Check if draft code has changed from published source
  const isDraftModified = React.useMemo(() => {
    if (!snippets?.react || !publishedSource) return false;
    const normalize = (str: string) => str.replace(/\s+/g, " ").trim();
    return normalize(snippets.react) !== normalize(publishedSource);
  }, [snippets?.react, publishedSource]);

  // Determine if we should show a version status banner
  const renderStatusNotice = () => {
    if (!isDraftModified && ComponentToRender) return null;

    if (isDraftModified && ComponentToRender) {
      return (
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/95 border border-amber-200 text-amber-800 text-xs shadow-xs backdrop-blur-xs">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span className="truncate">
            <strong className="font-semibold">Previewing the published version.</strong> Editor changes will be compiled into the registry upon publishing.
          </span>
        </div>
      );
    }

    if (!ComponentToRender && (sourceType === "react" || sourceType === "both")) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-semibold text-sm text-gray-700">Preview unavailable for these changes</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            No compiled React renderer found for registry ID &ldquo;{registryId || "unassigned"}&rdquo;.
            Save and publish to register the compiled preview.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <PreviewErrorBoundary>
      <div className={`relative w-full h-full flex flex-col items-center justify-center ${containerBg} overflow-hidden ${className}`}>
        {renderStatusNotice()}

        {ComponentToRender && (sourceType === "react" || sourceType === "both") ? (
          <div className="w-full h-full flex items-center justify-center p-6 md:p-8">
            <ComponentToRender {...controlsValues} />
          </div>
        ) : (sourceType === "html_css" || (!ComponentToRender && snippets?.html)) ? (
          <LivePreviewIframe
            sourceType={sourceType}
            snippets={snippets || {}}
            className="w-full h-full border-none"
          />
        ) : (
          renderStatusNotice() || (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <p className="text-sm">No preview available</p>
            </div>
          )
        )}
      </div>
    </PreviewErrorBoundary>
  );
}
