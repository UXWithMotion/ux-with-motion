const fs = require('fs');
let code = fs.readFileSync('src/app/(marketing)/profile/ProfileClient.tsx', 'utf8');

code = code.replace(
  /\{(\/\* Upgrade button temporarily disabled \*\/)\}/g,
  'null $1'
);

fs.writeFileSync('src/app/(marketing)/profile/ProfileClient.tsx', code);
console.log('ProfileClient fixed');

