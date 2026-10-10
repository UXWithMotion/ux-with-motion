const fs = require('fs');

function fixFile(path) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(
    /type: "spring",[\s\n]*stiffness: 150,[\s\n]*damping: 20,[\s\n]*mass: 0\.8,?/g,
    'type: "spring" as const,\n    stiffness: 150,\n    damping: 20,\n    mass: 0.8,'
  );
  fs.writeFileSync(path, code);
}

fixFile('src/components/motion-components/buttons/NeoDeleteButton.tsx');
fixFile('src/components/motion-components/inputs/ExpandableSearch.tsx');
console.log('Fixed TS inference issue on both files');

