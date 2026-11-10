import React from "react";
import dynamic from "next/dynamic";
import {
  smoothTimePickerControls,
  smoothTimePickerDocs,
  smoothTimePickerSeo,
} from "./definitions/smoothTimePicker";
import { ComponentControlDefinition, ComponentDocs, ComponentSeo } from "./types";

export type ComponentRegistrySnippets = {
  html: string;
  css: string;
  nextjs?: string;
  react?: string;
};

export type ComponentRegistryEntry = {
  registryId: string;
  name: string;
  category: string;
  component: React.ComponentType<any>;
  schema_definition?: any[];
  snippets: ComponentRegistrySnippets;
  sourceRevision?: string;
  controls?: ComponentControlDefinition[];
  docs?: ComponentDocs;
  seo?: ComponentSeo;
};

const SkeletonLoader = () => (
  <div className="w-full h-full min-h-[140px] flex items-center justify-center animate-pulse">
    <div className="w-20 h-6 bg-black/5 rounded-xl" />
  </div>
);

// ─── Code-Split Component Loaders ───────────────────────────────────────────

export const SmoothTimePicker = dynamic(
  () => import("@/components/motion-components/inputs/SmoothTimePicker").then((m) => m.SmoothTimePicker),
  { loading: SkeletonLoader }
);

export const SmoothCardInput = dynamic(
  () => import("@/components/motion-components/inputs/SmoothCardInput").then((m) => m.SmoothCardInput),
  { loading: SkeletonLoader }
);

export const SmoothCopyInput = dynamic(
  () => import("@/components/motion-components/inputs/SmoothCopyInput").then((m) => m.SmoothCopyInput),
  { loading: SkeletonLoader }
);

export const SmoothTagInput = dynamic(
  () => import("@/components/motion-components/inputs/SmoothTagInput").then((m) => m.SmoothTagInput),
  { loading: SkeletonLoader }
);

export const SmoothDatePicker = dynamic(
  () => import("@/components/motion-components/inputs/SmoothDatePicker").then((m) => m.SmoothDatePicker),
  { loading: SkeletonLoader }
);

export const SmoothOtpInput = dynamic(
  () => import("@/components/motion-components/inputs/SmoothOtpInput").then((m) => m.SmoothOtpInput),
  { loading: SkeletonLoader }
);

export const SmoothPasswordInput = dynamic(
  () => import("@/components/motion-components/inputs/SmoothPasswordInput").then((m) => m.SmoothPasswordInput),
  { loading: SkeletonLoader }
);

export const ProductTypeDropdown = dynamic(
  () => import("@/components/motion-components/inputs/ProductTypeDropdown").then((m) => m.ProductTypeDropdown),
  { loading: SkeletonLoader }
);

export const SmoothPhoneInput = dynamic(
  () => import("@/components/motion-components/inputs/SmoothPhoneInput").then((m) => m.SmoothPhoneInput),
  { loading: SkeletonLoader }
);

export const SmoothEmailInput = dynamic(
  () => import("@/components/motion-components/inputs/SmoothEmailInput").then((m) => m.SmoothEmailInput),
  { loading: SkeletonLoader }
);

export const PdfActionCard = dynamic(
  () => import("@/components/motion-components/cards/PdfActionCard").then((m) => m.PdfActionCard),
  { loading: SkeletonLoader }
);

export const SmoothInput = dynamic(
  () => import("@/components/motion-components/inputs/SmoothInput").then((m) => m.SmoothInput),
  { loading: SkeletonLoader }
);

export const AiSearchToggle = dynamic(
  () => import("@/components/motion-components/inputs/AiSearchToggle").then((m) => m.AiSearchToggle),
  { loading: SkeletonLoader }
);

export const LiveSessionInvite = dynamic(
  () => import("@/components/motion-components/LiveSessionInvite").then((m) => m.LiveSessionInvite),
  { loading: SkeletonLoader }
);

export const LiveSession = dynamic(
  () => import("@/components/motion-components/LiveSession").then((m) => m.LiveSession),
  { loading: SkeletonLoader }
);

export const ViewMoreEyeButton = dynamic(
  () => import("@/components/motion-components/buttons/ViewMoreEyeButton").then((m) => m.ViewMoreEyeButton),
  { loading: SkeletonLoader }
);

export const NeoDeleteButtonShowcase = dynamic(
  () => import("@/components/motion-components/buttons/NeoDeleteButton").then((m) => m.NeoDeleteButtonShowcase),
  { loading: SkeletonLoader }
);

export const ExpandableSearch = dynamic(
  () => import("@/components/motion-components/inputs/ExpandableSearch").then((m) => m.ExpandableSearch),
  { loading: SkeletonLoader }
);

export const SwipeArrowButton = dynamic(
  () => import("@/components/motion-components/buttons/SwipeArrowButton").then((m) => m.SwipeArrowButton),
  { loading: SkeletonLoader }
);

export const MotionToggle = dynamic(
  () => import("@/components/motion-components/buttons/MotionToggle").then((m) => m.MotionToggle),
  { loading: SkeletonLoader }
);

export const FourItemTabs = dynamic(
  () => import("@/components/motion-components/buttons/FourItemTabs").then((m) => m.FourItemTabs),
  { loading: SkeletonLoader }
);

export const SearchSuggestions = dynamic(
  () => import("@/components/motion-components/SearchSuggestions").then((m) => m.SearchSuggestions),
  { loading: SkeletonLoader }
);

export const StepperButton = dynamic(
  () => import("@/components/motion-components/buttons/StepperButton").then((m) => m.StepperButton),
  { loading: SkeletonLoader }
);

export const TextSwipeButton = dynamic(
  () => import("@/components/motion-components/buttons/TextSwipeButton").then((m) => m.TextSwipeButton),
  { loading: SkeletonLoader }
);

export const RunButton = dynamic(
  () => import("@/components/motion-components/buttons/RunButton").then((m) => m.RunButton),
  { loading: SkeletonLoader }
);

export const SendButton = dynamic(
  () => import("@/components/motion-components/buttons/SendButton").then((m) => m.SendButton),
  { loading: SkeletonLoader }
);

export const BookmarkButton = dynamic(
  () => import("@/components/motion-components/buttons/BookmarkButton").then((m) => m.BookmarkButton),
  { loading: SkeletonLoader }
);

export const BubbleArrowButton = dynamic(
  () => import("@/components/motion-components/buttons/BubbleArrowButton").then((m) => m.BubbleArrowButton),
  { loading: SkeletonLoader }
);

export const InteractiveFace = dynamic(
  () => import("@/components/motion-components/InteractiveFace"),
  { loading: SkeletonLoader }
);

export const ImageGeneration = dynamic(
  () => import("@/components/motion-components/ImageGeneration"),
  { loading: SkeletonLoader }
);

export const ContinueButton = dynamic(
  () => import("@/components/motion-components/buttons/ContinueButton").then((m) => m.ContinueButton),
  { loading: SkeletonLoader }
);

export const GenerateButton = dynamic(
  () => import("@/components/motion-components/buttons/GenerateButton").then((m) => m.GenerateButton),
  { loading: SkeletonLoader }
);

export const AcceptButton = dynamic(
  () => import("@/components/motion-components/buttons/AcceptButton").then((m) => m.AcceptButton),
  { loading: SkeletonLoader }
);

export const GetAccessButton = dynamic(
  () => import("@/components/motion-components/buttons/GetAccessButton").then((m) => m.GetAccessButton),
  { loading: SkeletonLoader }
);

export const MailButton = dynamic(
  () => import("@/components/motion-components/buttons/MailButton").then((m) => m.MailButton),
  { loading: SkeletonLoader }
);

export const TechnologyButton = dynamic(
  () => import("@/components/motion-components/buttons/TechnologyButton").then((m) => m.TechnologyButton),
  { loading: SkeletonLoader }
);

export const DownloadButton = dynamic(
  () => import("@/components/motion-components/buttons/DownloadButton").then((m) => m.DownloadButton),
  { loading: SkeletonLoader }
);

export const TabsButton = dynamic(
  () => import("@/components/motion-components/buttons/TabsButton").then((m) => m.TabsButton),
  { loading: SkeletonLoader }
);

export const ServicesIndicatorButton = dynamic(
  () => import("@/components/motion-components/buttons/ServicesIndicatorButton").then((m) => m.ServicesIndicatorButton),
  { loading: SkeletonLoader }
);

export const componentRegistry: Record<string, ComponentRegistryEntry> = {
  "smooth-time-picker": {
    registryId: "smooth-time-picker",
    name: "Input / Time picker",
    category: "Inputs",
    component: SmoothTimePicker,
    sourceRevision: "1.0.0",
    controls: smoothTimePickerControls,
    docs: smoothTimePickerDocs,
    seo: smoothTimePickerSeo,
    schema_definition: [
      {
        id: "placeholder",
        variable: "placeholder",
        label: "Placeholder",
        type: "text",
        defaultValue: "HH-MM",
      },
      {
        id: "disabled",
        variable: "disabled",
        label: "Disabled State",
        type: "boolean",
        defaultValue: "false",
      },
    ],
    snippets: {
      html: `<div class="smooth-time-picker"></div>`,
      css: `.smooth-time-picker { /* Tailwind styled component */ }`,
      react: `// Source code is retrieved securely via /api/components/smooth-time-picker/source upon sign-in.`,
    },
  },

  "smooth-card-input": {
    registryId: "smooth-card-input",
    name: "Input / Card number",
    category: "Inputs",
    component: SmoothCardInput,
    schema_definition: [
      {
        id: "property1",
        variable: "property1",
        label: "State",
        type: "select",
        options: ["Default", "identify"],
        defaultValue: "Default"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "smooth-copy-input": {
    registryId: "smooth-copy-input",
    name: "Input / Copy input",
    category: "Inputs",
    component: SmoothCopyInput,
    schema_definition: [
      {
        id: "property1",
        variable: "property1",
        label: "State",
        type: "select",
        options: ["copy", "copied"],
        defaultValue: "copy"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "smooth-tag-input": {
    registryId: "smooth-tag-input",
    name: "Input / Tag input",
    category: "Inputs",
    component: SmoothTagInput,
    schema_definition: [
      {
        id: "property1",
        variable: "property1",
        label: "State",
        type: "select",
        options: ["Default", "tag collapse", "tag expand"],
        defaultValue: "Default"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "smooth-date-picker": {
    registryId: "smooth-date-picker",
    name: "Input / Date picker",
    category: "Inputs",
    component: SmoothDatePicker,
    schema_definition: [
      {
        id: "property1",
        variable: "property1",
        label: "State",
        type: "select",
        options: ["Default", "Open", "Choose month", "Choose year"],
        defaultValue: "Default"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "smooth-otp-input": {
    registryId: "smooth-otp-input",
    name: "Smooth OTP Input",
    category: "Inputs",
    component: SmoothOtpInput,
    schema_definition: [
      {
        id: "property1",
        variable: "property1",
        label: "State",
        type: "select",
        options: ["Field anatomy", "Active", "Filled"],
        defaultValue: "Field anatomy"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "smooth-password-input": {
    registryId: "smooth-password-input",
    name: "Smooth Password Input",
    category: "Inputs",
    component: SmoothPasswordInput,
    schema_definition: [
      {
        id: "property1",
        variable: "property1",
        label: "State",
        type: "select",
        options: ["Field anatomy", "Input container"],
        defaultValue: "Field anatomy"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "product-type-dropdown": {
    registryId: "product-type-dropdown",
    name: "Product Type Dropdown",
    category: "Inputs",
    component: ProductTypeDropdown,
    schema_definition: [
      {
        id: "property1",
        variable: "property1",
        label: "State",
        type: "select",
        options: ["Default", "Input", "Selected"],
        defaultValue: "Default"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "smooth-phone-input": {
    registryId: "smooth-phone-input",
    name: "Smooth Phone Number Input",
    category: "Inputs",
    component: SmoothPhoneInput,
    schema_definition: [
      {
        id: "property1",
        variable: "property1",
        label: "State",
        type: "select",
        options: ["Frame 9", "Frame 10", "Variant3"],
        defaultValue: "Frame 9"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "smooth-email-input": {
    registryId: "smooth-email-input",
    name: "Smooth Email Input",
    category: "Inputs",
    component: SmoothEmailInput,
    schema_definition: [
      {
        id: "property1",
        variable: "property1",
        label: "State",
        type: "select",
        options: ["Field anatomy", "Input container"],
        defaultValue: "Field anatomy"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "pdf-action-card": {
    registryId: "pdf-action-card",
    name: "PDF Action Card",
    category: "Cards",
    component: PdfActionCard,
    schema_definition: [
      {
        variable: "property1",
        label: "State",
        type: "select",
        options: ["Frame 1", "Frame 2", "Frame 3", "Frame 4"],
        defaultValue: "Frame 1"
      }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "smooth-input": {
    registryId: "smooth-input",
    name: "Smooth Input",
    category: "Inputs",
    component: SmoothInput,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "ai-search-toggle": {
    registryId: "ai-search-toggle",
    name: "AI Search Toggle",
    category: "Inputs",
    component: AiSearchToggle,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "live-session-invite": {
    registryId: "live-session-invite",
    name: "Live Session Invite",
    category: "Widgets",
    component: LiveSessionInvite,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "live-session": {
    registryId: "live-session",
    name: "Live Session",
    category: "Widgets",
    component: LiveSession,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "view-more-eye-button": {
    registryId: "view-more-eye-button",
    name: "View More Eye Button",
    category: "Buttons",
    component: ViewMoreEyeButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "neo-delete-button": {
    registryId: "neo-delete-button",
    name: "Neo Delete Button",
    category: "Buttons",
    component: NeoDeleteButtonShowcase,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "expandable-search": {
    registryId: "expandable-search",
    name: "Expandable Search",
    category: "Inputs",
    component: ExpandableSearch,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "swipe-arrow-button": {
    registryId: "swipe-arrow-button",
    name: "Swipe Arrow Button",
    category: "Buttons",
    component: SwipeArrowButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "motion-toggle": {
    registryId: "motion-toggle",
    name: "Motion Toggle",
    category: "Buttons",
    component: MotionToggle,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "four-item-tabs": {
    registryId: "four-item-tabs",
    name: "Four Item Tabs",
    category: "Buttons",
    component: FourItemTabs,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "search-suggestions": {
    registryId: "search-suggestions",
    name: "Search Suggestions",
    category: "Sections",
    component: SearchSuggestions,
    schema_definition: [],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "stepper-button": {
    registryId: "stepper-button",
    name: "Stepper Button",
    category: "Buttons",
    component: StepperButton,
    schema_definition: [],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "text-swipe-button": {
    registryId: "text-swipe-button",
    name: "Text Swipe Button",
    category: "Buttons",
    component: TextSwipeButton,
    schema_definition: [],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "run-button": {
    registryId: "run-button",
    name: "Run Button",
    category: "Buttons",
    component: RunButton,
    schema_definition: [],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "send-button": {
    registryId: "send-button",
    name: "Send Button",
    category: "Buttons",
    component: SendButton,
    schema_definition: [],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "bookmark-button": {
    registryId: "bookmark-button",
    name: "Bookmark Button",
    category: "Buttons",
    component: BookmarkButton,
    schema_definition: [],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "bubble-arrow-button": {
    registryId: "bubble-arrow-button",
    name: "Bubble Arrow Button",
    category: "Buttons",
    component: BubbleArrowButton,
    schema_definition: [],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "interactive-face": {
    registryId: "interactive-face",
    name: "Interactive Character Face",
    category: "Complex",
    component: InteractiveFace,
    schema_definition: [],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "image-generation-preview": {
    registryId: "image-generation-preview",
    name: "Image Generation Process",
    category: "Complex",
    component: ImageGeneration,
    schema_definition: [],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "continue-button": {
    registryId: "continue-button",
    name: "Continue Button",
    category: "Buttons",
    component: ContinueButton,
    schema_definition: [
      { id: "bg", label: "Background", type: "Color Picker", defaultValue: "#16A34A", variable: "--button-bg" },
      { id: "border", label: "Border Hover", type: "Color Picker", defaultValue: "#00963d", variable: "--button-border" },
      { id: "text", label: "Text", type: "Color Picker", defaultValue: "#ffffff", variable: "--button-text" },
      { id: "textHover", label: "Text Hover", type: "Color Picker", defaultValue: "#00963d", variable: "--button-text-hover" },
      { id: "sparkle", label: "Sparkle", type: "Color Picker", defaultValue: "#FFD700", variable: "--sparkle-color" }
    ],
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "generate-button": {
    registryId: "generate-button",
    name: "Generate Button",
    category: "Buttons",
    component: GenerateButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "accept-button": {
    registryId: "accept-button",
    name: "Accept Button",
    category: "Buttons",
    component: AcceptButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "get-access-button": {
    registryId: "get-access-button",
    name: "Get Access Button",
    category: "Buttons",
    component: GetAccessButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "mail-button": {
    registryId: "mail-button",
    name: "Mail Button",
    category: "Buttons",
    component: MailButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "delete-button": {
    registryId: "delete-button",
    name: "Brutalist Delete Button",
    category: "Buttons",
    component: TechnologyButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "download-button": {
    registryId: "download-button",
    name: "Download Button",
    category: "Buttons",
    component: DownloadButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "tabs-button": {
    registryId: "tabs-button",
    name: "Tabs Button",
    category: "Buttons",
    component: TabsButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },

  "services-indicator-button": {
    registryId: "services-indicator-button",
    name: "Services Indicator Button",
    category: "Buttons",
    component: ServicesIndicatorButton,
    snippets: {
      html: "",
      css: "",
      react: "",
    },
  },
};
