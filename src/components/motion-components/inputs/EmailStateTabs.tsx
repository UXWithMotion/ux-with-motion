"use client";

import { useId } from "react";
import { EMAIL_STATES, EmailState } from "./EmailInput";

interface EmailStateTabsProps {
  value: EmailState;
  onChange: (state: EmailState) => void;
  panelId?: string;
}

export function EmailStateTabs({ value, onChange, panelId }: EmailStateTabsProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-3">
      <p id={`${id}-label`} className="text-sm font-semibold text-[#454545]">Choose the state</p>
      <div role="tablist" aria-labelledby={`${id}-label`} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {EMAIL_STATES.map((state, index) => (
          <button
            key={state}
            type="button"
            role="tab"
            aria-selected={value === state}
            aria-controls={panelId}
            tabIndex={value === state ? 0 : -1}
            onClick={() => onChange(state)}
            onKeyDown={(event) => {
              let next: number | undefined;
              if (event.key === "ArrowRight") next = (index + 1) % EMAIL_STATES.length;
              if (event.key === "ArrowLeft") next = (index + EMAIL_STATES.length - 1) % EMAIL_STATES.length;
              if (event.key === "Home") next = 0;
              if (event.key === "End") next = EMAIL_STATES.length - 1;
              if (next !== undefined) {
                event.preventDefault();
                onChange(EMAIL_STATES[next]);
                const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
                tabs?.[next]?.focus();
              }
            }}
            className={`rounded-xl border px-3 py-2.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#626467] ${value === state ? "border-[#1F2123] bg-[#1F2123] text-white" : "border-[#DEE1E4] bg-white text-[#626467] hover:bg-[#EEF1F4]"}`}
          >{state}</button>
        ))}
      </div>
    </div>
  );
}
