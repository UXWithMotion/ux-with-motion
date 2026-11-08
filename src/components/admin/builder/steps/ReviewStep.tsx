"use client";

import React, { useState, useMemo } from "react";
import { useBuilder } from "../BuilderContext";
import { LivePreviewIframe } from "../../preview/LivePreviewIframe";
import { componentRegistry } from "@/lib/registry/components";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function ReviewStep() {
  const { state } = useBuilder();
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const activeOverrides = useMemo(() => {
    const active: Record<string, string> = {};
    (state.schema_definition || []).forEach((config: any) => {
      const val = overrides[config.id] !== undefined ? overrides[config.id] : config.defaultValue;
      if (config.variable) {
        active[config.variable] = val;
      }
    });
    return active;
  }, [state.schema_definition, overrides]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row items-start gap-6 p-4 md:p-8 min-h-0 overflow-hidden w-full bg-[#F7F9FB]">
      
      {/* Left Panel: Configuration Fields */}
      <div className="flex-1 w-full lg:max-w-[420px] xl:max-w-[480px] h-[500px] lg:h-full bg-[#FBFCFD] border border-[#DEE1E4] shadow-sm rounded-2xl flex flex-col overflow-hidden">
        <div className="p-6 pb-5 shrink-0 border-b border-[#DEE1E4] bg-[#FBFCFD]">
          <h2 className="font-bold text-[20px] text-[#454545] mb-1">Component Properties</h2>
          <p className="text-[14px] text-[#7D7F82]">
            Test and tweak your configurable properties.
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#FAFAFA]">
          {(state.schema_definition || []).length === 0 ? (
            <div className="text-center text-[#7D7F82] text-[14px] p-8 border-2 border-dashed border-[#DEE1E4] rounded-xl bg-[#FBFCFD]">
              No properties configured. Go back to Step 2 to connect elements.
            </div>
          ) : (
            (state.schema_definition || []).map((config: any) => (
              <div key={config.id} className="flex flex-col gap-2.5">
                <label className="font-semibold text-[#454545] text-[14px] flex items-center justify-between">
                  <span>{config.label}</span>
                  {config.source === "unbound" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0E0] text-[#D46B08] uppercase tracking-wider border border-[#FFD591]">
                      Unbound
                    </span>
                  )}
                </label>
                
                {config.type === "color" ? (
                  (() => {
                    let rawVal = overrides[config.id] !== undefined ? overrides[config.id] : config.defaultValue;
                    let hexVal = rawVal;
                    if (hexVal.startsWith('[')) hexVal = hexVal.slice(1, -1);
                    if (hexVal.includes('#')) hexVal = '#' + hexVal.split('#')[1].replace(/\]/g, '');
                    hexVal = hexVal.slice(0, 7) || "#000000";

                    return (
                      <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-xl px-3 py-2 flex items-center gap-3 focus-within:border-[#111111] focus-within:ring-1 focus-within:ring-[#111111] transition-all shadow-sm">
                        <div className="relative shrink-0 flex">
                          <input
                            type="color"
                            value={hexVal.startsWith('#') ? hexVal : '#000000'}
                            onChange={(e) => setOverrides(prev => ({ ...prev, [config.id]: e.target.value }))}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                          />
                          <div 
                            className="w-7 h-7 rounded-lg border border-[#0000001A] pointer-events-none shadow-sm" 
                            style={{ backgroundColor: hexVal.startsWith('#') ? hexVal : '#000000' }} 
                          />
                        </div>
                        <input
                          type="text"
                          value={rawVal}
                          onChange={(e) => setOverrides(prev => ({ ...prev, [config.id]: e.target.value }))}
                          className="font-['IBM_Plex_Mono',monospace] text-[#454545] text-[14px] outline-none flex-1 min-w-0 bg-transparent"
                        />
                      </div>
                    );
                  })()
                ) : config.type === "number" ? (
                  (() => {
                    let rawVal = overrides[config.id] !== undefined ? overrides[config.id] : config.defaultValue;
                    let numVal = parseInt(String(rawVal).replace(/[^0-9-]/g, '')) || 0;
                    return (
                      <div className="flex items-center gap-4 bg-[#FBFCFD] p-3 rounded-xl border border-[#DEE1E4] shadow-sm">
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={numVal}
                          onChange={(e) => setOverrides(prev => ({ ...prev, [config.id]: `${e.target.value}px` }))}
                          className="flex-1 accent-[#111111] h-1.5 bg-[#EEF1F4] rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#111111] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md transition-all"
                        />
                        <div className="relative w-[72px]">
                          <input
                            type="text"
                            value={rawVal}
                            onChange={(e) => setOverrides(prev => ({ ...prev, [config.id]: e.target.value }))}
                            className="font-['IBM_Plex_Mono',monospace] bg-[#F7F9FB] border border-[#DEE1E4] rounded-lg px-2 py-1.5 text-[#454545] text-[14px] w-full text-center outline-none focus:border-[#111111]"
                          />
                        </div>
                      </div>
                    );
                  })()
                ) : config.type === "select" ? (
                  <div className="relative">
                    <select 
                      value={overrides[config.id] !== undefined ? overrides[config.id] : config.defaultValue}
                      onChange={(e) => setOverrides(prev => ({ ...prev, [config.id]: e.target.value }))}
                      className="bg-[#FBFCFD] border border-[#DEE1E4] shadow-sm rounded-xl px-4 py-2.5 outline-none text-[#454545] text-[14px] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all w-full appearance-none cursor-pointer"
                    >
                      {(config.options || [config.defaultValue]).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7D7F82]">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                ) : config.type === "boolean" ? (
                  (() => {
                    const isChecked = String(overrides[config.id] !== undefined ? overrides[config.id] : config.defaultValue) === 'true';
                    return (
                      <div 
                        className="flex items-center justify-between cursor-pointer bg-[#FBFCFD] border border-[#DEE1E4] rounded-xl px-4 py-3 shadow-sm hover:border-[#C4C7C8] transition-colors"
                        onClick={() => setOverrides(prev => ({ ...prev, [config.id]: String(!isChecked) }))}
                      >
                        <span className="text-[14px] text-[#454545] font-medium select-none">
                          {isChecked ? 'Enabled' : 'Disabled'}
                        </span>
                        <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${isChecked ? 'bg-[#111111]' : 'bg-[#EEF1F4]'}`}>
                          <motion.div 
                            className="absolute top-1 left-1 bg-[#FBFCFD] w-4 h-4 rounded-full shadow-sm"
                            layout
                            animate={{ x: isChecked ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <input 
                    type="text" 
                    value={overrides[config.id] !== undefined ? overrides[config.id] : config.defaultValue}
                    onChange={(e) => setOverrides(prev => ({ ...prev, [config.id]: e.target.value }))}
                    className="bg-[#FBFCFD] border border-[#DEE1E4] shadow-sm rounded-xl px-4 py-2.5 outline-none text-[#454545] text-[14px] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all w-full font-['IBM_Plex_Mono',monospace]"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="flex-1 w-full h-[500px] min-h-[400px] lg:h-full bg-[#FBFCFD] border border-[#DEE1E4] shadow-sm rounded-2xl flex flex-col overflow-auto relative">
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg border border-[#DEE1E4] shadow-sm flex items-center gap-2 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[#00963D] animate-pulse" />
          <span className="text-xs font-semibold text-[#454545]">Live Preview</span>
        </div>
        <div className="w-full min-h-full bg-[#F7F9FB] flex items-center justify-center p-8">
          {(() => {
            const RegistryComponent = componentRegistry[state.registry_id]?.component;
            if (RegistryComponent && (state.source_type === "react" || state.source_type === "both")) {
              return <RegistryComponent {...activeOverrides} />;
            }
            return (
              <LivePreviewIframe 
                sourceType={state.source_type} 
                snippets={state.snippets} 
                overrides={activeOverrides}
                schemaDefinition={state.schema_definition}
                className="w-full h-full border-none"
              />
            );
          })()}
        </div>
      </div>

    </div>
  );
}

