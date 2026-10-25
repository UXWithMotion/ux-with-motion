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
      nextjs: "\"use client\";\r\n\r\nimport React, { useState } from \"react\";\r\nimport { motion, useReducedMotion } from \"framer-motion\";\r\n\r\nconst Sparkle = ({ className }: { className?: string }) => (\r\n  <svg viewBox=\"0 0 7.90355 7.65093\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" className={className}>\r\n    <path d=\"M2.65773 0.940258C3.06507 -0.313419 4.83869 -0.313419 5.24604 0.940258C5.42821 1.50092 5.95068 1.88052 6.54019 1.88052C7.85839 1.88052 8.40647 3.56733 7.34002 4.34214C6.8631 4.68865 6.66353 5.30285 6.8457 5.86351C7.25304 7.11719 5.81816 8.1597 4.75172 7.38488C4.27479 7.03837 3.62898 7.03837 3.15205 7.38488C2.08561 8.1597 0.650723 7.11719 1.05807 5.86351C1.24024 5.30285 1.04067 4.68865 0.563745 4.34214C-0.502697 3.56733 0.0453818 1.88052 1.36358 1.88052C1.95309 1.88052 2.47556 1.50092 2.65773 0.940258Z\" fill=\"currentColor\"/>\r\n  </svg>\r\n);\r\n\r\nconst stars = [\r\n  { initial: { left: 38, top: 16, width: 9, height: 9, opacity: 0 }, hover: { left: 23, top: 2, width: 11, height: 11, opacity: 1 } },\r\n  { initial: { left: 34, top: 31, width: 2, height: 2, opacity: 0 }, hover: { left: 20, top: 29, width: 2, height: 2, opacity: 1 } },\r\n  { initial: { left: 64, top: 29, width: 4, height: 4, opacity: 0 }, hover: { left: 54, top: 30, width: 5, height: 5, opacity: 1 } },\r\n  { initial: { left: 90, top: 13, width: 2, height: 2, opacity: 0 }, hover: { left: 88, top: 7, width: 3, height: 3, opacity: 1 } },\r\n  { initial: { left: 69, top: 15, width: 5, height: 5, opacity: 0 }, hover: { left: 64, top: 8, width: 6, height: 6, opacity: 1 } },\r\n  { initial: { left: 96, top: 26, width: 15, height: 15, opacity: 0 }, hover: { left: 114, top: 29, width: 18, height: 18, opacity: 1 } },\r\n  { initial: { left: 107, top: 9, width: 7, height: 7, opacity: 0 }, hover: { left: 105, top: 8, width: 9, height: 9, opacity: 1 } },\r\n  { initial: { left: 14, top: 9, width: 17, height: 17, opacity: 0, rotate: -21 }, hover: { left: -15, top: -6, width: 21, height: 21, opacity: 1, rotate: -21 } }\r\n];\r\n\r\nexport function ContinueButton() {\r\n  const shouldReduceMotion = useReducedMotion();\r\n  const [isHovered, setIsHovered] = useState(false);\r\n\r\n  return (\r\n    <motion.button\r\n      type=\"button\"\r\n      onHoverStart={() => setIsHovered(true)}\r\n      onHoverEnd={() => setIsHovered(false)}\r\n      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}\r\n      style={{\r\n        \"--btn-bg\": \"var(--button-bg, #16A34A)\",\r\n        \"--btn-border\": \"var(--button-border, #00963d)\",\r\n        \"--btn-text\": \"var(--button-text, #ffffff)\",\r\n        \"--btn-text-hover\": \"var(--button-text-hover, #00963d)\",\r\n      } as React.CSSProperties}\r\n      className={`relative flex items-center justify-center rounded-[52px] h-[43px] w-[119px] transition-colors duration-300 font-work font-medium text-[16px] leading-[1.2] shadow-sm cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A] ${\r\n        isHovered \r\n          ? \"border border-[var(--btn-border)] bg-transparent text-[var(--btn-text-hover)]\" \r\n          : \"bg-[var(--btn-bg)] border border-transparent text-[var(--btn-text)] overflow-hidden\"\r\n      }`}\r\n    >\r\n      <span className=\"relative z-10\">Continue</span>\r\n\r\n      {stars.map((star, idx) => (\r\n        <motion.div\r\n          key={idx}\r\n          style={{ color: \"var(--sparkle-color, #FFD700)\" }}\r\n          className=\"absolute pointer-events-none\"\r\n          initial={false}\r\n          animate={{\r\n            left: isHovered ? star.hover.left : star.initial.left,\r\n            top: isHovered ? star.hover.top : star.initial.top,\r\n            width: isHovered ? star.hover.width : star.initial.width,\r\n            height: isHovered ? star.hover.height : star.initial.height,\r\n            opacity: isHovered ? star.hover.opacity : star.initial.opacity,\r\n            rotate: star.hover.rotate ? star.hover.rotate : 0,\r\n          }}\r\n          transition={{\r\n            type: \"spring\",\r\n            stiffness: 400,\r\n            damping: 25,\r\n            delay: isHovered ? idx * 0.015 : 0, // tiny stagger effect outward\r\n          }}\r\n        >\r\n          <Sparkle className=\"w-full h-full\" />\r\n        </motion.div>\r\n      ))}\r\n    </motion.button>\r\n  );\r\n}\r\n"
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
      nextjs: `"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const TABS = [
  { 
    id: "Telegram", 
    label: "Telegram", 
    iconActive: "/images/tabs/imgComponent5.svg", 
    iconInactive: "/images/tabs/imgComponent6.svg" 
  },
  { 
    id: "Instagram", 
    label: "Instagram", 
    iconActive: "/images/tabs/imgComponent9.svg", 
    iconInactive: "/images/tabs/imgComponent7.svg" 
  },
  { 
    id: "Thread", 
    label: "Thread", 
    iconActive: "/images/tabs/imgComponent10.svg", 
    iconInactive: "/images/tabs/imgComponent8.svg" 
  },
];

export function TabsButton() {
  const [activeTab, setActiveTab] = useState("Telegram");

  return (
    <div className="bg-[#eef1f4] border border-[#e8e8e8] flex items-center p-[6px] rounded-[999px] h-[48px] overflow-hidden relative select-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            layout
            onClick={() => setActiveTab(tab.id)}
            className={\`relative flex items-center justify-center shrink-0 rounded-[999px] h-[36px] transition-all duration-300 ease-in-out cursor-pointer \${
              isActive ? "px-[14px]" : "w-[36px]"
            }\`}
          >
            {isActive && (
              <motion.div
                layoutId="tab-bubble"
                className="absolute inset-0 bg-white rounded-[999px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            
            <div className="relative z-10 flex items-center justify-center gap-[6px]">
              <div className="w-[18px] h-[18px] shrink-0 flex items-center justify-center">
                <Image 
                  src={isActive ? tab.iconActive : tab.iconInactive}
                  alt={tab.label}
                  width={18}
                  height={18}
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    layout
                    initial={{ opacity: 0, width: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
                    exit={{ opacity: 0, width: 0, filter: "blur(4px)" }}
                    transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                    className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] text-[#1f2123] whitespace-nowrap overflow-hidden"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
`
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
      html: `<div class="ai-search-toggle">
  <div class="search-card">
    <div class="search-top-row">
      <span class="search-icon">🔍</span>
      <input type="text" placeholder="Search components" />
      <div class="mode-toggle">
        <button class="active">Search</button>
        <button>Ask AI</button>
      </div>
    </div>
  </div>
</div>`,
      css: `.ai-search-toggle {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.search-card {
  position: relative;
  border-radius: 9999px;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  padding: 8px 16px;
  transition: all 0.3s ease;
}`,
      react: `"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Wand2,
  Plus,
  Mic,
  ArrowUp,
  Image as ImageIcon,
  Globe,
  Wrench,
  Check,
} from "lucide-react";

export function AiSearchToggle() {
  const [mode, setMode] = useState<"search" | "ai">("search");
  const [query, setQuery] = useState("");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAi = mode === "ai";

  const tools = [
    { id: "generate-image", label: "Generate image", icon: ImageIcon },
    { id: "web-search", label: "Web Search", icon: Globe },
    { id: "tools", label: "Tools", icon: Wrench },
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const toggleTool = (id: string) => {
    setActiveTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4 w-full select-none">
      <div className="relative flex flex-col items-center w-full max-w-[560px]">
        {/* Animated Gradient Border */}
        <motion.div
          layout
          animate={{ borderRadius: isAi ? 28 : 9999 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="relative w-full p-[1.5px] overflow-hidden"
          style={{
            boxShadow: isAi
              ? "0 10px 30px -4px rgba(56, 189, 248, 0.15), 0 4px 16px -2px rgba(192, 132, 252, 0.1)"
              : "0 2px 10px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Moving Gradient Stroke */}
          <motion.div
            className="absolute -inset-[150%] pointer-events-none"
            animate={{ opacity: isAi ? 1 : 0 }}
            transition={{ duration: 0.45 }}
          >
            <div
              className="w-full h-full"
              style={{
                background: "conic-gradient(from 0deg, #38BDF8 0%, #FB7185 25%, #C084FC 50%, #FBBF24 75%, #38BDF8 100%)",
                animation: "spinGradient 4s linear infinite",
              }}
            />
          </motion.div>

          {/* Inner Content Card */}
          <motion.div
            layout
            animate={{ borderRadius: isAi ? 26.5 : 9999 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative w-full bg-white z-10 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Row: Search Icon, Text Input, Mode Switch */}
            <div className="flex items-center h-[58px] px-5 gap-3">
              <div className="shrink-0 flex items-center justify-center text-[#525252]">
                <Search className="w-5 h-5 stroke-[2.2]" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAi ? "Search sustainable products..." : "Search components"}
                className="flex-1 bg-transparent border-none outline-none font-sans text-[15px] font-medium text-[#1F2123] placeholder:text-[#8E9196]"
              />

              {/* Mode Segmented Toggle: Search | Ask AI */}
              <div className="shrink-0 relative flex items-center h-[42px] p-[3px] bg-[#F3F4F6] rounded-full">
                {/* Sliding Background Indicator */}
                <motion.div
                  className="absolute top-[3px] bottom-[3px] rounded-full pointer-events-none"
                  animate={{
                    left: isAi ? "calc(50% + 1px)" : "3px",
                    right: isAi ? "3px" : "calc(50% + 1px)",
                    backgroundColor: isAi ? "#1F2123" : "#FDFDFD",
                    boxShadow: isAi ? "0 2px 6px rgba(0, 0, 0, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.08)",
                  }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                />

                <button
                  type="button"
                  onClick={() => setMode("search")}
                  className={\`relative z-10 flex items-center justify-center px-4 h-full rounded-full text-[13px] font-medium transition-colors cursor-pointer \${
                    !isAi ? "text-[#1F2123]" : "text-[#4B5563] hover:text-[#1F2123]"
                  }\`}
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => setMode("ai")}
                  className={\`relative z-10 flex items-center justify-center gap-1.5 px-4 h-full rounded-full text-[13px] font-medium transition-colors cursor-pointer \${
                    isAi ? "text-white" : "text-[#4B5563] hover:text-[#1F2123]"
                  }\`}
                >
                  {isAi && <Wand2 className="w-3.5 h-3.5 text-white" />}
                  <span>Ask AI</span>
                </button>
              </div>
            </div>

            {/* Bottom Row in Ask AI Variant */}
            <AnimatePresence>
              {isAi && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 24 }}
                  className="flex items-center justify-between px-5 pb-3.5 pt-1 border-t border-transparent overflow-hidden"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsMoreOpen((prev) => !prev)}
                    className={\`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer \${
                      isMoreOpen ? "bg-[#E5E7EB] text-[#1F2123]" : "bg-[#F3F4F6] text-[#4B5563]"
                    }\`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.2]" />
                    <span>More</span>
                  </motion.button>

                  <div className="flex items-center gap-3">
                    <button type="button" className="flex items-center justify-center w-8 h-8 rounded-full text-[#6B7280] hover:bg-black/5">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button type="button" className="flex items-center justify-center w-[36px] h-[36px] rounded-full bg-[#1F2123] text-white">
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Detached Menu Layer */}
        <AnimatePresence>
          {isAi && isMoreOpen && (
            <motion.div
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 12, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="absolute top-[138px] z-20 flex items-center gap-6 px-4 py-2.5 rounded-2xl bg-white/95 border border-[#E5E7EB] shadow-lg"
            >
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => toggleTool(tool.id)}
                    className={\`flex items-center gap-2 text-[13px] font-medium transition-colors cursor-pointer \${
                      isActive ? "text-[#1F2123]" : "text-[#525252] hover:text-[#1F2123]"
                    }\`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.8] text-[#525252]" />
                    <span>{tool.label}</span>
                    {isActive && <Check className="w-3 h-3 text-[#1F2123] stroke-[2.5]" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}`
    }
  }
};










