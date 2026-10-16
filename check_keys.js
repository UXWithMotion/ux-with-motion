const fs = require('fs');
const content = fs.readFileSync('src/lib/registry/components.tsx', 'utf8');
const lines = content.split('\n');
const keys = [];
for (const line of lines) {
  const m = line.match(/^\s*"([a-zA-Z0-9_-]+)":\s*\{/);
  if (m) keys.push(m[1]);
}
console.log('Registry keys:', keys);

