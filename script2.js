const fs = require('fs');
let code = fs.readFileSync('src/lib/registry/components.tsx', 'utf8');

const newEntry = `
  "motion-toggle": {
    registryId: "motion-toggle",
    name: "Motion Toggle",
    category: "Buttons",
    component: MotionToggle,
    snippets: {
      html: \`<button class="motion-toggle"></button>\`,
      css: \`.motion-toggle { /* styles */ }\`,
      react: \`// React code for MotionToggle\`
    }
  },`;

if (!code.includes('"motion-toggle"')) {
  code = code.replace(
    'import { FourItemTabs } from "@/components/motion-components/buttons/FourItemTabs";',
    'import { FourItemTabs } from "@/components/motion-components/buttons/FourItemTabs";\nimport { MotionToggle } from "@/components/motion-components/buttons/MotionToggle";'
  );
  
  code = code.replace(
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {',
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {' + newEntry
  );
  fs.writeFileSync('src/lib/registry/components.tsx', code);
  console.log("Successfully injected motion-toggle");
} else {
  console.log("Already exists");
}

