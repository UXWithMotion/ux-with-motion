const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

const regex = /<li>[\s\n]*\{\/\* Pricing link temporarily disabled \*\/\}[\s\n]*<\/li>/g;
code = code.replace(regex, '{/* Pricing link temporarily disabled */}');

fs.writeFileSync('src/components/layout/Footer.tsx', code);
console.log('Fixed empty li in Footer');

