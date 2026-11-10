"use client";

import React, { useMemo } from "react";
import { useBuilder } from "../BuilderContext";
import { componentRegistry } from "@/lib/registry/components";
import { ComponentPreviewResolver } from "@/components/preview/ComponentPreviewResolver";
import { Sliders, RotateCcw, Check, Info } from "lucide-react";
import { ComponentControlDefinition } from "@/lib/registry/types";

export function PreviewAndControlsStep() {
  const { state, updateState } = useBuilder();

  // Author-declared controls for this component from the registry
  const declaredControls: ComponentControlDefinition[] = useMemo(() => {
    const entry = componentRegistry[state.registry_id];
    return entry?.controls || [];
  }, [state.registry_id]);

  const currentValues = state.controls_values || {};

  const handleControlChange = (name: string, value: any) => {
    updateState({
      controls_values: {
        ...currentValues,
        [name]: value,
      },
    });
  };

  const handleResetControls = () => {
    const resetVals: Record<string, any> = {};
    declaredControls.forEach((ctrl) => {
      resetVals[ctrl.name] = ctrl.defaultValue;
    });
    updateState({ controls_values: resetVals });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden h-full">
      {/* ── LEFT: Author-Declared Controls ── */}
      <div className="flex-1 lg:max-w-[460px] bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl overflow-y-auto flex flex-col p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#DEE1E4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EEF1F4] flex items-center justify-center text-[#1F2123]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2123]">Preview & Controls</h2>
              <p className="text-xs text-[#7D7F82]">Test component props declared in code</p>
            </div>
          </div>

          {declaredControls.length > 0 && (
            <button
              type="button"
              onClick={handleResetControls}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DEE1E4] text-xs font-semibold text-[#454545] hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        <div className="flex-1 py-6 flex flex-col gap-5">
          {declaredControls.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-[#DEE1E4] bg-white text-center flex flex-col items-center gap-2">
              <Info className="w-6 h-6 text-[#7D7F82]" />
              <p className="text-sm font-semibold text-[#1F2123]">No Author Controls Declared</p>
              <p className="text-xs text-[#7D7F82] max-w-[280px]">
                This component does not define customizable props in its code declaration. It will render in its standard default configuration.
              </p>
            </div>
          ) : (
            declaredControls.map((ctrl) => {
              const val = currentValues[ctrl.name] !== undefined ? currentValues[ctrl.name] : ctrl.defaultValue;

              return (
                <div key={ctrl.name} className="p-4 rounded-xl border border-[#DEE1E4] bg-white flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#1F2123]">{ctrl.label}</label>
                    <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#EEF1F4] text-[#454545]">
                      {ctrl.name}
                    </code>
                  </div>

                  {ctrl.description && <p className="text-xs text-[#7D7F82]">{ctrl.description}</p>}

                  {/* Text control */}
                  {ctrl.type === "text" && (
                    <input
                      type="text"
                      value={val ?? ""}
                      onChange={(e) => handleControlChange(ctrl.name, e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none"
                    />
                  )}

                  {/* Boolean control */}
                  {ctrl.type === "boolean" && (
                    <button
                      type="button"
                      onClick={() => handleControlChange(ctrl.name, !val)}
                      className={`w-full py-2.5 px-3.5 rounded-lg border flex items-center justify-between text-xs font-semibold transition-colors ${
                        val
                          ? "bg-[#1F2123] border-[#1F2123] text-white"
                          : "bg-[#F7F9FB] border-[#DEE1E4] text-[#454545] hover:bg-gray-100"
                      }`}
                    >
                      <span>Enabled</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          val ? "bg-white text-black" : "border border-gray-300"
                        }`}
                      >
                        {val && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  )}

                  {/* Enum control */}
                  {ctrl.type === "enum" && ctrl.options && (
                    <select
                      value={val}
                      onChange={(e) => handleControlChange(ctrl.name, e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#DEE1E4] text-sm focus:border-[#1F2123] outline-none bg-white cursor-pointer"
                    >
                      {ctrl.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: Preview Resolver ── */}
      <div className="flex-1 bg-[#FBFCFD] border border-[#DEE1E4] rounded-2xl p-6 flex flex-col shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2123]">Live Demo Preview</h2>
            <p className="text-sm text-[#7D7F82]">Real-time rendering responding to declared author controls.</p>
          </div>
        </div>

        <div className="flex-1 bg-[#F9F9F9] rounded-xl border border-[#DEE1E4] overflow-hidden relative">
          <ComponentPreviewResolver
            registryId={state.registry_id}
            sourceType={state.source_type}
            snippets={state.snippets}
            controlsValues={state.controls_values}
            publishedSource={state.publishedSource}
            onResetControls={handleResetControls}
          />
        </div>
      </div>
    </div>
  );
}
