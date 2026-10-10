const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

code = code.replace(
  '{ label: "Pricing", href: "/pricing" },',
  '// { label: "Pricing", href: "/pricing" },'
);

code = code.replace(
  /<Link href="\/pricing" className="hover:text-\[#7D7F82\] transition-colors leading-\[1\.2\]">[\s\n]*Pricing[\s\n]*<\/Link>/g,
  '{/* Pricing link temporarily disabled */}'
);

fs.writeFileSync('src/components/layout/Footer.tsx', code);
console.log('Footer updated');

