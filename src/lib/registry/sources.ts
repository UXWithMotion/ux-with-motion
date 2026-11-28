import "server-only";
import fs from "fs";
import path from "path";
import { ComponentServerEntry } from "./types";

// Memory cache to serve file reads in microseconds (0ms disk I/O on repeats)
const fileCache = new Map<string, string>();
const officialSourceCache = new Map<string, ComponentServerEntry>();

// Helper to safely read reviewed component source from disk with memory caching
function readComponentFile(relativeFilePath: string): string | null {
  if (fileCache.has(relativeFilePath)) {
    return fileCache.get(relativeFilePath)!;
  }
  try {
    const searchRoots = [
      process.cwd(),
      path.resolve(process.cwd(), ".."),
      path.resolve(__dirname, "../../../.."),
    ];
    for (const root of searchRoots) {
      const fullPath = path.join(/*turbopackIgnore: true*/ root, relativeFilePath);
      if (fs.existsSync(/*turbopackIgnore: true*/ fullPath)) {
        const content = fs.readFileSync(/*turbopackIgnore: true*/ fullPath, "utf-8");
        if (content && content.trim()) {
          fileCache.set(relativeFilePath, content);
          return content;
        }
      }
    }
  } catch (err) {
    console.error(`Failed to read source file at ${relativeFilePath}:`, err);
  }
  return null;
}

export const officialComponentFiles: Record<string, string> = {
  "smooth-time-picker": "src/components/motion-components/inputs/SmoothTimePicker.tsx",
  "smooth-card-input": "src/components/motion-components/inputs/SmoothCardInput.tsx",
  "smooth-copy-input": "src/components/motion-components/inputs/SmoothCopyInput.tsx",
  "smooth-tag-input": "src/components/motion-components/inputs/SmoothTagInput.tsx",
  "smooth-date-picker": "src/components/motion-components/inputs/SmoothDatePicker.tsx",
  "smooth-otp-input": "src/components/motion-components/inputs/SmoothOtpInput.tsx",
  "smooth-password-input": "src/components/motion-components/inputs/SmoothPasswordInput.tsx",
  "product-type-dropdown": "src/components/motion-components/inputs/ProductTypeDropdown.tsx",
  "smooth-phone-input": "src/components/motion-components/inputs/SmoothPhoneInput.tsx",
  "smooth-email-input": "src/components/motion-components/inputs/SmoothEmailInput.tsx",
  "range-tab-slider": "src/components/motion-components/inputs/RangeTabSlider.tsx",
  "ai-composer": "src/components/motion-components/inputs/AiComposer.tsx",
  "pdf-action-card": "src/components/motion-components/cards/PdfActionCard.tsx",
  "card-swap": "src/components/motion-components/cards/CardSwap.tsx",
  "curved-carousel": "src/components/motion-components/cards/CurvedCarousel.tsx",
  "smooth-input": "src/components/motion-components/inputs/SmoothInput.tsx",
  "ai-search-toggle": "src/components/motion-components/inputs/AiSearchToggle.tsx",
  "ai-reasoning-drawer": "src/components/motion-components/AiReasoningDrawer.tsx",
  "ai-reasoning": "src/components/motion-components/AiReasoningDrawer.tsx",
  "image-compare": "src/components/motion-components/ImageCompare.tsx",
  "slide-to-confirm": "src/components/motion-components/buttons/SlideToConfirm.tsx",
  "step-progress-player": "src/components/motion-components/buttons/StepProgressPlayer.tsx",
  "gooey-nav": "src/components/motion-components/buttons/GooeyNav.tsx",
  "sidebar": "src/components/motion-components/buttons/LiquidNavMenu.tsx",
  "live-session-invite": "src/components/motion-components/LiveSessionInvite.tsx",
  "live-session": "src/components/motion-components/LiveSession.tsx",
  "view-more-eye-button": "src/components/motion-components/buttons/ViewMoreEyeButton.tsx",
  "neo-delete-button": "src/components/motion-components/buttons/NeoDeleteButton.tsx",
  "expandable-search": "src/components/motion-components/inputs/ExpandableSearch.tsx",
  "swipe-arrow-button": "src/components/motion-components/buttons/SwipeArrowButton.tsx",
  "motion-toggle": "src/components/motion-components/buttons/MotionToggle.tsx",
  "four-item-tabs": "src/components/motion-components/buttons/FourItemTabs.tsx",
  "search-suggestions": "src/components/motion-components/SearchSuggestions.tsx",
  "stepper-button": "src/components/motion-components/buttons/StepperButton.tsx",
  "text-swipe-button": "src/components/motion-components/buttons/TextSwipeButton.tsx",
  "run-button": "src/components/motion-components/buttons/RunButton.tsx",
  "send-button": "src/components/motion-components/buttons/SendButton.tsx",
  "bookmark-button": "src/components/motion-components/buttons/BookmarkButton.tsx",
  "bubble-arrow-button": "src/components/motion-components/buttons/BubbleArrowButton.tsx",
  "interactive-face": "src/components/motion-components/InteractiveFace.tsx",
  "image-generation-preview": "src/components/motion-components/ImageGeneration.tsx",
  "continue-button": "src/components/motion-components/buttons/ContinueButton.tsx",
  "generate-button": "src/components/motion-components/buttons/GenerateButton.tsx",
  "accept-button": "src/components/motion-components/buttons/AcceptButton.tsx",
  "get-access-button": "src/components/motion-components/buttons/GetAccessButton.tsx",
  "mail-button": "src/components/motion-components/buttons/MailButton.tsx",
  "delete-button": "src/components/motion-components/buttons/TechnologyButton.tsx",
  "download-button": "src/components/motion-components/buttons/DownloadButton.tsx",
  "tabs-button": "src/components/motion-components/buttons/TabsButton.tsx",
  "services-indicator-button": "src/components/motion-components/buttons/ServicesIndicatorButton.tsx",
};

// Registry of official reviewed sources
export const serverSourceRegistry: Record<string, ComponentServerEntry> = {
  "smooth-time-picker": {
    registryId: "smooth-time-picker",
    sourceRevision: "1.0.0",
    snippets: {
      html: `<div class="smooth-time-picker"></div>`,
      css: `.smooth-time-picker { /* Tailwind styled component */ }`,
      get react() {
        return (
          readComponentFile("src/components/motion-components/inputs/SmoothTimePicker.tsx") ||
          ""
        );
      },
      get nextjs() {
        return (
          readComponentFile("src/components/motion-components/inputs/SmoothTimePicker.tsx") ||
          ""
        );
      },
    },
  },
};

export async function getOfficialComponentSource(
  registryId: string
): Promise<ComponentServerEntry | null> {
  // Check memory cache first (microseconds response)
  const cached = officialSourceCache.get(registryId);
  if (cached && (cached.snippets.react?.trim() || cached.snippets.nextjs?.trim())) {
    return cached;
  }

  const explicitEntry = serverSourceRegistry[registryId];
  if (explicitEntry) {
    const reactSource = explicitEntry.snippets.react?.trim() || "";
    const nextjsSource = explicitEntry.snippets.nextjs?.trim() || reactSource;
    if (reactSource || nextjsSource) {
      const entry: ComponentServerEntry = {
        registryId: explicitEntry.registryId,
        sourceRevision: explicitEntry.sourceRevision,
        snippets: {
          html: explicitEntry.snippets.html,
          css: explicitEntry.snippets.css,
          react: reactSource,
          nextjs: nextjsSource,
        },
      };
      officialSourceCache.set(registryId, entry);
      return entry;
    }
  }

  const filePath = officialComponentFiles[registryId];
  if (filePath) {
    const fileSource = readComponentFile(filePath);
    if (fileSource && fileSource.trim()) {
      const entry: ComponentServerEntry = {
        registryId,
        sourceRevision: "1.0.0",
        snippets: {
          html: `<div class="${registryId}"></div>`,
          css: `/* Tailwind styled component */`,
          react: fileSource,
          nextjs: fileSource,
        },
      };
      officialSourceCache.set(registryId, entry);
      return entry;
    }
  }

  return null;
}
