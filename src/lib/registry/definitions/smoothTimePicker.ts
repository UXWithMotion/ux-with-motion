import { ComponentControlDefinition, ComponentDocs, ComponentSeo } from "../types";

export const smoothTimePickerControls: ComponentControlDefinition[] = [
  {
    name: "placeholder",
    label: "Placeholder",
    type: "text",
    defaultValue: "HH-MM",
    placeholder: "e.g. HH-MM",
    description: "Fallback text displayed when no time has been selected.",
  },
  {
    name: "disabled",
    label: "Disabled State",
    type: "boolean",
    defaultValue: false,
    description: "Disables opening the popover and user interaction.",
  },
];

export const smoothTimePickerDocs: ComponentDocs = {
  overview:
    "Smooth Time Picker is an interactive, animated time selection component built with Framer Motion and Tailwind CSS. It features a dual-mode analog clock face (12-hour dial and 5-minute step dial) with spring-animated hands, a 12-hour AM/PM period toggle, and accessible keyboard and focus states.",
  useCases: [
    "Booking and reservation forms (appointments, clinics, salons, restaurant bookings)",
    "Travel and transport schedulers (departure and arrival time pickers)",
    "Calendar event creation modals and meeting schedulers",
    "Delivery window and time slot selectors for checkout flows",
  ],
  dependencies: [
    { name: "framer-motion", version: "^12.0.0" },
    { name: "lucide-react", version: "^1.51.0" },
    { name: "react", version: "^19.0.0" },
  ],
  setupInstructions: `1. Install peer dependencies:
   npm install framer-motion lucide-react

2. Copy the component file into your project at:
   components/inputs/SmoothTimePicker.tsx

3. Import and use the component with controlled or uncontrolled props.`,
  usageExample: `"use client";

import React, { useState } from "react";
import { SmoothTimePicker } from "@/components/motion-components/inputs/SmoothTimePicker";

export function AppointmentBookingForm() {
  const [selectedTime, setSelectedTime] = useState("10:30 AM");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmed(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md p-6 bg-white rounded-2xl border border-[#DEE1E4] shadow-sm space-y-4 font-sans"
    >
      <div>
        <label className="block text-sm font-semibold text-[#1F2123] mb-1.5">
          Appointment Time
        </label>
        <SmoothTimePicker
          value={selectedTime}
          onChange={(time) => {
            setSelectedTime(time);
            setIsConfirmed(false);
          }}
          placeholder="HH-MM"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-[#1F2123] hover:bg-black text-white text-sm font-medium rounded-xl transition-all shadow-sm active:scale-[0.98]"
      >
        Confirm Reservation
      </button>

      {isConfirmed && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 p-2.5 rounded-lg text-center font-medium">
          ✓ Reservation confirmed for {selectedTime}!
        </p>
      )}
    </form>
  );
}`,
  supportedProps: [
    {
      prop: "value",
      type: "string",
      defaultVal: "undefined",
      description: "Controlled time string (e.g. '10:30 AM').",
    },
    {
      prop: "defaultValue",
      type: "string",
      defaultVal: "undefined",
      description: "Initial uncontrolled time value.",
    },
    {
      prop: "placeholder",
      type: "string",
      defaultVal: '"HH-MM"',
      description: "Fallback text displayed when no time has been selected.",
    },
    {
      prop: "disabled",
      type: "boolean",
      defaultVal: "false",
      description: "Disables interaction and prevents the popover from opening.",
    },
    {
      prop: "onChange",
      type: "(time: string, hours: number, minutes: number, period: 'AM' | 'PM') => void",
      defaultVal: "undefined",
      description: "Callback fired when the user applies a selected time.",
    },
    {
      prop: "className",
      type: "string",
      defaultVal: '""',
      description: "Additional CSS class names applied to the container.",
    },
  ],
  accessibilityNotes:
    "• Uses semantic button elements with aria-expanded and aria-haspopup='dialog' on the trigger.\n• Full keyboard navigation: Enter and Space trigger and dismiss the popover; Tab moves focus.\n• Analog clock dial supports both continuous touch/mouse dragging and discrete number clicks.\n• High contrast borders (#1F2123, #62646A, #D7DADD) satisfy WCAG 2.1 AA accessibility ratios.\n• Motion easing adheres to natural spring dampening (stiffness: 450, damping: 32) without disorienting flashes.",
  relatedComponents: [
    {
      slug: "smooth-date-picker",
      name: "Input / Date picker",
    },
  ],
  figmaLink:
    "https://www.figma.com/design/3MlafJ3S3cD7vfSGUBlodn/Ux-with-motion?node-id=2249-1408",
};

export const smoothTimePickerSeo: ComponentSeo = {
  seoTitle: "Smooth Time Picker — Animated UI Component for React & Figma",
  metaDescription:
    "Explore Smooth Time Picker, a smooth interactive time picker component with analog dial, digital inputs, and spring motion for React, Next.js, and Tailwind CSS.",
};
