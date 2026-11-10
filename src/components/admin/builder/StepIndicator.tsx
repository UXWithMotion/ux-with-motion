"use client";

import React from "react";
import { useBuilder } from "./BuilderContext";

const STEPS = [
  { id: 1, label: "Code & Details" },
  { id: 2, label: "Preview & Controls" },
  { id: 3, label: "Docs & SEO" },
  { id: 4, label: "Review & Publish" },
];

export function StepIndicator() {
  const { state, setStep } = useBuilder();
  const { currentStep } = state;

  return (
    <div className="w-full pb-[8px] pt-[16px] px-[32px] border-b border-[#DEE1E4] bg-[#F7F9FB] flex items-center gap-[16px] overflow-x-auto">
      {STEPS.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isLast = index === STEPS.length - 1;

        let pillBg = "bg-[#FBFCFD]";
        let pillBorder = "border-[#DEE1E4]";
        let pillText = "text-[#454545]";

        if (isCurrent) {
          pillBg = "bg-[#ffcea2]";
          pillBorder = "border-[#db7100]";
          pillText = "text-[#db7100]";
        } else if (isCompleted) {
          pillBg = "bg-[#dee1e4]";
          pillBorder = "border-[#DEE1E4]";
          pillText = "text-[#454545]";
        }

        return (
          <div key={step.id} className="flex gap-[8px] items-center shrink-0">
            {/* Pill Badge */}
            <button
              type="button"
              onClick={() => setStep(step.id)}
              className={`flex items-start px-[10px] py-[4px] rounded-[12px] border border-solid shrink-0 transition-colors cursor-pointer ${pillBg} ${pillBorder}`}
            >
              <span
                className={`font-semibold text-[12px] leading-normal whitespace-nowrap ${pillText}`}
              >
                {step.id}. {step.label}
              </span>
            </button>

            {/* Separator Chevron */}
            {!isLast && (
              <span className="font-normal text-[12px] leading-normal text-[#7D7F82] whitespace-nowrap">
                &gt;
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
