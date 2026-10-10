const fs = require('fs');
let code = fs.readFileSync('src/components/motion-components/buttons/ViewMoreEyeButton.tsx', 'utf8');

code = code.replace(
  /delay: 0\.3, \/\/ blink slightly after settling in the center/,
  'delay: 0.3, // blink slightly after settling in the center\n                repeat: Infinity,\n                repeatDelay: 2,'
);

fs.writeFileSync('src/components/motion-components/buttons/ViewMoreEyeButton.tsx', code);
console.log('Added repeating blink animation');
