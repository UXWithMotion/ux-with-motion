const fs = require('fs');
let code = fs.readFileSync('src/lib/registry/components.tsx', 'utf8');

const newEntry = `
  "neo-delete-button": {
    registryId: "neo-delete-button",
    name: "Neo Delete Button",
    category: "Buttons",
    component: NeoDeleteButtonShowcase,
    snippets: {
      html: \`<button class="neo-delete">Delete</button>\`,
      css: \`.neo-delete { /* styles */ }\`,
      react: \`// React code for NeoDeleteButton\`
    }
  },`;

if (!code.includes('"neo-delete-button"')) {
  code = code.replace(
    'import { ExpandableSearch } from "@/components/motion-components/inputs/ExpandableSearch";',
    'import { ExpandableSearch } from "@/components/motion-components/inputs/ExpandableSearch";\nimport { NeoDeleteButtonShowcase } from "@/components/motion-components/buttons/NeoDeleteButton";'
  );
  
  code = code.replace(
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {',
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {' + newEntry
  );
  fs.writeFileSync('src/lib/registry/components.tsx', code);
  console.log("Successfully injected neo-delete-button");
} else {
  console.log("Already exists");
}

