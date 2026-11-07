"use client";

import { useState } from "react";
import { EmailInput, EmailState } from "@/components/motion-components/inputs/EmailInput";
import { EmailStateTabs } from "@/components/motion-components/inputs/EmailStateTabs";

export function EmailInputPreview() {
  const [state, setState] = useState<EmailState>("Default");
  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto p-6">
      <div className="flex min-h-[160px] flex-1 items-center justify-center"><EmailInput state={state} /></div>
      <EmailStateTabs value={state} onChange={setState} />
    </div>
  );
}
