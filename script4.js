const fs = require('fs');
let code = fs.readFileSync('src/lib/admin/components/queries.ts', 'utf8');

const regex = /const scrubbedData = data\.map\(comp => \{[\s\S]*?return scrubbedData;/;
const replacement = `const scrubbedData = data.map(comp => {
    // TEMPORARILY: Make all components free
    comp.access_tier = 'free';
    return comp;
  });

  return scrubbedData;`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/lib/admin/components/queries.ts', code);
  console.log("Successfully bypassed premium component lock");
} else {
  console.log("Failed to find scrub logic");
}
