const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Update Left container
code = code.replace(
  '<div className="flex items-center gap-[29px] shrink-0">',
  '<div className="flex-1 flex items-center justify-start gap-[29px] min-w-0">'
);

// Update Center container
// Currently: <div className={w-full mx-6 transition-all duration-300 ease-in-out relative z-50 }>
// To keep the max-width expanding from the center, we need the container itself to be max-width and centered, or let the container take natural space and inside be max-width.
// If center element is max-w, the flex-1 left/right will center it perfectly.
code = code.replace(
  /className=\{\w-full mx-6 transition-all duration-300 ease-in-out relative z-50 \$\{isSearchFocused \? "max-w-\[700px\]" : "max-w-\[397px\]"[\s\n]*\}\\}/,
  'className={w-full mx-6 transition-all duration-300 ease-in-out relative z-50 }'
);

// Update Right container
code = code.replace(
  '<div className="flex items-center gap-[32px] shrink-0">',
  '<div className="flex-1 flex items-center justify-end gap-[32px] min-w-0">'
);

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
console.log('Navbar layout updated for perfect centering');
