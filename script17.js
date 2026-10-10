const fs = require('fs');
let code = fs.readFileSync('src/lib/registry/components.tsx', 'utf8');

const newEntry = `
  "view-more-eye-button": {
    registryId: "view-more-eye-button",
    name: "View More Eye Button",
    category: "Buttons",
    component: ViewMoreEyeButton,
    snippets: {
      html: \`<button class="view-more-eye">View more</button>\`,
      css: \`.view-more-eye { /* styles */ }\`,
      react: \`// React code for ViewMoreEyeButton\`
    }
  },`;

if (!code.includes('"view-more-eye-button"')) {
  code = code.replace(
    'import { NeoDeleteButtonShowcase } from "@/components/motion-components/buttons/NeoDeleteButton";',
    'import { NeoDeleteButtonShowcase } from "@/components/motion-components/buttons/NeoDeleteButton";\nimport { ViewMoreEyeButton } from "@/components/motion-components/buttons/ViewMoreEyeButton";'
  );
  
  code = code.replace(
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {',
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {' + newEntry
  );
  fs.writeFileSync('src/lib/registry/components.tsx', code);
  console.log("Successfully injected view-more-eye-button");
} else {
  console.log("Already exists");
}

