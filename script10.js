const fs = require('fs');
let code = fs.readFileSync('src/lib/registry/components.tsx', 'utf8');

const newEntry = `
  "swipe-arrow-button": {
    registryId: "swipe-arrow-button",
    name: "Swipe Arrow Button",
    category: "Buttons",
    component: SwipeArrowButton,
    snippets: {
      html: \`<button class="swipe-arrow-btn">Continue</button>\`,
      css: \`.swipe-arrow-btn { /* styles */ }\`,
      react: \`// React code for SwipeArrowButton\`
    }
  },`;

if (!code.includes('"swipe-arrow-button"')) {
  code = code.replace(
    'import { MotionToggle } from "@/components/motion-components/buttons/MotionToggle";',
    'import { MotionToggle } from "@/components/motion-components/buttons/MotionToggle";\nimport { SwipeArrowButton } from "@/components/motion-components/buttons/SwipeArrowButton";'
  );
  
  code = code.replace(
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {',
    'export const componentRegistry: Record<string, ComponentRegistryEntry> = {' + newEntry
  );
  fs.writeFileSync('src/lib/registry/components.tsx', code);
  console.log("Successfully injected swipe-arrow-button");
} else {
  console.log("Already exists");
}

