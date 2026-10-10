const fs = require('fs');
let code = fs.readFileSync('src/lib/registry/components.tsx', 'utf8');

const newEntry = `
  "expandable-search": {
    registryId: "expandable-search",
    name: "Expandable Search",
    category: "Inputs",
    component: ExpandableSearch,
    snippets: {
      html: \`<div class="expandable-search"></div>\`,
      css: \`.expandable-search { /* styles */ }\`,
      react: \`// React code for ExpandableSearch\`
    }
  },`;

if (!code.includes('"expandable-search"')) {
  code = code.replace(
    'import { SwipeArrowButton } from "@/components/motion-components/buttons/SwipeArrowButton";',
    'import { SwipeArrowButton } from "@/components/motion-components/buttons/SwipeArrowButton";\nimport { ExpandableSearch } from "@/components/motion-components/inputs/ExpandableSearch";'
  );
  
  code = code.replace(
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {',
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {' + newEntry
  );
  fs.writeFileSync('src/lib/registry/components.tsx', code);
  console.log("Successfully injected expandable-search");
} else {
  console.log("Already exists");
}

