"use client";

import { useId, useState } from "react";

export const EMAIL_STATES = ["Default", "Filled", "Hover", "Focused", "Error", "Success", "Disabled", "Read-only"] as const;
export type EmailState = (typeof EMAIL_STATES)[number];

export function isEmailState(value: unknown): value is EmailState {
  return EMAIL_STATES.some((state) => state === value);
}

export interface EmailInputProps {
  state?: EmailState;
  className?: string;
  onValueChange?: (value: string) => void;
}

const borders: Record<EmailState, string> = {
  Default: "border-[#D8DEE9]", Filled: "border-[#626467]",
  Hover: "border-[#A3AEC1]", Focused: "border-[#626467]",
  Error: "border-[#E5484D]", Success: "border-[#16A36A]",
  Disabled: "border-[#D5DCE5]", "Read-only": "border-[#B8C2D1]",
};

// The keyed field resets the demo fixture only when the chosen state changes.
export function EmailInput({ state = "Default", ...props }: EmailInputProps) {
  return <EmailField key={state} state={state} {...props} />;
}

function EmailField({ state = "Default", className = "", onValueChange }: EmailInputProps) {
  const id = useId();
  const disabled = state === "Disabled";
  const readOnly = state === "Read-only";
  const [value, setValue] = useState(["Default", "Hover", "Focused"].includes(state) ? "" : state === "Error" ? "Rakesh@uxwithmotion" : "Rakesh@uxwithmotion.com");
  const [visualState, setVisualState] = useState<EmailState>(state);
  const [focused, setFocused] = useState(false);
  const [edited, setEdited] = useState(false);
  const invalid = visualState === "Error";
  const background = disabled ? "bg-[#F1F3F6]" : readOnly ? "bg-[#F8FAFC]" : "bg-white";

  return (
    <div className={`w-[404px] max-w-full font-sans font-medium ${className}`} data-email-state={visualState}>
      <div
        className={`relative flex flex-col justify-center gap-[4px] overflow-hidden rounded-[12px] border px-[15px] leading-[1.2] transition-colors duration-150 motion-reduce:transition-none ${value ? "h-[60px]" : "h-[58px]"} ${background} ${borders[visualState]} ${readOnly ? "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#626467]" : ""}`}
        onMouseEnter={() => { if (!disabled && !readOnly && !focused && !value) setVisualState("Hover"); }}
        onMouseLeave={() => { if (!disabled && !readOnly && !focused && !value) setVisualState(state === "Hover" ? "Hover" : "Default"); }}
      >
        <label htmlFor={id} className={value ? "truncate text-[12px] text-[#98A2B3]" : "sr-only"}>Email Id</label>
        <input
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          value={value}
          placeholder="Email Id"
          className={`block w-full min-w-0 truncate border-0 bg-transparent p-0 font-medium leading-[1.2] outline-none placeholder:text-[#98A2B3] disabled:cursor-not-allowed ${value ? "text-[16px]" : "text-[14px]"} ${disabled || readOnly ? "text-[#9199A7]" : "text-[#1F2123]"}`}
          onFocus={() => { if (!readOnly) { setFocused(true); setVisualState("Focused"); } }}
          onChange={(event) => {
            setValue(event.target.value);
            setEdited(true);
            setVisualState("Focused");
            onValueChange?.(event.target.value);
          }}
          onBlur={(event) => {
            setFocused(false);
            if (readOnly) return;
            if (!event.target.value) setVisualState("Default");
            else if (edited) setVisualState(event.target.validity.valid && /\.[^@.\s]+$/.test(event.target.value) ? "Success" : "Error");
            else setVisualState(value ? "Filled" : "Default");
          }}
        />
      </div>
      {invalid && <span id={`${id}-error`} className="sr-only" role="status">Enter a valid email address, such as name@example.com.</span>}
    </div>
  );
}
