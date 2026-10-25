import React from "react";
import { ContinueButton } from "@/components/motion-components/buttons/ContinueButton";
import { BubbleArrowButton } from "@/components/motion-components/buttons/BubbleArrowButton";
import { BookmarkButton } from "@/components/motion-components/buttons/BookmarkButton";
import { SendButton } from "@/components/motion-components/buttons/SendButton";
import { RunButton } from "@/components/motion-components/buttons/RunButton";
import { TextSwipeButton } from "@/components/motion-components/buttons/TextSwipeButton";
import { StepperButton } from "@/components/motion-components/buttons/StepperButton";
import { SearchSuggestions } from "@/components/motion-components/SearchSuggestions";
import { GenerateButton } from "@/components/motion-components/buttons/GenerateButton";
import { AcceptButton } from "@/components/motion-components/buttons/AcceptButton";
import { GetAccessButton } from "@/components/motion-components/buttons/GetAccessButton";
import { MailButton } from "@/components/motion-components/buttons/MailButton";
import { TechnologyButton } from "@/components/motion-components/buttons/TechnologyButton";
import ImageGeneration from "@/components/motion-components/ImageGeneration";
import InteractiveFace from "@/components/motion-components/InteractiveFace";
import { DownloadButton } from "@/components/motion-components/buttons/DownloadButton";
import { TabsButton } from "@/components/motion-components/buttons/TabsButton";
import { FourItemTabs } from "@/components/motion-components/buttons/FourItemTabs";
import { MotionToggle } from "@/components/motion-components/buttons/MotionToggle";
import { SwipeArrowButton } from "@/components/motion-components/buttons/SwipeArrowButton";
import { ExpandableSearch } from "@/components/motion-components/inputs/ExpandableSearch";
import { NeoDeleteButtonShowcase } from "@/components/motion-components/buttons/NeoDeleteButton";
import { ViewMoreEyeButton } from "@/components/motion-components/buttons/ViewMoreEyeButton";
import { ServicesIndicatorButton } from "@/components/motion-components/buttons/ServicesIndicatorButton";
import { LiveSession } from "@/components/motion-components/LiveSession";
import { LiveSessionInvite } from "@/components/motion-components/LiveSessionInvite";
import { AiSearchToggle } from "@/components/motion-components/AiSearchToggle";

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
};

export const componentRegistry: Record<string, ComponentRegistryEntry> = {
  "live-session-invite": {
    registryId: "live-session-invite",
    name: "Live Session Invite",
    category: "Widgets",
    component: LiveSessionInvite,
    snippets: {
      html: `<div class="live-session-invite"></div>`,
      css: `.live-session-invite { /* styles */ }`,
      react: `// React code for LiveSessionInvite`
    }
  },
  "live-session": {
    registryId: "live-session",
    name: "Live Session",
    category: "Widgets",
    component: LiveSession,
    snippets: {
      html: `<div class="live-session"></div>`,
      css: `.live-session { /* styles */ }`,
      react: `// React code for LiveSession`
    }
  },
  "view-more-eye-button": {
    registryId: "view-more-eye-button",
    name: "View More Eye Button",
    category: "Buttons",
    component: ViewMoreEyeButton,
    snippets: {
      html: `<button class="view-more-eye">View more</button>`,
      css: `.view-more-eye { /* styles */ }`,
      react: `// React code for ViewMoreEyeButton`
    }
  },
  "neo-delete-button": {
    registryId: "neo-delete-button",
    name: "Neo Delete Button",
    category: "Buttons",
    component: NeoDeleteButtonShowcase,
    snippets: {
      html: `<button class="neo-delete">Delete</button>`,
      css: `.neo-delete { /* styles */ }`,
      react: `// React code for NeoDeleteButton`
    }
  },
  "expandable-search": {
    registryId: "expandable-search",
    name: "Expandable Search",
    category: "Inputs",
    component: ExpandableSearch,
    snippets: {
      html: `<div class="expandable-search"></div>`,
      css: `.expandable-search { /* styles */ }`,
      react: `// React code for ExpandableSearch`
    }
  },
  "swipe-arrow-button": {
    registryId: "swipe-arrow-button",
    name: "Swipe Arrow Button",
    category: "Buttons",
    component: SwipeArrowButton,
    snippets: {
      html: `<button class="swipe-arrow-btn">Continue</button>`,
      css: `.swipe-arrow-btn { /* styles */ }`,
      react: `// React code for SwipeArrowButton`
    }
  },
  "motion-toggle": {
    registryId: "motion-toggle",
    name: "Motion Toggle",
    category: "Buttons",
    component: MotionToggle,
    snippets: {
      html: `<button class="motion-toggle"></button>`,
      css: `.motion-toggle { /* styles */ }`,
      react: `// React code for MotionToggle`
    }
  },
  "four-item-tabs": {
    registryId: "four-item-tabs",
    name: "Four Item Tabs",
    category: "Buttons",
    component: FourItemTabs,
    snippets: {
      html: `<div class="four-tabs"></div>`,
      css: `.four-tabs { /* styles */ }`,
      react: `// React code for FourItemTabs`
    }
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
      nextjs: ""
    }
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
      nextjs: ""
    }
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
      nextjs: ""
    }
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
      nextjs: ""
    }
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
      nextjs: ""
    }
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
      nextjs: ""
    }
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
      nextjs: ""
    }
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
      nextjs: ""
    }
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
        nextjs: ""
      }
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
      html: `<button class="continue-btn">Continue</button>`,
      css: `.continue-btn { /* styles */ }`,
      nextjs: `// React code for ContinueButton`
    }
  },
  "generate-button": {
    registryId: "generate-button",
    name: "Generate Button",
    category: "Buttons",
    component: GenerateButton,
    snippets: {
      html: `<button class="gen-btn">Generate</button>`,
      css: `.gen-btn { /* styles */ }`,
      nextjs: `// React code for GenerateButton`
    }
  },
  "accept-button": {
    registryId: "accept-button",
    name: "Accept Button",
    category: "Buttons",
    component: AcceptButton,
    snippets: {
      html: `<button class="accept-btn">Accept</button>`,
      css: `.accept-btn { /* styles */ }`,
      nextjs: `// React code for AcceptButton`
    }
  },
  "get-access-button": {
    registryId: "get-access-button",
    name: "Get Access Button",
    category: "Buttons",
    component: GetAccessButton,
    snippets: {
      html: `<button class="access-btn">Get Access</button>`,
      css: `.access-btn { /* styles */ }`,
      nextjs: `// React code for GetAccessButton`
    }
  },
  "mail-button": {
    registryId: "mail-button",
    name: "Mail Button",
    category: "Buttons",
    component: MailButton,
    snippets: {
      html: `<button class="mail-btn">Mail</button>`,
      css: `.mail-btn { /* styles */ }`,
      nextjs: `// React code for MailButton`
    }
  },
  "delete-button": {
    registryId: "delete-button",
    name: "Brutalist Delete Button",
    category: "Buttons",
    component: TechnologyButton,
    snippets: {
      html: `<button class="delete-btn">Delete</button>`,
      css: `.delete-btn { /* styles */ }`,
      nextjs: `// React code for Brutalist Delete Button`
    }
  },
  "download-button": {
    registryId: "download-button",
    name: "Download Button",
    category: "Buttons",
    component: DownloadButton,
    snippets: {
      html: `<button class="download-btn">Download</button>`,
      css: `.download-btn { /* styles */ }`,
      nextjs: `// React code for DownloadButton`
    }
  },
  "tabs-button": {
    registryId: "tabs-button",
    name: "Tabs Button",
    category: "Buttons",
    component: TabsButton,
    snippets: {
      html: `<button class="tabs-btn">Tabs</button>`,
      css: `.tabs-btn { /* styles */ }`,
      nextjs: `// React code for TabsButton`
    }
  },
  "services-indicator-button": {
    registryId: "services-indicator-button",
    name: "Services Indicator Button",
    category: "Buttons",
    component: ServicesIndicatorButton,
    snippets: {
      html: `<button class="services-btn">Services Indicator</button>`,
      css: `.services-btn { /* styles */ }`,
      nextjs: `// React code for ServicesIndicatorButton`
    }
  },
  "ai-search-toggle": {
    registryId: "ai-search-toggle",
    name: "AI Search Toggle",
    category: "Inputs",
    component: AiSearchToggle,
    snippets: {
      html: `<div class="ai-search-toggle"></div>`,
      css: `.ai-search-toggle { /* styles */ }`,
      react: `// React code for AiSearchToggle`
    }
  }
};
