import "server-only";
import fs from "fs";
import path from "path";
import { ComponentServerEntry } from "./types";

// Helper to safely read reviewed component source from disk
function readComponentFile(relativeFilePath: string): string | null {
  try {
    const fullPath = path.join(/*turbopackIgnore: true*/ process.cwd(), relativeFilePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf-8");
    }
  } catch (err) {
    console.error(`Failed to read source file at ${relativeFilePath}:`, err);
  }
  return null;
}

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
      nextjs: "components/inputs/SmoothTimePicker.tsx",
    },
  },
};

export async function getOfficialComponentSource(
  registryId: string
): Promise<ComponentServerEntry | null> {
  const entry = serverSourceRegistry[registryId];
  if (!entry) return null;

  return {
    registryId: entry.registryId,
    sourceRevision: entry.sourceRevision,
    snippets: {
      html: entry.snippets.html,
      css: entry.snippets.css,
      react: entry.snippets.react,
      nextjs: entry.snippets.nextjs,
    },
  };
}
