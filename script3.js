const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// The desktop link:
const desktopLinkRegex = /<Link[\s\n]*href="\/pricing"[\s\n]*className="[^"]*"[\s\n]*>[\s\n]*Pricing[\s\n]*<\/Link>/g;
code = code.replace(desktopLinkRegex, '{/* Pricing link temporarily disabled */}');

// The mobile link:
const mobileLinkRegex = /<Link[\s\n]*href="\/pricing"[\s\n]*onClick=\{\(\) => setMobileMenuOpen\(false\)\}[\s\n]*className="[^"]*"[\s\n]*>[\s\n]*Pricing[\s\n]*<\/Link>/g;
code = code.replace(mobileLinkRegex, '{/* Mobile Pricing link temporarily disabled */}');

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
console.log('Navbar updated via regex');
