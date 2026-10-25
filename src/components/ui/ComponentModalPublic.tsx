import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Copy, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { componentRegistry } from "@/lib/registry/components";
import { LivePreviewIframe } from "@/components/admin/preview/LivePreviewIframe";
import { useCustomization } from "@/components/providers/CustomizationProvider";

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
}

export function ComponentModalPublic({
  component,
  isOpen,
  onClose,
  isAuthenticated,
}: ComponentModalPublicProps) {
  const router = useRouter();
  const { getOverrides, setOverrides: updateGlobalOverrides, saveOverrides } = useCustomization();

  const [copied, setCopied] = useState<string | false>(false);
  const [prevComponentId, setPrevComponentId] = useState(component.id);
  const [overrides, setOverrides] = useState<Record<string, string>>(() => getOverrides(component.id));

  // Reset overrides when a new component is opened without triggering cascading effect renders
  if (component.id !== prevComponentId) {
    setPrevComponentId(component.id);
    setOverrides(getOverrides(component.id));
  }

  const handleOverrideChange = (key: string, value: string) => {
    const newOverrides = { ...overrides, [key]: value };
    setOverrides(newOverrides);
    updateGlobalOverrides(component.id, newOverrides);
  };

  const handleReset = () => {
    setOverrides({});
    updateGlobalOverrides(component.id, {});
  };

  const handleClose = () => {
    saveOverrides(component.id, overrides);
    onClose();
  };

  const registryEntry = componentRegistry[component.registry_id];

  const schemaDefToUse = useMemo(() => {
    return (component.schema_definition && component.schema_definition.length > 0)
      ? component.schema_definition
      : (registryEntry?.schema_definition || []);
  }, [component.schema_definition, registryEntry]);

  const liveSchema = useMemo(() => {
    return schemaDefToUse.map((config: any) => ({
      ...config,
      defaultValue: overrides[config.variable] !== undefined ? overrides[config.variable] : config.defaultValue
    }));
  }, [schemaDefToUse, overrides]);

  // Extract just the CSS variable overrides
  const activeOverrides = useMemo(() => {
    const active: Record<string, string> = {};
    schemaDefToUse.forEach((config: any) => {
      const val = overrides[config.variable] !== undefined ? overrides[config.variable] : config.defaultValue;
      if (config.variable) {
        active[config.variable] = val;
      }
    });
    return active;
  }, [schemaDefToUse, overrides]);

  const overrideStyleBlock = useMemo(() => {
    if (Object.keys(activeOverrides).length === 0) return "";
    return `\n\n<style>\n:root {\n${Object.entries(activeOverrides).map(([k,v]) => `  ${k}: ${v};`).join('\n')}\n}\n</style>`;
  }, [activeOverrides]);

  // User must be authenticated to view or copy source code during public beta
  const isLocked = isAuthenticated !== undefined ? !isAuthenticated : !!component.is_locked;
  
  // Fallback to registry if DB doesn't have snippets and it hasn't been locked
  const snippets = isLocked
    ? { html: "", css: "", nextjs: "" }
    : (component.snippets || registryEntry?.snippets || { html: "", css: "", nextjs: "" });

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
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-[#1F2123]/30 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-10 pointer-events-none">
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
                        <div style={activeOverrides as React.CSSProperties} className="w-full h-full flex items-center justify-center">
                          <RegistryComponent />
                        </div>
                      );
                    }

                    const hasHtmlCss = snippets?.html || snippets?.css;
                    if (hasHtmlCss && component.source_type !== "react") {
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <LivePreviewIframe 
                            sourceType={(component.source_type as "react" | "html_css" | "both") || "html_css"}
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
                        <span className="text-xs">This component requires a trusted registry renderer.</span>
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
                    <h2 className="font-sans font-medium text-[24px] md:text-[31px] text-[#454545] leading-[1.2]">
                      {component.title}
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="size-[32px] flex items-center justify-center text-[#7D7F82] hover:text-black transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </div>



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

                        const hasCustomization = Object.keys(activeOverrides).length > 0;
                        const codeToCopy = nextjsCode;

                        return (
                          <div className="flex flex-col gap-4">
                            {hasCustomization && (
                              <div className="bg-[#FDF8F0] border border-[#F3E2C6] rounded-[8px] p-4 flex items-start gap-3">
                                <span className="text-[#C18824] shrink-0 text-lg">💡</span>
                                <p className="text-[#A0701C] text-[13px] leading-relaxed">
                                  <strong>Customization applied via CSS variables.</strong> The Next.js code below is the authoritative structural source. 
                                  To use your customizations, apply the CSS variables to the component&apos;s container in your global CSS.
                                </p>
                              </div>
                            )}
                            
                            <div className="relative group">
                              <div className="absolute top-4 right-4 flex items-center">
                                <button
                                  onClick={() => copyToClipboard(codeToCopy, "nextjs")}
                                  className="flex items-center gap-2 bg-white/90 backdrop-blur border border-[#DEE1E4] hover:bg-white text-[#3D3D3D] px-3 py-1.5 rounded-full shadow-sm transition-all"
                                  title="Copy Next.js Code"
                                >
                                  {copied === "nextjs" ? (
                                    <>
                                      <Check size={14} className="text-green-500" />
                                      <span className="text-[12px] font-medium text-green-600">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={14} />
                                      <span className="text-[12px] font-medium">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="bg-[#F7F9FB] border border-[#DEE1E4] rounded-[16px] p-[24px] overflow-x-auto text-[13px] font-mono leading-relaxed text-[#454545] whitespace-pre">
                                <code>{codeToCopy}</code>
                              </pre>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {snippets.figma && (
                        <div className="border border-[#DEE1E4] rounded-[53px] px-[24px] py-[16px] w-full flex items-center justify-between bg-[#FBFCFD] hover:bg-[#F7F9FB] transition-colors cursor-pointer" onClick={() => copyToClipboard(snippets.figma, "figma")}>
                          <span className="font-sans font-medium text-[17.28px] text-[#3D3D3D]">Figma Link</span>
                          <div className="flex items-center gap-[10px]">
                            <span className="text-[#B0B0B0] text-[17.28px]">|</span>
                            {copied === "figma" ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-[#3D3D3D]" />}
                          </div>
                        </div>
                      )}

                      {snippets.prompt && (
                        <div className="border border-[#DEE1E4] rounded-[53px] px-[24px] py-[16px] w-full flex items-center justify-between bg-[#FBFCFD] hover:bg-[#F7F9FB] transition-colors cursor-pointer" onClick={() => copyToClipboard(snippets.prompt, "prompt")}>
                          <span className="font-sans font-medium text-[17.28px] text-[#3D3D3D]">Prompt</span>
                          <div className="flex items-center gap-[10px]">
                            <span className="text-[#B0B0B0] text-[17.28px]">|</span>
                            {copied === "prompt" ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-[#3D3D3D]" />}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

